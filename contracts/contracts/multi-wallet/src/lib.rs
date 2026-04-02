#![no_std]

use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, Vec};

mod events;
mod storage;
mod types;

pub use types::{Error, WalletKey, MAX_WALLETS};

#[contract]
pub struct MultiWalletContract;

#[contractimpl]
impl MultiWalletContract {
    /// Initialize the multi-wallet contract. Called once.
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if storage::is_initialized(&env) {
            return Err(Error::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_admin(&env, &admin);
        Ok(())
    }

    /// Link a new wallet to an agent identity.
    ///
    /// - Both `authority` and `new_wallet` must authorize
    /// - On first call for an agent, `authority` becomes the stored authority
    /// - Max 5 linked wallets per agent
    /// - A wallet can only be linked to one agent
    pub fn link_wallet(
        env: Env,
        agent_id: u64,
        authority: Address,
        new_wallet: Address,
    ) -> Result<(), Error> {
        let _ = storage::get_admin(&env)?;
        authority.require_auth();
        new_wallet.require_auth();

        // If no authority stored yet, establish it.
        if !storage::has_authority(&env, agent_id) {
            storage::set_authority(&env, agent_id, &authority);
        } else {
            // Verify caller is the stored authority.
            let stored = storage::get_authority(&env, agent_id)?;
            if stored != authority {
                return Err(Error::NotAuthority);
            }
        }

        // Check wallet not already linked to any agent.
        if let Some(_existing_agent) = storage::get_wallet_agent(&env, &new_wallet) {
            return Err(Error::WalletAlreadyLinked);
        }

        // Check max wallets.
        let mut wallets = storage::get_linked_wallets(&env, agent_id);
        if wallets.len() >= MAX_WALLETS {
            return Err(Error::MaxWalletsReached);
        }

        // Add wallet.
        wallets.push_back(new_wallet.clone());
        storage::set_linked_wallets(&env, agent_id, &wallets);
        storage::set_wallet_agent(&env, &new_wallet, agent_id);

        events::emit_linked(&env, agent_id, &new_wallet);
        Ok(())
    }

    /// Unlink a wallet from an agent identity.
    ///
    /// - Only the authority can unlink
    /// - Cannot unlink the authority wallet itself
    pub fn unlink_wallet(
        env: Env,
        agent_id: u64,
        authority: Address,
        wallet: Address,
    ) -> Result<(), Error> {
        let _ = storage::get_admin(&env)?;
        authority.require_auth();

        let stored = storage::get_authority(&env, agent_id)?;
        if stored != authority {
            return Err(Error::NotAuthority);
        }

        // Cannot unlink authority.
        if wallet == authority {
            return Err(Error::CannotUnlinkAuthority);
        }

        // Find and remove wallet from list.
        let wallets = storage::get_linked_wallets(&env, agent_id);
        let mut found = false;
        let mut new_wallets = Vec::new(&env);
        for i in 0..wallets.len() {
            let w = wallets.get(i).unwrap();
            if w == wallet {
                found = true;
            } else {
                new_wallets.push_back(w);
            }
        }

        if !found {
            return Err(Error::WalletNotLinked);
        }

        storage::set_linked_wallets(&env, agent_id, &new_wallets);
        storage::remove_wallet_agent(&env, &wallet);

        events::emit_unlinked(&env, agent_id, &wallet);
        Ok(())
    }

    /// Get all linked wallets for an agent.
    pub fn get_linked_wallets(env: Env, agent_id: u64) -> Vec<Address> {
        storage::get_linked_wallets(&env, agent_id)
    }

    /// Reverse lookup: check if a wallet is linked to any agent.
    /// Returns the agent_id if linked, or nothing if not.
    pub fn is_linked(env: Env, wallet: Address) -> Option<u64> {
        storage::get_wallet_agent(&env, &wallet)
    }

    /// Transfer authority to a different linked wallet.
    ///
    /// - Current authority must authorize
    /// - New authority must be in the linked wallets list
    pub fn transfer_authority(
        env: Env,
        agent_id: u64,
        current_authority: Address,
        new_authority: Address,
    ) -> Result<(), Error> {
        let _ = storage::get_admin(&env)?;
        current_authority.require_auth();

        let stored = storage::get_authority(&env, agent_id)?;
        if stored != current_authority {
            return Err(Error::NotAuthority);
        }

        // New authority must be a linked wallet.
        let wallets = storage::get_linked_wallets(&env, agent_id);
        let mut is_linked = false;
        for i in 0..wallets.len() {
            if wallets.get(i).unwrap() == new_authority {
                is_linked = true;
                break;
            }
        }
        if !is_linked {
            return Err(Error::WalletNotLinked);
        }

        storage::set_authority(&env, agent_id, &new_authority);

        events::emit_authority_transferred(&env, agent_id, &current_authority, &new_authority);
        Ok(())
    }

    /// Get the current authority wallet for an agent.
    pub fn get_authority(env: Env, agent_id: u64) -> Result<Address, Error> {
        storage::get_authority(&env, agent_id)
    }

    /// Upgrade contract WASM. Admin only.
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();
        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }

    /// Contract version.
    pub fn version(_env: Env) -> u32 {
        1
    }
}

mod test;

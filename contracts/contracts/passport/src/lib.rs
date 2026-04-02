#![no_std]

use soroban_sdk::{contract, contractclient, contractimpl, Address, BytesN, Env, String};

mod events;
mod storage;
mod types;

pub use types::{Error, PassportInfo, PassportKey};

// ── Cross-contract client for Verification ──

#[contractclient(name = "VerificationClient")]
pub trait VerificationInterface {
    fn is_verified(env: Env, agent_id: u64) -> bool;
}

#[contract]
pub struct PassportContract;

#[contractimpl]
impl PassportContract {
    /// Initialize the passport contract. Called once.
    pub fn initialize(
        env: Env,
        admin: Address,
        verification_contract: Address,
    ) -> Result<(), Error> {
        if storage::is_initialized(&env) {
            return Err(Error::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_admin(&env, &admin);
        storage::set_verification_contract(&env, &verification_contract);
        env.storage()
            .instance()
            .set(&PassportKey::PassportCount, &0u64);
        Ok(())
    }

    /// Mint a soulbound passport for a verified agent.
    ///
    /// - `owner` must authorize the call
    /// - Agent must be verified (cross-contract check)
    /// - One passport per agent
    /// - NO transfer or approve — soulbound by design
    pub fn mint_passport(
        env: Env,
        agent_id: u64,
        owner: Address,
        metadata_uri: String,
    ) -> Result<u64, Error> {
        let _ = storage::get_admin(&env)?;
        owner.require_auth();

        // Check agent is verified via cross-contract call.
        let verification_addr = storage::get_verification_contract(&env);
        let client = VerificationClient::new(&env, &verification_addr);
        if !client.is_verified(&agent_id) {
            return Err(Error::NotVerified);
        }

        // One passport per agent.
        if storage::has_passport(&env, agent_id) {
            return Err(Error::AlreadyHasPassport);
        }

        let passport_id = storage::increment_passport_count(&env);

        let info = PassportInfo {
            id: passport_id,
            agent_id,
            owner: owner.clone(),
            minted_at: env.ledger().timestamp(),
            metadata_uri,
            reputation_snapshot: 0, // Filled by API layer in future
            revoked: false,
        };

        storage::set_passport(&env, agent_id, &info);
        events::emit_minted(&env, agent_id, passport_id, &owner);

        Ok(passport_id)
    }

    /// Get passport data for an agent.
    pub fn get_passport(env: Env, agent_id: u64) -> Result<PassportInfo, Error> {
        storage::get_passport(&env, agent_id)
    }

    /// Check if an agent has a passport.
    pub fn has_passport(env: Env, agent_id: u64) -> bool {
        storage::has_passport(&env, agent_id)
    }

    /// Update the metadata URI (admin only — for image regeneration).
    pub fn update_metadata_uri(
        env: Env,
        agent_id: u64,
        new_uri: String,
    ) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();

        let mut info = storage::get_passport(&env, agent_id)?;
        info.metadata_uri = new_uri;
        storage::set_passport(&env, agent_id, &info);
        Ok(())
    }

    /// Revoke a passport (admin only). Marks as revoked, doesn't delete.
    pub fn revoke_passport(env: Env, agent_id: u64) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();

        let mut info = storage::get_passport(&env, agent_id)?;
        info.revoked = true;
        storage::set_passport(&env, agent_id, &info);

        events::emit_revoked(&env, agent_id);
        Ok(())
    }

    /// Total passports minted.
    pub fn passport_count(env: Env) -> u64 {
        storage::get_passport_count(&env)
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

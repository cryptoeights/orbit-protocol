#![no_std]

use soroban_sdk::{contract, contractimpl, token, Address, BytesN, Env};

mod events;
mod storage;
mod types;

pub use types::{Error, VerificationInfo, VerificationTier, VerifyKey};

#[contract]
pub struct VerificationContract;

#[contractimpl]
impl VerificationContract {
    /// Initialize the verification contract. Called once.
    ///
    /// - `treasury`: address that receives verification fees
    /// - `xlm_token`: Stellar Asset Contract address for native XLM
    /// - `basic_fee` / `premium_fee`: fee amounts in stroops (7 decimal places)
    pub fn initialize(
        env: Env,
        admin: Address,
        treasury: Address,
        xlm_token: Address,
        basic_fee: i128,
        premium_fee: i128,
    ) -> Result<(), Error> {
        if storage::is_initialized(&env) {
            return Err(Error::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_admin(&env, &admin);
        storage::set_treasury(&env, &treasury);
        storage::set_xlm_token(&env, &xlm_token);
        storage::set_basic_fee(&env, basic_fee);
        storage::set_premium_fee(&env, premium_fee);
        Ok(())
    }

    /// Verify an agent by paying the appropriate fee.
    ///
    /// - `payer` authorizes the XLM transfer
    /// - `tier` selects Basic (10 XLM) or Premium (100 XLM)
    /// - Fee is transferred from payer to treasury
    pub fn verify_agent(
        env: Env,
        agent_id: u64,
        payer: Address,
        tier: VerificationTier,
    ) -> Result<(), Error> {
        let _ = storage::get_admin(&env)?;
        payer.require_auth();

        // Reject if already verified.
        if let Ok(info) = storage::get_verification(&env, agent_id) {
            if info.verified {
                return Err(Error::AlreadyVerified);
            }
        }

        // Determine fee by tier.
        let fee = match tier {
            VerificationTier::Basic => storage::get_basic_fee(&env),
            VerificationTier::Premium => storage::get_premium_fee(&env),
            VerificationTier::None => return Err(Error::InvalidTier),
        };

        // Transfer XLM from payer to treasury.
        let xlm_token = storage::get_xlm_token(&env);
        let treasury = storage::get_treasury(&env);
        let xlm = token::TokenClient::new(&env, &xlm_token);
        xlm.transfer(&payer, &treasury, &fee);

        // Store verification.
        let info = VerificationInfo {
            agent_id,
            verified: true,
            tier: tier.clone(),
            verified_at: env.ledger().timestamp(),
            fee_paid: fee,
        };
        storage::set_verification(&env, agent_id, &info);
        storage::add_total_collected(&env, fee);

        events::emit_verified(&env, agent_id, &tier, fee);
        Ok(())
    }

    /// Check if an agent is verified. Used by other contracts (e.g., Reputation).
    pub fn is_verified(env: Env, agent_id: u64) -> bool {
        storage::get_verification(&env, agent_id)
            .map(|v| v.verified)
            .unwrap_or(false)
    }

    /// Get full verification details.
    pub fn get_verification(env: Env, agent_id: u64) -> Result<VerificationInfo, Error> {
        storage::get_verification(&env, agent_id)
    }

    /// Revoke an agent's verification. Admin only.
    pub fn revoke_verification(env: Env, agent_id: u64) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();

        let mut info = storage::get_verification(&env, agent_id)?;
        info.verified = false;
        storage::set_verification(&env, agent_id, &info);

        events::emit_revoked(&env, agent_id);
        Ok(())
    }

    /// Update verification fee. Admin only.
    pub fn set_fee(env: Env, tier: VerificationTier, amount: i128) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();

        match tier {
            VerificationTier::Basic => storage::set_basic_fee(&env, amount),
            VerificationTier::Premium => storage::set_premium_fee(&env, amount),
            VerificationTier::None => return Err(Error::InvalidTier),
        }
        Ok(())
    }

    /// Get total fees collected.
    pub fn get_total_collected(env: Env) -> i128 {
        storage::get_total_collected(&env)
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

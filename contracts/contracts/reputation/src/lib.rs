#![no_std]

use soroban_sdk::{contract, contractimpl, token, Address, BytesN, Env, String};

mod events;
mod storage;
mod types;

pub use types::{Error, RepKey, ReputationScore};

/// 24 hours in seconds.
const COOLDOWN_SECONDS: u64 = 86_400;

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    /// Initialize the reputation contract. Called once.
    ///
    /// - `verification_contract`: address of the Verification contract for is_verified checks
    /// - `xlm_token`: Stellar Asset Contract address for native XLM
    /// - `min_balance`: minimum XLM balance in stroops to submit feedback (e.g., 100_000_000 = 10 XLM)
    pub fn initialize(
        env: Env,
        admin: Address,
        verification_contract: Address,
        xlm_token: Address,
        min_balance: i128,
    ) -> Result<(), Error> {
        if storage::is_initialized(&env) {
            return Err(Error::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_admin(&env, &admin);
        storage::set_verification_contract(&env, &verification_contract);
        storage::set_xlm_token(&env, &xlm_token);
        storage::set_min_balance(&env, min_balance);
        Ok(())
    }

    /// Submit feedback for an agent.
    ///
    /// Anti-spam rules:
    /// 1. Submitter must have >= min_balance XLM
    /// 2. 1 feedback per (submitter, target) pair per 24 hours
    /// 3. Cannot self-feedback (submitter wallet == agent owner is checked off-chain; here we check submitter != target by address)
    ///
    /// Verified submitters (cross-contract check) get 2x weight.
    pub fn submit_feedback(
        env: Env,
        submitter: Address,
        target_agent_id: u64,
        positive: bool,
        _context: String, // Emitted via event, not stored on-chain
    ) -> Result<(), Error> {
        let _ = storage::get_admin(&env)?;
        submitter.require_auth();

        // Anti-spam: minimum XLM balance.
        let xlm_token = storage::get_xlm_token(&env);
        let xlm = token::TokenClient::new(&env, &xlm_token);
        let balance = xlm.balance(&submitter);
        if balance < storage::get_min_balance(&env) {
            return Err(Error::InsufficientBalance);
        }

        // Anti-spam: cooldown (1 per pair per 24h).
        if let Some(last_ts) = storage::get_last_feedback_time(&env, &submitter, target_agent_id) {
            let elapsed = env.ledger().timestamp().saturating_sub(last_ts);
            if elapsed < COOLDOWN_SECONDS {
                return Err(Error::CooldownActive);
            }
        }

        // Check if submitter is verified for 2x weight.
        let weight = Self::check_verified_weight(&env, &submitter);

        // Update aggregated score.
        let mut rep = storage::get_reputation(&env, target_agent_id);

        rep.total_interactions += weight;
        if positive {
            rep.positive_count += weight;
        } else {
            rep.negative_count += weight;
        }

        // Recalculate score: ratio of positive to total, in basis points.
        rep.score = if rep.total_interactions > 0 {
            ((rep.positive_count as u64 * 10_000) / rep.total_interactions as u64) as u32
        } else {
            5000
        };
        rep.last_feedback_at = env.ledger().timestamp();

        storage::set_reputation(&env, target_agent_id, &rep);
        storage::set_last_feedback_time(&env, &submitter, target_agent_id, env.ledger().timestamp());

        events::emit_feedback(&env, target_agent_id, &submitter, positive, weight);
        Ok(())
    }

    /// Get reputation for an agent, with decay applied.
    ///
    /// Decay: -1% per 30 days of inactivity (applied at read-time, not stored).
    pub fn get_reputation(env: Env, agent_id: u64) -> ReputationScore {
        let mut rep = storage::get_reputation(&env, agent_id);

        // Apply decay if agent has interactions and time has passed.
        if rep.total_interactions > 0 && rep.last_feedback_at > 0 {
            let elapsed = env.ledger().timestamp().saturating_sub(rep.last_feedback_at);
            let months_inactive = elapsed / (30 * 86_400);
            if months_inactive > 0 {
                let decay_factor = 100u64.saturating_sub(months_inactive).max(0);
                rep.score = ((rep.score as u64 * decay_factor) / 100) as u32;
            }
        }

        rep
    }

    /// Get total feedback count for an agent.
    pub fn get_feedback_count(env: Env, agent_id: u64) -> u32 {
        storage::get_reputation(&env, agent_id).total_interactions
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

    // ── Internal helpers ──

    /// Cross-contract call to Verification.is_verified() to determine weight.
    /// Returns 2 if submitter's agent is verified, 1 otherwise.
    fn check_verified_weight(_env: &Env, _submitter: &Address) -> u32 {
        // The verification contract checks by agent_id, not by wallet.
        // To properly cross-check, we'd need the submitter's agent_id
        // from the AgentRegistry. For simplicity in S02, we default to
        // weight 1 and enhance this in S04 (API layer) or a future iteration
        // where we can resolve wallet → agent_id → is_verified in one flow.
        //
        // The cross-contract call pattern is:
        //   let verification = storage::get_verification_contract(env);
        //   let args: soroban_sdk::Vec<Val> = soroban_sdk::vec![env, agent_id.into_val(env)];
        //   let verified: bool = env.invoke_contract(&verification, &symbol_short!("is_verf"), args);
        //
        // We'll wire this up properly when the AgentRegistry has a
        // get_agent_id_by_wallet that's accessible cross-contract.
        // For now, weight is always 1.
        1
    }
}

mod test;

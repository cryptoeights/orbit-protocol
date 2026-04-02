#![no_std]

use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, String};

mod events;
mod storage;
mod types;

pub use types::{AgentInfo, AgentStatus, DataKey, Error};

#[contract]
pub struct AgentRegistry;

// ── Input validation constants ──
const NAME_MIN_LEN: u32 = 3;
const NAME_MAX_LEN: u32 = 64;
const DESC_MAX_LEN: u32 = 500;
const URI_MAX_LEN: u32 = 256;

/// Validate string length falls within [min, max]. Returns InvalidInput on failure.
fn validate_len(s: &String, min: u32, max: u32) -> Result<(), Error> {
    let len = s.len();
    if len < min || len > max {
        return Err(Error::InvalidInput);
    }
    Ok(())
}

#[contractimpl]
impl AgentRegistry {
    /// Initialize the contract with an admin address.
    /// Must be called exactly once before any other function.
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if storage::is_initialized(&env) {
            return Err(Error::AlreadyInitialized);
        }
        admin.require_auth();
        storage::set_admin(&env, &admin);
        env.storage()
            .instance()
            .set(&DataKey::AgentCount, &0u64);
        Ok(())
    }

    /// Register a new agent identity.
    ///
    /// - `owner` must authorize the call.
    /// - One wallet can only register one agent.
    /// - Returns the new agent's ID.
    pub fn register_agent(
        env: Env,
        owner: Address,
        name: String,
        description: String,
        metadata_uri: String,
    ) -> Result<u64, Error> {
        // Contract must be initialized.
        let _ = storage::get_admin(&env)?;

        owner.require_auth();

        // Reject if wallet already registered.
        if storage::has_wallet(&env, &owner) {
            return Err(Error::AlreadyRegistered);
        }

        // Validate input lengths.
        validate_len(&name, NAME_MIN_LEN, NAME_MAX_LEN)?;
        validate_len(&description, 0, DESC_MAX_LEN)?;
        validate_len(&metadata_uri, 0, URI_MAX_LEN)?;

        // Allocate ID.
        let agent_id = storage::increment_agent_count(&env);
        let now = env.ledger().timestamp();

        let agent = AgentInfo {
            id: agent_id,
            owner: owner.clone(),
            name,
            description,
            metadata_uri,
            status: AgentStatus::Active,
            created_at: now,
            updated_at: now,
        };

        // Persist.
        storage::set_agent(&env, agent_id, &agent);
        storage::set_wallet_agent(&env, &owner, agent_id);

        // Event.
        events::emit_register(&env, agent_id, &owner);

        Ok(agent_id)
    }

    /// Update an existing agent's metadata.
    ///
    /// Only the agent's owner can update.
    pub fn update_agent(
        env: Env,
        agent_id: u64,
        name: String,
        description: String,
        metadata_uri: String,
    ) -> Result<(), Error> {
        let mut agent = storage::get_agent(&env, agent_id)?;
        agent.owner.require_auth();

        // Validate input lengths.
        validate_len(&name, NAME_MIN_LEN, NAME_MAX_LEN)?;
        validate_len(&description, 0, DESC_MAX_LEN)?;
        validate_len(&metadata_uri, 0, URI_MAX_LEN)?;

        agent.name = name;
        agent.description = description;
        agent.metadata_uri = metadata_uri;
        agent.updated_at = env.ledger().timestamp();

        storage::set_agent(&env, agent_id, &agent);
        events::emit_update(&env, agent_id);

        Ok(())
    }

    /// Deactivate an agent. Only the owner can deactivate.
    pub fn deactivate_agent(env: Env, agent_id: u64) -> Result<(), Error> {
        let mut agent = storage::get_agent(&env, agent_id)?;
        agent.owner.require_auth();

        if agent.status == AgentStatus::Deactivated {
            return Err(Error::AlreadyDeactivated);
        }

        agent.status = AgentStatus::Deactivated;
        agent.updated_at = env.ledger().timestamp();

        storage::set_agent(&env, agent_id, &agent);
        events::emit_deactivate(&env, agent_id);

        Ok(())
    }

    /// Get agent by numeric ID.
    pub fn get_agent(env: Env, agent_id: u64) -> Result<AgentInfo, Error> {
        storage::get_agent(&env, agent_id)
    }

    /// Get agent by wallet address (reverse lookup).
    pub fn get_agent_by_wallet(env: Env, wallet: Address) -> Result<AgentInfo, Error> {
        let agent_id = storage::get_agent_id_by_wallet(&env, &wallet)?;
        storage::get_agent(&env, agent_id)
    }

    /// Get total registered agent count.
    pub fn agent_count(env: Env) -> u64 {
        storage::get_agent_count(&env)
    }

    /// Upgrade the contract WASM. Admin only.
    /// Used for testnet iteration; production should add a timelock.
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) -> Result<(), Error> {
        let admin = storage::get_admin(&env)?;
        admin.require_auth();
        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }

    /// Return the current contract version. Useful for verifying upgrades.
    pub fn version(_env: Env) -> u32 {
        1
    }
}

mod test;

use soroban_sdk::{Address, Env};

use crate::types::{AgentInfo, DataKey, Error};

// TTL constants in ledger counts.
// ~1 day minimum before storage entry is at risk.
const TTL_THRESHOLD: u32 = 17_280;
// ~30 days max extension on each access.
const TTL_EXTEND: u32 = 518_400;

// ── Persistent storage: Agent data ──

pub fn get_agent(env: &Env, agent_id: u64) -> Result<AgentInfo, Error> {
    let key = DataKey::Agent(agent_id);
    let agent: AgentInfo = env
        .storage()
        .persistent()
        .get(&key)
        .ok_or(Error::NotFound)?;
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
    Ok(agent)
}

pub fn set_agent(env: &Env, agent_id: u64, agent: &AgentInfo) {
    let key = DataKey::Agent(agent_id);
    env.storage().persistent().set(&key, agent);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
}

#[allow(dead_code)]
pub fn has_agent(env: &Env, agent_id: u64) -> bool {
    env.storage()
        .persistent()
        .has(&DataKey::Agent(agent_id))
}

// ── Persistent storage: Wallet → Agent ID mapping ──

pub fn get_agent_id_by_wallet(env: &Env, wallet: &Address) -> Result<u64, Error> {
    let key = DataKey::WalletAgent(wallet.clone());
    let id: u64 = env
        .storage()
        .persistent()
        .get(&key)
        .ok_or(Error::NotFound)?;
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
    Ok(id)
}

pub fn set_wallet_agent(env: &Env, wallet: &Address, agent_id: u64) {
    let key = DataKey::WalletAgent(wallet.clone());
    env.storage().persistent().set(&key, &agent_id);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
}

pub fn has_wallet(env: &Env, wallet: &Address) -> bool {
    env.storage()
        .persistent()
        .has(&DataKey::WalletAgent(wallet.clone()))
}

// ── Instance storage: Admin ──

pub fn get_admin(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(Error::NotInitialized)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

// ── Instance storage: Agent count ──

pub fn get_agent_count(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::AgentCount)
        .unwrap_or(0)
}

pub fn increment_agent_count(env: &Env) -> u64 {
    let count = get_agent_count(env) + 1;
    env.storage().instance().set(&DataKey::AgentCount, &count);
    count
}

use soroban_sdk::{Address, Env};

use crate::types::{Error, PassportInfo, PassportKey};

const TTL_THRESHOLD: u32 = 17_280;
const TTL_EXTEND: u32 = 518_400;

// ── Persistent: Passport data (keyed by agent_id) ──

pub fn get_passport(env: &Env, agent_id: u64) -> Result<PassportInfo, Error> {
    let key = PassportKey::Passport(agent_id);
    let info: PassportInfo = env
        .storage()
        .persistent()
        .get(&key)
        .ok_or(Error::PassportNotFound)?;
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
    Ok(info)
}

pub fn set_passport(env: &Env, agent_id: u64, info: &PassportInfo) {
    let key = PassportKey::Passport(agent_id);
    env.storage().persistent().set(&key, info);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
}

pub fn has_passport(env: &Env, agent_id: u64) -> bool {
    env.storage()
        .persistent()
        .has(&PassportKey::Passport(agent_id))
}

// ── Instance: Config ──

pub fn get_admin(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&PassportKey::Admin)
        .ok_or(Error::NotInitialized)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&PassportKey::Admin, admin);
}

pub fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&PassportKey::Admin)
}

pub fn get_verification_contract(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&PassportKey::VerificationContract)
        .unwrap()
}

pub fn set_verification_contract(env: &Env, addr: &Address) {
    env.storage()
        .instance()
        .set(&PassportKey::VerificationContract, addr);
}

pub fn get_passport_count(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&PassportKey::PassportCount)
        .unwrap_or(0)
}

pub fn increment_passport_count(env: &Env) -> u64 {
    let count = get_passport_count(env) + 1;
    env.storage()
        .instance()
        .set(&PassportKey::PassportCount, &count);
    count
}

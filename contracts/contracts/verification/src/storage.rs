use soroban_sdk::{Address, Env};

use crate::types::{Error, VerificationInfo, VerifyKey};

const TTL_THRESHOLD: u32 = 17_280;
const TTL_EXTEND: u32 = 518_400;

// ── Persistent: Verification data ──

pub fn get_verification(env: &Env, agent_id: u64) -> Result<VerificationInfo, Error> {
    let key = VerifyKey::Verification(agent_id);
    let info: VerificationInfo = env
        .storage()
        .persistent()
        .get(&key)
        .ok_or(Error::NotVerified)?;
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
    Ok(info)
}

pub fn set_verification(env: &Env, agent_id: u64, info: &VerificationInfo) {
    let key = VerifyKey::Verification(agent_id);
    env.storage().persistent().set(&key, info);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
}

#[allow(dead_code)]
pub fn has_verification(env: &Env, agent_id: u64) -> bool {
    env.storage()
        .persistent()
        .has(&VerifyKey::Verification(agent_id))
}

// ── Instance: Config ──

pub fn get_admin(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&VerifyKey::Admin)
        .ok_or(Error::NotInitialized)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&VerifyKey::Admin, admin);
}

pub fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&VerifyKey::Admin)
}

pub fn get_treasury(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&VerifyKey::Treasury)
        .unwrap()
}

pub fn set_treasury(env: &Env, treasury: &Address) {
    env.storage().instance().set(&VerifyKey::Treasury, treasury);
}

pub fn get_xlm_token(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&VerifyKey::XlmToken)
        .unwrap()
}

pub fn set_xlm_token(env: &Env, xlm_token: &Address) {
    env.storage()
        .instance()
        .set(&VerifyKey::XlmToken, xlm_token);
}

pub fn get_basic_fee(env: &Env) -> i128 {
    env.storage()
        .instance()
        .get(&VerifyKey::BasicFee)
        .unwrap()
}

pub fn set_basic_fee(env: &Env, fee: i128) {
    env.storage().instance().set(&VerifyKey::BasicFee, &fee);
}

pub fn get_premium_fee(env: &Env) -> i128 {
    env.storage()
        .instance()
        .get(&VerifyKey::PremiumFee)
        .unwrap()
}

pub fn set_premium_fee(env: &Env, fee: i128) {
    env.storage().instance().set(&VerifyKey::PremiumFee, &fee);
}

pub fn get_total_collected(env: &Env) -> i128 {
    env.storage()
        .instance()
        .get(&VerifyKey::TotalCollected)
        .unwrap_or(0)
}

pub fn add_total_collected(env: &Env, amount: i128) {
    let total = get_total_collected(env) + amount;
    env.storage()
        .instance()
        .set(&VerifyKey::TotalCollected, &total);
}

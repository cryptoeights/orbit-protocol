use soroban_sdk::{Address, Env};

use crate::types::{Error, RepKey, ReputationScore};

const TTL_THRESHOLD: u32 = 17_280;
const TTL_EXTEND: u32 = 518_400;
// Cooldown TTL: ~1 day in ledgers.
const COOLDOWN_TTL: u32 = 17_280;

// ── Persistent: Reputation data ──

pub fn get_reputation(env: &Env, agent_id: u64) -> ReputationScore {
    let key = RepKey::Reputation(agent_id);
    let rep: ReputationScore = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or(ReputationScore {
            agent_id,
            total_interactions: 0,
            positive_count: 0,
            negative_count: 0,
            score: 5000, // neutral default
            last_feedback_at: 0,
        });
    if env.storage().persistent().has(&key) {
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
    }
    rep
}

pub fn set_reputation(env: &Env, agent_id: u64, rep: &ReputationScore) {
    let key = RepKey::Reputation(agent_id);
    env.storage().persistent().set(&key, rep);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
}

// ── Temporary: Cooldown timestamps ──

pub fn get_last_feedback_time(env: &Env, submitter: &Address, agent_id: u64) -> Option<u64> {
    let key = RepKey::LastFeedback(submitter.clone(), agent_id);
    env.storage().temporary().get(&key)
}

pub fn set_last_feedback_time(env: &Env, submitter: &Address, agent_id: u64, timestamp: u64) {
    let key = RepKey::LastFeedback(submitter.clone(), agent_id);
    env.storage().temporary().set(&key, &timestamp);
    env.storage()
        .temporary()
        .extend_ttl(&key, COOLDOWN_TTL, COOLDOWN_TTL);
}

// ── Instance: Config ──

pub fn get_admin(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&RepKey::Admin)
        .ok_or(Error::NotInitialized)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&RepKey::Admin, admin);
}

pub fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&RepKey::Admin)
}

#[allow(dead_code)]
pub fn get_verification_contract(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&RepKey::VerificationContract)
        .unwrap()
}

pub fn set_verification_contract(env: &Env, addr: &Address) {
    env.storage()
        .instance()
        .set(&RepKey::VerificationContract, addr);
}

pub fn get_xlm_token(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&RepKey::XlmToken)
        .unwrap()
}

pub fn set_xlm_token(env: &Env, addr: &Address) {
    env.storage().instance().set(&RepKey::XlmToken, addr);
}

pub fn get_min_balance(env: &Env) -> i128 {
    env.storage()
        .instance()
        .get(&RepKey::MinBalance)
        .unwrap()
}

pub fn set_min_balance(env: &Env, amount: i128) {
    env.storage().instance().set(&RepKey::MinBalance, &amount);
}

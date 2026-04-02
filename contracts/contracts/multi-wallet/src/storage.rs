use soroban_sdk::{Address, Env, Vec};

use crate::types::{Error, WalletKey};

const TTL_THRESHOLD: u32 = 17_280;
const TTL_EXTEND: u32 = 518_400;

// ── Persistent: Linked wallets ──

pub fn get_linked_wallets(env: &Env, agent_id: u64) -> Vec<Address> {
    let key = WalletKey::LinkedWallets(agent_id);
    let wallets: Vec<Address> = env
        .storage()
        .persistent()
        .get(&key)
        .unwrap_or(Vec::new(env));
    if env.storage().persistent().has(&key) {
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
    }
    wallets
}

pub fn set_linked_wallets(env: &Env, agent_id: u64, wallets: &Vec<Address>) {
    let key = WalletKey::LinkedWallets(agent_id);
    env.storage().persistent().set(&key, wallets);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
}

// ── Persistent: Authority ──

pub fn get_authority(env: &Env, agent_id: u64) -> Result<Address, Error> {
    let key = WalletKey::Authority(agent_id);
    let addr: Address = env
        .storage()
        .persistent()
        .get(&key)
        .ok_or(Error::NoAuthority)?;
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
    Ok(addr)
}

pub fn set_authority(env: &Env, agent_id: u64, authority: &Address) {
    let key = WalletKey::Authority(agent_id);
    env.storage().persistent().set(&key, authority);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
}

pub fn has_authority(env: &Env, agent_id: u64) -> bool {
    env.storage()
        .persistent()
        .has(&WalletKey::Authority(agent_id))
}

// ── Persistent: Reverse lookup wallet -> agent_id ──

pub fn get_wallet_agent(env: &Env, wallet: &Address) -> Option<u64> {
    let key = WalletKey::WalletToAgent(wallet.clone());
    let result: Option<u64> = env.storage().persistent().get(&key);
    if result.is_some() {
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
    }
    result
}

pub fn set_wallet_agent(env: &Env, wallet: &Address, agent_id: u64) {
    let key = WalletKey::WalletToAgent(wallet.clone());
    env.storage().persistent().set(&key, &agent_id);
    env.storage()
        .persistent()
        .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND);
}

pub fn remove_wallet_agent(env: &Env, wallet: &Address) {
    env.storage()
        .persistent()
        .remove(&WalletKey::WalletToAgent(wallet.clone()));
}

// ── Instance: Config ──

pub fn get_admin(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&WalletKey::Admin)
        .ok_or(Error::NotInitialized)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&WalletKey::Admin, admin);
}

pub fn is_initialized(env: &Env) -> bool {
    env.storage().instance().has(&WalletKey::Admin)
}

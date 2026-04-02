use soroban_sdk::{contractevent, Address, Env};

/// Emitted when a passport is minted.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PassportMinted {
    #[topic]
    pub agent_id: u64,
    pub passport_id: u64,
    pub owner: Address,
}

/// Emitted when a passport is revoked.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PassportRevoked {
    #[topic]
    pub agent_id: u64,
}

pub fn emit_minted(env: &Env, agent_id: u64, passport_id: u64, owner: &Address) {
    PassportMinted {
        agent_id,
        passport_id,
        owner: owner.clone(),
    }
    .publish(env);
}

pub fn emit_revoked(env: &Env, agent_id: u64) {
    PassportRevoked { agent_id }.publish(env);
}

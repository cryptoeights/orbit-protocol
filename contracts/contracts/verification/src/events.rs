use soroban_sdk::{contractevent, Env};

use crate::types::VerificationTier;

/// Emitted when an agent is verified.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgentVerified {
    #[topic]
    pub agent_id: u64,
    pub tier: VerificationTier,
    pub fee_paid: i128,
}

/// Emitted when verification is revoked.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VerificationRevoked {
    #[topic]
    pub agent_id: u64,
}

pub fn emit_verified(env: &Env, agent_id: u64, tier: &VerificationTier, fee_paid: i128) {
    AgentVerified {
        agent_id,
        tier: tier.clone(),
        fee_paid,
    }
    .publish(env);
}

pub fn emit_revoked(env: &Env, agent_id: u64) {
    VerificationRevoked { agent_id }.publish(env);
}

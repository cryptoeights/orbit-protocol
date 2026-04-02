use soroban_sdk::{contractevent, Address, Env};

/// Emitted when a new agent is registered.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgentRegistered {
    #[topic]
    pub agent_id: u64,
    pub owner: Address,
}

/// Emitted when an agent's metadata is updated.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgentUpdated {
    #[topic]
    pub agent_id: u64,
}

/// Emitted when an agent is deactivated.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgentDeactivated {
    #[topic]
    pub agent_id: u64,
}

pub fn emit_register(env: &Env, agent_id: u64, owner: &Address) {
    AgentRegistered {
        agent_id,
        owner: owner.clone(),
    }
    .publish(env);
}

pub fn emit_update(env: &Env, agent_id: u64) {
    AgentUpdated { agent_id }.publish(env);
}

pub fn emit_deactivate(env: &Env, agent_id: u64) {
    AgentDeactivated { agent_id }.publish(env);
}

use soroban_sdk::{contractevent, Address, Env};

/// Emitted when feedback is submitted.
#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FeedbackSubmitted {
    #[topic]
    pub target_agent_id: u64,
    pub submitter: Address,
    pub positive: bool,
    pub weight: u32,
}

pub fn emit_feedback(
    env: &Env,
    target_agent_id: u64,
    submitter: &Address,
    positive: bool,
    weight: u32,
) {
    FeedbackSubmitted {
        target_agent_id,
        submitter: submitter.clone(),
        positive,
        weight,
    }
    .publish(env);
}

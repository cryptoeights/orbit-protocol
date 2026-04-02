use soroban_sdk::{contracttype, contracterror, Address};

/// Aggregated reputation score for an agent.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationScore {
    pub agent_id: u64,
    pub total_interactions: u32,
    pub positive_count: u32,
    pub negative_count: u32,
    /// Score in basis points (0-10000). 5000 = neutral default.
    pub score: u32,
    pub last_feedback_at: u64,
}

/// Storage key layout.
#[contracttype]
#[derive(Clone)]
pub enum RepKey {
    /// agent_id -> ReputationScore (persistent)
    Reputation(u64),
    /// (submitter, agent_id) -> timestamp (temporary, auto-expires)
    LastFeedback(Address, u64),
    /// Admin address (instance)
    Admin,
    /// Address of Verification contract for cross-contract calls (instance)
    VerificationContract,
    /// Address of XLM SAC for balance checks (instance)
    XlmToken,
    /// Minimum XLM balance to submit feedback, in stroops (instance)
    MinBalance,
}

/// Structured contract errors.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    /// Feedback already submitted for this pair within 24h.
    CooldownActive = 3,
    /// Submitter's XLM balance below minimum.
    InsufficientBalance = 4,
    /// Cannot submit feedback on your own agent.
    SelfFeedback = 5,
    Unauthorized = 6,
}

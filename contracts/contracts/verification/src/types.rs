use soroban_sdk::{contracttype, contracterror};

/// Verification record for an agent.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VerificationInfo {
    pub agent_id: u64,
    pub verified: bool,
    pub tier: VerificationTier,
    pub verified_at: u64,
    pub fee_paid: i128,
}

/// Verification tier with different fee levels.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum VerificationTier {
    None,
    Basic,   // 10 XLM
    Premium, // 100 XLM
}

/// Storage key layout.
#[contracttype]
#[derive(Clone)]
pub enum VerifyKey {
    Verification(u64), // agent_id -> VerificationInfo
    BasicFee,          // i128 in stroops
    PremiumFee,        // i128 in stroops
    Treasury,          // Address
    XlmToken,          // Address of native XLM SAC
    TotalCollected,    // i128 accumulated fees
    Admin,             // Address
}

/// Structured contract errors.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    AlreadyVerified = 3,
    NotVerified = 4,
    InvalidTier = 5,
    Unauthorized = 6,
}

use soroban_sdk::{contracttype, contracterror, Address, String};

/// Passport record for an agent. Soulbound — no transfer/approve.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PassportInfo {
    pub id: u64,
    pub agent_id: u64,
    pub owner: Address,
    pub minted_at: u64,
    pub metadata_uri: String,
    /// Reputation score snapshot at mint time.
    pub reputation_snapshot: u32,
    pub revoked: bool,
}

/// Storage key layout.
#[contracttype]
#[derive(Clone)]
pub enum PassportKey {
    /// agent_id -> PassportInfo (persistent). One passport per agent.
    Passport(u64),
    /// Total passports minted (instance).
    PassportCount,
    /// Admin address (instance).
    Admin,
    /// Verification contract address for is_verified check (instance).
    VerificationContract,
}

/// Structured contract errors.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    /// Agent is not verified — cannot mint passport.
    NotVerified = 3,
    /// Agent already has a passport.
    AlreadyHasPassport = 4,
    /// Passport not found for this agent.
    PassportNotFound = 5,
    /// Passport has been revoked.
    PassportRevoked = 6,
    Unauthorized = 7,
}

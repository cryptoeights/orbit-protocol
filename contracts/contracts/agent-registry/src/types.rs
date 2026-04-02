use soroban_sdk::{contracttype, contracterror, Address, String};

/// Agent identity record stored on-chain.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AgentInfo {
    /// Auto-incremented agent ID.
    pub id: u64,
    /// Owner wallet address (authority).
    pub owner: Address,
    /// Agent display name (3-64 chars).
    pub name: String,
    /// Agent description (max 500 chars).
    pub description: String,
    /// URI to AgentCard JSON (max 256 chars). Supports https:// and ipfs://.
    pub metadata_uri: String,
    /// Current agent lifecycle status.
    pub status: AgentStatus,
    /// Ledger timestamp at registration.
    pub created_at: u64,
    /// Ledger timestamp of last update.
    pub updated_at: u64,
}

/// Agent lifecycle status.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AgentStatus {
    Active,
    Suspended,
    Deactivated,
}

/// Storage key layout.
///
/// - `Agent(u64)` → `AgentInfo` in persistent storage
/// - `WalletAgent(Address)` → `u64` (agent_id) in persistent storage
/// - `AgentCount` → `u64` in instance storage
/// - `Admin` → `Address` in instance storage
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Agent(u64),
    WalletAgent(Address),
    AgentCount,
    Admin,
}

/// Structured contract errors with deterministic codes.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Wallet is already registered to an agent.
    AlreadyRegistered = 1,
    /// Agent or wallet not found.
    NotFound = 2,
    /// Caller is not authorized for this operation.
    Unauthorized = 3,
    /// Input validation failed (name length, description length, URI length).
    InvalidInput = 4,
    /// Contract has not been initialized yet.
    NotInitialized = 5,
    /// Contract has already been initialized.
    AlreadyInitialized = 6,
    /// Agent is already deactivated.
    AlreadyDeactivated = 7,
}

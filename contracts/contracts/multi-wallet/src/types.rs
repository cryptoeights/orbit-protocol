use soroban_sdk::{contracttype, contracterror, Address};

/// Maximum wallets that can be linked to a single agent.
pub const MAX_WALLETS: u32 = 5;

/// Storage key layout.
#[contracttype]
#[derive(Clone)]
pub enum WalletKey {
    /// agent_id -> Vec<Address> of linked wallets (persistent)
    LinkedWallets(u64),
    /// agent_id -> Address (current authority wallet) (persistent)
    Authority(u64),
    /// wallet Address -> agent_id (reverse lookup) (persistent)
    WalletToAgent(Address),
    /// Admin address (instance)
    Admin,
}

/// Structured contract errors.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    /// Already at maximum linked wallets (5).
    MaxWalletsReached = 3,
    /// Wallet is already linked to an agent.
    WalletAlreadyLinked = 4,
    /// Wallet is not linked to this agent.
    WalletNotLinked = 5,
    /// Cannot unlink the authority wallet.
    CannotUnlinkAuthority = 6,
    /// Caller is not the authority for this agent.
    NotAuthority = 7,
    Unauthorized = 8,
    /// No authority has been set for this agent yet.
    NoAuthority = 9,
}

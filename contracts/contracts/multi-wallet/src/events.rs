use soroban_sdk::{contractevent, Address, Env};

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WalletLinked {
    #[topic]
    pub agent_id: u64,
    pub new_wallet: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WalletUnlinked {
    #[topic]
    pub agent_id: u64,
    pub wallet: Address,
}

#[contractevent]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuthorityTransferred {
    #[topic]
    pub agent_id: u64,
    pub old_authority: Address,
    pub new_authority: Address,
}

pub fn emit_linked(env: &Env, agent_id: u64, new_wallet: &Address) {
    WalletLinked {
        agent_id,
        new_wallet: new_wallet.clone(),
    }
    .publish(env);
}

pub fn emit_unlinked(env: &Env, agent_id: u64, wallet: &Address) {
    WalletUnlinked {
        agent_id,
        wallet: wallet.clone(),
    }
    .publish(env);
}

pub fn emit_authority_transferred(
    env: &Env,
    agent_id: u64,
    old_authority: &Address,
    new_authority: &Address,
) {
    AuthorityTransferred {
        agent_id,
        old_authority: old_authority.clone(),
        new_authority: new_authority.clone(),
    }
    .publish(env);
}

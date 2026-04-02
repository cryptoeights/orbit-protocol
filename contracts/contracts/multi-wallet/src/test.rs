#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{testutils::Address as _, Env};

fn setup() -> (Env, MultiWalletContractClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(MultiWalletContract, ());
    let client = MultiWalletContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    (env, client, admin)
}

// ── Initialize ──

#[test]
fn test_initialize() {
    let (_env, client, _admin) = setup();
    assert_eq!(client.version(), 1);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn test_initialize_double_init() {
    let (env, client, _admin) = setup();
    let admin2 = Address::generate(&env);
    client.initialize(&admin2);
}

// ── Link Wallet ──

#[test]
fn test_link_wallet() {
    let (env, client, _admin) = setup();
    let authority = Address::generate(&env);
    let wallet2 = Address::generate(&env);

    client.link_wallet(&1, &authority, &wallet2);

    let wallets = client.get_linked_wallets(&1);
    assert_eq!(wallets.len(), 1);
    assert_eq!(wallets.get(0).unwrap(), wallet2);
}

#[test]
fn test_link_establishes_authority() {
    let (env, client, _admin) = setup();
    let authority = Address::generate(&env);
    let wallet2 = Address::generate(&env);

    client.link_wallet(&1, &authority, &wallet2);

    let stored_auth = client.get_authority(&1);
    assert_eq!(stored_auth, authority);
}

#[test]
fn test_link_multiple_wallets() {
    let (env, client, _admin) = setup();
    let authority = Address::generate(&env);

    let w1 = Address::generate(&env);
    let w2 = Address::generate(&env);
    let w3 = Address::generate(&env);

    client.link_wallet(&1, &authority, &w1);
    client.link_wallet(&1, &authority, &w2);
    client.link_wallet(&1, &authority, &w3);

    let wallets = client.get_linked_wallets(&1);
    assert_eq!(wallets.len(), 3);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_link_max_wallets() {
    let (env, client, _admin) = setup();
    let authority = Address::generate(&env);

    for _i in 0..5 {
        let w = Address::generate(&env);
        client.link_wallet(&1, &authority, &w);
    }

    // 6th wallet should fail.
    let w6 = Address::generate(&env);
    client.link_wallet(&1, &authority, &w6);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_wallet_already_linked() {
    let (env, client, _admin) = setup();
    let authority1 = Address::generate(&env);
    let authority2 = Address::generate(&env);
    let shared_wallet = Address::generate(&env);

    client.link_wallet(&1, &authority1, &shared_wallet);
    // Same wallet linked to different agent should fail.
    client.link_wallet(&2, &authority2, &shared_wallet);
}

#[test]
#[should_panic(expected = "Error(Contract, #7)")]
fn test_link_wrong_authority() {
    let (env, client, _admin) = setup();
    let authority = Address::generate(&env);
    let imposter = Address::generate(&env);
    let w1 = Address::generate(&env);
    let w2 = Address::generate(&env);

    // Establish authority.
    client.link_wallet(&1, &authority, &w1);
    // Different authority should fail.
    client.link_wallet(&1, &imposter, &w2);
}

// ── Unlink Wallet ──

#[test]
fn test_unlink_wallet() {
    let (env, client, _admin) = setup();
    let authority = Address::generate(&env);
    let w1 = Address::generate(&env);
    let w2 = Address::generate(&env);

    client.link_wallet(&1, &authority, &w1);
    client.link_wallet(&1, &authority, &w2);
    assert_eq!(client.get_linked_wallets(&1).len(), 2);

    client.unlink_wallet(&1, &authority, &w1);
    assert_eq!(client.get_linked_wallets(&1).len(), 1);

    // Reverse lookup should be gone.
    assert!(client.is_linked(&w1).is_none());
}

#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn test_cannot_unlink_authority() {
    let (env, client, _admin) = setup();
    let authority = Address::generate(&env);
    let w1 = Address::generate(&env);

    client.link_wallet(&1, &authority, &w1);
    // Cannot unlink authority itself.
    client.unlink_wallet(&1, &authority, &authority);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_unlink_not_linked() {
    let (env, client, _admin) = setup();
    let authority = Address::generate(&env);
    let w1 = Address::generate(&env);
    let w_not_linked = Address::generate(&env);

    client.link_wallet(&1, &authority, &w1);
    client.unlink_wallet(&1, &authority, &w_not_linked);
}

// ── Transfer Authority ──

#[test]
fn test_transfer_authority() {
    let (env, client, _admin) = setup();
    let authority = Address::generate(&env);
    let w1 = Address::generate(&env);

    client.link_wallet(&1, &authority, &w1);

    client.transfer_authority(&1, &authority, &w1);
    assert_eq!(client.get_authority(&1), w1);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_transfer_authority_not_linked() {
    let (env, client, _admin) = setup();
    let authority = Address::generate(&env);
    let w1 = Address::generate(&env);
    let not_linked = Address::generate(&env);

    client.link_wallet(&1, &authority, &w1);
    // Transfer to wallet that's not linked should fail.
    client.transfer_authority(&1, &authority, &not_linked);
}

// ── Is Linked ──

#[test]
fn test_is_linked() {
    let (env, client, _admin) = setup();
    let authority = Address::generate(&env);
    let w1 = Address::generate(&env);

    assert!(client.is_linked(&w1).is_none());

    client.link_wallet(&1, &authority, &w1);
    assert_eq!(client.is_linked(&w1), Some(1));
}

// ── Empty wallets ──

#[test]
fn test_get_linked_wallets_empty() {
    let (_env, client, _admin) = setup();
    let wallets = client.get_linked_wallets(&999);
    assert_eq!(wallets.len(), 0);
}

// ── Version ──

#[test]
fn test_version() {
    let (_env, client, _admin) = setup();
    assert_eq!(client.version(), 1);
}

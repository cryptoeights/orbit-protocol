#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    contract, contractimpl,
    testutils::Address as _,
    Env, String,
};

// ── Mock Verification Contract ──
// Returns true for agent_id 1, false for all others.

#[contract]
pub struct MockVerification;

#[contractimpl]
impl MockVerification {
    pub fn is_verified(_env: Env, agent_id: u64) -> bool {
        agent_id == 1
    }
}

/// Setup: register passport + mock verification, initialize.
fn setup() -> (Env, PassportContractClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();

    // Register mock verification contract.
    let mock_verify_id = env.register(MockVerification, ());

    // Register passport contract.
    let contract_id = env.register(PassportContract, ());
    let client = PassportContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin, &mock_verify_id);

    (env, client, admin)
}

// ── Initialize ──

#[test]
fn test_initialize() {
    let (_env, client, _admin) = setup();
    assert_eq!(client.passport_count(), 0);
    assert_eq!(client.version(), 1);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn test_initialize_double_init() {
    let (env, client, _admin) = setup();
    let admin2 = Address::generate(&env);
    let verify2 = Address::generate(&env);
    client.initialize(&admin2, &verify2);
}

// ── Mint Passport ──

#[test]
fn test_mint_passport() {
    let (env, client, _admin) = setup();
    let owner = Address::generate(&env);

    // agent_id 1 is "verified" by mock.
    let passport_id = client.mint_passport(
        &1,
        &owner,
        &String::from_str(&env, "https://api.orbitprotocol.xyz/passports/1.json"),
    );

    assert_eq!(passport_id, 1);
    assert_eq!(client.passport_count(), 1);
    assert!(client.has_passport(&1));

    let info = client.get_passport(&1);
    assert_eq!(info.id, 1);
    assert_eq!(info.agent_id, 1);
    assert_eq!(info.owner, owner);
    assert!(!info.revoked);
    assert_eq!(info.reputation_snapshot, 0);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_mint_not_verified() {
    let (env, client, _admin) = setup();
    let owner = Address::generate(&env);

    // agent_id 2 is NOT verified by mock.
    client.mint_passport(
        &2,
        &owner,
        &String::from_str(&env, "https://example.com"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_mint_already_has_passport() {
    let (env, client, _admin) = setup();
    let owner = Address::generate(&env);

    client.mint_passport(
        &1,
        &owner,
        &String::from_str(&env, "https://example.com"),
    );
    // Second mint should fail.
    client.mint_passport(
        &1,
        &owner,
        &String::from_str(&env, "https://example.com"),
    );
}

// ── Get / Has Passport ──

#[test]
fn test_has_passport_false() {
    let (_env, client, _admin) = setup();
    assert!(!client.has_passport(&999));
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_get_passport_not_found() {
    let (_env, client, _admin) = setup();
    client.get_passport(&999);
}

// ── Revoke ──

#[test]
fn test_revoke_passport() {
    let (env, client, _admin) = setup();
    let owner = Address::generate(&env);

    client.mint_passport(
        &1,
        &owner,
        &String::from_str(&env, "https://example.com"),
    );

    client.revoke_passport(&1);

    let info = client.get_passport(&1);
    assert!(info.revoked);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_revoke_not_found() {
    let (_env, client, _admin) = setup();
    client.revoke_passport(&999);
}

// ── Update Metadata URI ──

#[test]
fn test_update_metadata_uri() {
    let (env, client, _admin) = setup();
    let owner = Address::generate(&env);

    client.mint_passport(
        &1,
        &owner,
        &String::from_str(&env, "https://old.com"),
    );

    client.update_metadata_uri(
        &1,
        &String::from_str(&env, "https://new.com/passport.json"),
    );

    let info = client.get_passport(&1);
    assert_eq!(
        info.metadata_uri,
        String::from_str(&env, "https://new.com/passport.json")
    );
}

// ── Passport Count ──

#[test]
fn test_passport_count() {
    let (env, client, _admin) = setup();
    assert_eq!(client.passport_count(), 0);

    let owner = Address::generate(&env);
    client.mint_passport(
        &1,
        &owner,
        &String::from_str(&env, "https://example.com"),
    );
    assert_eq!(client.passport_count(), 1);
}

// ── Version ──

#[test]
fn test_version() {
    let (_env, client, _admin) = setup();
    assert_eq!(client.version(), 1);
}

#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::StellarAssetClient,
    Env, String,
};

/// Setup: register contract, create mock XLM, initialize.
fn setup() -> (
    Env,
    ReputationContractClient<'static>,
    Address, // admin
    Address, // xlm_token
) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(ReputationContract, ());
    let client = ReputationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);

    // Mock XLM token.
    let xlm_admin = Address::generate(&env);
    let xlm_token = env.register_stellar_asset_contract_v2(xlm_admin.clone());
    let xlm_address = xlm_token.address();

    // Mock verification contract (not wired for cross-contract in S02).
    let verification = Address::generate(&env);

    let min_balance: i128 = 100_000_000; // 10 XLM

    client.initialize(&admin, &verification, &xlm_address, &min_balance);

    (env, client, admin, xlm_address)
}

/// Fund an address with XLM.
fn fund_xlm(env: &Env, xlm_token: &Address, to: &Address, amount: i128) {
    let sac = StellarAssetClient::new(env, xlm_token);
    sac.mint(to, &amount);
}

// ── Initialize ──

#[test]
fn test_initialize() {
    let (_env, client, _admin, _xlm) = setup();
    assert_eq!(client.version(), 1);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn test_initialize_double_init() {
    let (env, client, _admin, xlm) = setup();
    let admin2 = Address::generate(&env);
    let verification2 = Address::generate(&env);
    client.initialize(&admin2, &verification2, &xlm, &100_000_000);
}

// ── Default Reputation ──

#[test]
fn test_default_reputation() {
    let (_env, client, _admin, _xlm) = setup();
    let rep = client.get_reputation(&999);
    assert_eq!(rep.agent_id, 999);
    assert_eq!(rep.total_interactions, 0);
    assert_eq!(rep.score, 5000); // neutral default
}

// ── Submit Feedback ──

#[test]
fn test_submit_feedback_positive() {
    let (env, client, _admin, xlm) = setup();
    let submitter = Address::generate(&env);
    fund_xlm(&env, &xlm, &submitter, 500_000_000); // 50 XLM

    client.submit_feedback(
        &submitter,
        &1,
        &true,
        &String::from_str(&env, "Great agent"),
    );

    let rep = client.get_reputation(&1);
    assert_eq!(rep.total_interactions, 1);
    assert_eq!(rep.positive_count, 1);
    assert_eq!(rep.negative_count, 0);
    assert_eq!(rep.score, 10000); // 100% positive
}

#[test]
fn test_submit_feedback_negative() {
    let (env, client, _admin, xlm) = setup();
    let submitter = Address::generate(&env);
    fund_xlm(&env, &xlm, &submitter, 500_000_000);

    client.submit_feedback(
        &submitter,
        &1,
        &false,
        &String::from_str(&env, "Bad experience"),
    );

    let rep = client.get_reputation(&1);
    assert_eq!(rep.total_interactions, 1);
    assert_eq!(rep.positive_count, 0);
    assert_eq!(rep.negative_count, 1);
    assert_eq!(rep.score, 0); // 0% positive
}

#[test]
fn test_multiple_feedback_score() {
    let (env, client, _admin, xlm) = setup();

    // Submit 3 positive, 1 negative from different submitters.
    for _i in 0..3 {
        let s = Address::generate(&env);
        fund_xlm(&env, &xlm, &s, 500_000_000);
        client.submit_feedback(&s, &1, &true, &String::from_str(&env, "Good"));
    }
    let s4 = Address::generate(&env);
    fund_xlm(&env, &xlm, &s4, 500_000_000);
    client.submit_feedback(&s4, &1, &false, &String::from_str(&env, "Bad"));

    let rep = client.get_reputation(&1);
    assert_eq!(rep.total_interactions, 4);
    assert_eq!(rep.positive_count, 3);
    assert_eq!(rep.negative_count, 1);
    // Score = 3/4 * 10000 = 7500
    assert_eq!(rep.score, 7500);
}

// ── Anti-Spam: Cooldown ──

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_cooldown_enforced() {
    let (env, client, _admin, xlm) = setup();
    let submitter = Address::generate(&env);
    fund_xlm(&env, &xlm, &submitter, 500_000_000);

    client.submit_feedback(&submitter, &1, &true, &String::from_str(&env, "Good"));

    // Second feedback within 24h should fail.
    client.submit_feedback(&submitter, &1, &true, &String::from_str(&env, "Good again"));
}

#[test]
fn test_cooldown_different_targets() {
    let (env, client, _admin, xlm) = setup();
    let submitter = Address::generate(&env);
    fund_xlm(&env, &xlm, &submitter, 500_000_000);

    // Same submitter, different targets — should work.
    client.submit_feedback(&submitter, &1, &true, &String::from_str(&env, "Good"));
    client.submit_feedback(&submitter, &2, &true, &String::from_str(&env, "Also good"));

    assert_eq!(client.get_feedback_count(&1), 1);
    assert_eq!(client.get_feedback_count(&2), 1);
}

// ── Anti-Spam: Min Balance ──

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_min_balance_enforced() {
    let (env, client, _admin, xlm) = setup();
    let submitter = Address::generate(&env);
    // Fund with only 5 XLM (below 10 XLM minimum).
    fund_xlm(&env, &xlm, &submitter, 50_000_000);

    client.submit_feedback(&submitter, &1, &true, &String::from_str(&env, "Good"));
}

// ── Decay ──

#[test]
fn test_score_decay() {
    let (env, client, _admin, xlm) = setup();
    let submitter = Address::generate(&env);
    fund_xlm(&env, &xlm, &submitter, 500_000_000);

    // Set ledger timestamp to a known value.
    env.ledger().set_timestamp(1_000_000);

    client.submit_feedback(&submitter, &1, &true, &String::from_str(&env, "Good"));

    // Read immediately — no decay.
    let rep = client.get_reputation(&1);
    assert_eq!(rep.score, 10000);

    // Advance time by 60 days (2 months of inactivity).
    env.ledger().set_timestamp(1_000_000 + 60 * 86_400);

    let rep_decayed = client.get_reputation(&1);
    // 2 months inactive → decay factor = 100 - 2 = 98 → score = 10000 * 98 / 100 = 9800
    assert_eq!(rep_decayed.score, 9800);
}

#[test]
fn test_score_decay_long_inactivity() {
    let (env, client, _admin, xlm) = setup();
    let submitter = Address::generate(&env);
    fund_xlm(&env, &xlm, &submitter, 500_000_000);

    env.ledger().set_timestamp(1_000_000);
    client.submit_feedback(&submitter, &1, &true, &String::from_str(&env, "Good"));

    // Advance time by 300 days (10 months).
    env.ledger().set_timestamp(1_000_000 + 300 * 86_400);

    let rep = client.get_reputation(&1);
    // 10 months → decay factor = 100 - 10 = 90 → score = 10000 * 90 / 100 = 9000
    assert_eq!(rep.score, 9000);
}

// ── Feedback Count ──

#[test]
fn test_feedback_count() {
    let (env, client, _admin, xlm) = setup();

    assert_eq!(client.get_feedback_count(&1), 0);

    let s1 = Address::generate(&env);
    fund_xlm(&env, &xlm, &s1, 500_000_000);
    client.submit_feedback(&s1, &1, &true, &String::from_str(&env, "Good"));

    assert_eq!(client.get_feedback_count(&1), 1);
}

// ── Version ──

#[test]
fn test_version() {
    let (_env, client, _admin, _xlm) = setup();
    assert_eq!(client.version(), 1);
}

#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Env,
};

/// Setup: register contract, create mock XLM token, initialize.
fn setup() -> (
    Env,
    VerificationContractClient<'static>,
    Address, // admin
    Address, // treasury
    Address, // xlm_token
) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(VerificationContract, ());
    let client = VerificationContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);

    // Create a mock Stellar Asset Contract for XLM.
    let xlm_admin = Address::generate(&env);
    let xlm_token = env.register_stellar_asset_contract_v2(xlm_admin.clone());
    let xlm_address = xlm_token.address();

    let basic_fee: i128 = 100_000_000;   // 10 XLM
    let premium_fee: i128 = 1_000_000_000; // 100 XLM

    client.initialize(&admin, &treasury, &xlm_address, &basic_fee, &premium_fee);

    (env, client, admin, treasury, xlm_address)
}

/// Fund an address with XLM using the SAC admin mint.
fn fund_xlm(env: &Env, xlm_token: &Address, to: &Address, amount: i128) {
    let sac = StellarAssetClient::new(env, xlm_token);
    sac.mint(to, &amount);
}

// ── Initialize ──

#[test]
fn test_initialize() {
    let (_env, client, _admin, _treasury, _xlm) = setup();
    assert_eq!(client.get_total_collected(), 0);
    assert_eq!(client.version(), 1);
}

#[test]
#[should_panic(expected = "Error(Contract, #2)")]
fn test_initialize_double_init() {
    let (env, client, _admin, _treasury, xlm) = setup();
    let admin2 = Address::generate(&env);
    let treasury2 = Address::generate(&env);
    client.initialize(&admin2, &treasury2, &xlm, &100_000_000, &1_000_000_000);
}

// ── Verify Agent ──

#[test]
fn test_verify_agent_basic() {
    let (env, client, _admin, treasury, xlm) = setup();
    let payer = Address::generate(&env);

    // Fund payer with 50 XLM.
    fund_xlm(&env, &xlm, &payer, 500_000_000);

    client.verify_agent(&1, &payer, &VerificationTier::Basic);

    // Check verification stored.
    assert!(client.is_verified(&1));
    let info = client.get_verification(&1);
    assert_eq!(info.agent_id, 1);
    assert!(info.verified);
    assert_eq!(info.tier, VerificationTier::Basic);
    assert_eq!(info.fee_paid, 100_000_000);

    // Check treasury received fee.
    let xlm_client = TokenClient::new(&env, &xlm);
    assert_eq!(xlm_client.balance(&treasury), 100_000_000);
    // Payer balance should be 50 - 10 = 40 XLM.
    assert_eq!(xlm_client.balance(&payer), 400_000_000);

    // Total collected.
    assert_eq!(client.get_total_collected(), 100_000_000);
}

#[test]
fn test_verify_agent_premium() {
    let (env, client, _admin, treasury, xlm) = setup();
    let payer = Address::generate(&env);

    fund_xlm(&env, &xlm, &payer, 2_000_000_000); // 200 XLM

    client.verify_agent(&2, &payer, &VerificationTier::Premium);

    let info = client.get_verification(&2);
    assert_eq!(info.tier, VerificationTier::Premium);
    assert_eq!(info.fee_paid, 1_000_000_000);

    let xlm_client = TokenClient::new(&env, &xlm);
    assert_eq!(xlm_client.balance(&treasury), 1_000_000_000);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_already_verified() {
    let (env, client, _admin, _treasury, xlm) = setup();
    let payer = Address::generate(&env);
    fund_xlm(&env, &xlm, &payer, 1_000_000_000);

    client.verify_agent(&1, &payer, &VerificationTier::Basic);
    // Second verification should fail.
    client.verify_agent(&1, &payer, &VerificationTier::Basic);
}

#[test]
#[should_panic(expected = "Error(Contract, #5)")]
fn test_verify_invalid_tier() {
    let (env, client, _admin, _treasury, xlm) = setup();
    let payer = Address::generate(&env);
    fund_xlm(&env, &xlm, &payer, 500_000_000);

    client.verify_agent(&1, &payer, &VerificationTier::None);
}

// ── Is Verified / Not Verified ──

#[test]
fn test_not_verified() {
    let (_env, client, _admin, _treasury, _xlm) = setup();
    assert!(!client.is_verified(&999));
}

// ── Revoke ──

#[test]
fn test_revoke_verification() {
    let (env, client, _admin, _treasury, xlm) = setup();
    let payer = Address::generate(&env);
    fund_xlm(&env, &xlm, &payer, 500_000_000);

    client.verify_agent(&1, &payer, &VerificationTier::Basic);
    assert!(client.is_verified(&1));

    client.revoke_verification(&1);
    assert!(!client.is_verified(&1));

    // Verification info still exists but verified=false.
    let info = client.get_verification(&1);
    assert!(!info.verified);
}

#[test]
#[should_panic(expected = "Error(Contract, #4)")]
fn test_revoke_not_verified() {
    let (_env, client, _admin, _treasury, _xlm) = setup();
    client.revoke_verification(&999);
}

// ── Set Fee ──

#[test]
fn test_set_fee() {
    let (env, client, _admin, _treasury, xlm) = setup();

    // Update basic fee to 20 XLM.
    client.set_fee(&VerificationTier::Basic, &200_000_000);

    // Verify new fee is used.
    let payer = Address::generate(&env);
    fund_xlm(&env, &xlm, &payer, 500_000_000);
    client.verify_agent(&1, &payer, &VerificationTier::Basic);

    let info = client.get_verification(&1);
    assert_eq!(info.fee_paid, 200_000_000);
}

// ── Total Collected ──

#[test]
fn test_total_collected_accumulates() {
    let (env, client, _admin, _treasury, xlm) = setup();

    let payer1 = Address::generate(&env);
    let payer2 = Address::generate(&env);
    fund_xlm(&env, &xlm, &payer1, 500_000_000);
    fund_xlm(&env, &xlm, &payer2, 2_000_000_000);

    client.verify_agent(&1, &payer1, &VerificationTier::Basic);    // +10 XLM
    client.verify_agent(&2, &payer2, &VerificationTier::Premium); // +100 XLM

    assert_eq!(client.get_total_collected(), 1_100_000_000); // 110 XLM
}

// ── Version ──

#[test]
fn test_version() {
    let (_env, client, _admin, _treasury, _xlm) = setup();
    assert_eq!(client.version(), 1);
}

/**
 * Trust Tier Engine — calculates composite trust score from 6 signals.
 *
 * Signals:
 *   1. Registration: +1000 (agent exists and is active)
 *   2. Verification: +2000 (agent is verified)
 *   3. Reputation: score × 0.4 (max 4000)
 *   4. Activity: +500 (interaction within last 7 days)
 *   5. Passport: +500 (has soulbound passport)
 *   6. Registries: +200 per verified registry (max 5 = 1000) — placeholder
 *
 * Tiers:
 *   Unknown:    0-999
 *   Registered: 1000-2999
 *   Verified:   3000-6999
 *   Trusted:    7000-8999
 *   Elite:      9000-10000
 */

export interface TrustFactors {
  registration: number;
  verification: number;
  reputation: number;
  activity: number;
  passport: number;
  registries: number;
}

export interface TrustResult {
  trust_tier: string;
  trust_score: number;
  factors: TrustFactors;
}

export interface TrustDetail extends TrustResult {
  recommendations: string[];
}

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

export function calculateTrustScore(
  agent: {
    status: string;
    verified: boolean;
    reputationScore: number;
    hasPassport: boolean;
  },
  lastFeedbackAt: number = 0,
  currentTimestamp: number = Math.floor(Date.now() / 1000),
  verifiedRegistries: number = 0
): TrustResult {
  const factors: TrustFactors = {
    registration: 0,
    verification: 0,
    reputation: 0,
    activity: 0,
    passport: 0,
    registries: 0,
  };

  // 1. Registration (+1000)
  if (agent.status === "active") {
    factors.registration = 1000;
  }

  // 2. Verification (+2000)
  if (agent.verified) {
    factors.verification = 2000;
  }

  // 3. Reputation (×0.4, max 4000)
  if (agent.reputationScore > 0) {
    factors.reputation = Math.min(
      Math.floor(agent.reputationScore * 0.4),
      4000
    );
  }

  // 4. Activity (+500 if active within 7 days)
  if (lastFeedbackAt > 0) {
    const elapsed = currentTimestamp - lastFeedbackAt;
    if (elapsed <= SEVEN_DAYS_SECONDS) {
      factors.activity = 500;
    }
  }

  // 5. Passport (+500)
  if (agent.hasPassport) {
    factors.passport = 500;
  }

  // 6. Registries (+200 each, max 5)
  factors.registries = Math.min(verifiedRegistries, 5) * 200;

  const score = Math.min(
    Object.values(factors).reduce((sum, v) => sum + v, 0),
    10000
  );

  return {
    trust_tier: getTrustTier(score),
    trust_score: score,
    factors,
  };
}

export function getTrustTier(score: number): string {
  if (score >= 9000) return "elite";
  if (score >= 7000) return "trusted";
  if (score >= 3000) return "verified";
  if (score >= 1000) return "registered";
  return "unknown";
}

export function generateRecommendations(factors: TrustFactors): string[] {
  const recs: string[] = [];

  if (factors.verification === 0) {
    recs.push("Get verified (10 XLM) to add +2000 to your trust score");
  }
  if (factors.passport === 0) {
    recs.push("Mint a soulbound passport to add +500 to your trust score");
  }
  if (factors.activity === 0) {
    recs.push(
      "Stay active — interact within 7 days to maintain +500 activity bonus"
    );
  }
  if (factors.reputation < 4000) {
    recs.push("Build reputation through positive interactions (max +4000)");
  }
  if (factors.registries === 0) {
    recs.push(
      "Register on additional registries (SAID, ERC-8004) for +200 each"
    );
  }

  return recs;
}

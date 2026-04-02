"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Award,
  MessageSquare,
  Calendar,
  BarChart3,
  Link2,
  Star,
} from "lucide-react";
import { getAgent, getReputation, getPassport, getLinkedWallets, getTrustDetails } from "@/lib/api";

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function formatDate(timestamp: number) {
  if (!timestamp) return "N/A";
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function AgentProfile() {
  const params = useParams();
  const wallet = params.wallet as string;

  const [agent, setAgent] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);
  const [passport, setPassport] = useState<any>(null);
  const [wallets, setWallets] = useState<any>(null);
  const [trust, setTrust] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const agentData = await getAgent(wallet);
        setAgent(agentData);

        const [rep, pass, wall, tr] = await Promise.all([
          getReputation(wallet).catch(() => null),
          getPassport(wallet).catch(() => null),
          getLinkedWallets(wallet).catch(() => null),
          getTrustDetails(wallet).catch(() => null),
        ]);
        setReputation(rep);
        setPassport(pass);
        setWallets(wall);
        setTrust(tr);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [wallet]);

  if (loading) {
    return (
      <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl bg-white/5" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-white/5 rounded w-48" />
              <div className="h-4 bg-white/5 rounded w-64" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-4 h-20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="pt-28 pb-20 px-4 text-center">
        <h1 className="text-3xl font-bold mb-3">Agent Not Found</h1>
        <p className="text-gray-500 mb-6">
          This agent doesn&apos;t exist or hasn&apos;t been registered yet.
        </p>
        <Link href="/agents" className="btn-primary rounded-lg">
          Browse Directory
        </Link>
      </div>
    );
  }

  const repScore = reputation?.score ?? agent?.reputation_score ?? 0;
  const repDisplay = (repScore / 100).toFixed(1);
  const totalFeedback = reputation?.total_interactions ?? agent?.total_interactions ?? 0;
  const positiveCount = reputation?.positive_count ?? 0;
  const negativeCount = reputation?.negative_count ?? 0;
  const positiveRatio = totalFeedback > 0 ? ((positiveCount / totalFeedback) * 100).toFixed(1) : "N/A";

  const trustTier = trust?.trust_tier ?? "unknown";
  const trustScore = trust?.trust_score ?? 0;
  const factors = trust?.factors ?? {};

  return (
    <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start gap-5 mb-10">
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-3xl shrink-0">
          🤖
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">{agent.name}</h1>
            {agent.verified && (
              <span className="badge-verified flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>
          <p className="text-gray-500">{agent.description || "No description"}</p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="card p-5 text-center">
          <div className="text-2xl font-bold">{repDisplay}</div>
          <div className="text-sm text-gray-500 mt-1">Reputation</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-2xl font-bold">{totalFeedback}</div>
          <div className="text-sm text-gray-500 mt-1">Feedback</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-2xl font-bold capitalize">{trustTier}</div>
          <div className="text-sm text-gray-500 mt-1">Trust Tier</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-2xl font-bold">
            {agent.created_at ? formatDate(agent.created_at) : "2026"}
          </div>
          <div className="text-sm text-gray-500 mt-1">Registered</div>
        </div>
      </div>

      {/* ── Reputation Analytics ── */}
      <h2 className="text-xl font-semibold mb-4">Reputation Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Trust Score
          </div>
          <div className="text-3xl font-bold">{trustScore}</div>
          <div className="text-sm text-gray-500 mt-1">Out of 10,000</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Total Reviews
          </div>
          <div className="text-3xl font-bold">{totalFeedback}</div>
          <div className="text-sm text-green-500 mt-1">{positiveCount} positive</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Current Score
          </div>
          <div className="text-3xl font-bold">{repDisplay}</div>
          <div className="text-sm text-gray-500 mt-1">Out of 100</div>
        </div>
      </div>

      {/* ── Feedback Sentiment ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {/* Reputation Trend placeholder */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Trust Factor Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(factors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-24 capitalize">{key}</span>
                <div className="flex-1 bg-white/5 rounded-full h-2">
                  <div
                    className="bg-green-500 rounded-full h-2 transition-all"
                    style={{ width: `${Math.min(((value as number) / 4000) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-12 text-right">+{value as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment pie chart (CSS-only) */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Feedback Sentiment</h3>
          <div className="flex items-center justify-center py-4">
            <div
              className="w-32 h-32 rounded-full"
              style={{
                background: totalFeedback > 0
                  ? `conic-gradient(#22c55e ${(positiveCount / totalFeedback) * 360}deg, #ef4444 0deg)`
                  : "#1a1a1a",
              }}
            />
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
              Positive ({positiveRatio}%)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              Negative
            </div>
          </div>
        </div>
      </div>

      {/* ── On-Chain Identity ── */}
      <h2 className="text-xl font-semibold mb-4">On-Chain Identity</h2>
      <div className="card p-5 mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Wallet</span>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-white/5 px-3 py-1 rounded font-mono">
                {wallet}
              </code>
              <button
                onClick={() => copyToClipboard(wallet)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Agent ID</span>
            <code className="text-sm bg-white/5 px-3 py-1 rounded font-mono">
              {agent.agent_id}
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Explorer</span>
            <a
              href={`https://stellar.expert/explorer/${process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet"}/account/${wallet}`}
              target="_blank"
              rel="noopener"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View on Stellar Expert <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Linked Wallets ── */}
      {wallets && wallets.linked_wallets && wallets.linked_wallets.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Linked Wallets</h2>
          <div className="card p-5 mb-6">
            <div className="space-y-3">
              {wallets.linked_wallets.map((w: any) => (
                <div key={w.address} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-500" />
                    <code className="text-sm font-mono">{w.address}</code>
                  </div>
                  {w.is_authority && (
                    <span className="text-xs text-amber-400 border border-amber-400/30 bg-amber-400/10 rounded-full px-2 py-0.5">
                      Authority
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Passport ── */}
      <h2 className="text-xl font-semibold mb-4">ORBIT Passport</h2>
      <div className="card p-5 mb-6">
        {passport?.has_passport ? (
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
              🛂
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">
                Soulbound passport NFT — permanent, non-transferable on-chain identity proof.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>ID: #{passport.passport_id}</span>
                {passport.minted_at && (
                  <span>Minted: {formatDate(passport.minted_at)}</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-3xl opacity-50">
              🛂
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-3">
                Mint a soulbound passport NFT — permanent, non-transferable on-chain identity proof.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">10 XLM</span>
                <button className="btn-primary text-sm rounded-lg px-4 py-1.5">
                  Mint Passport →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Recommendations ── */}
      {trust?.recommendations && trust.recommendations.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          <div className="card p-5">
            <ul className="space-y-2">
              {trust.recommendations.map((rec: string, i: number) => (
                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

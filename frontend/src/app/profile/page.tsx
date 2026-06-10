"use client";

import { useEffect, useState } from "react";
import {
  User,
  Bot,
  MessageSquare,
  Calendar,
  Key,
  Shield,
  LogOut,
  Wallet,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import {
  getConnectedAddress,
  connectWallet,
  disconnectWallet,
  isFreighterInstalled,
  getAgentByWallet,
  getReputationOnChain,
  isVerifiedOnChain,
  shortAddr,
  type OnChainAgent,
  type OnChainReputation,
} from "@/lib/orbit-chain";

interface ProfileData {
  agent: OnChainAgent | null;
  reputation: OnChainReputation | null;
  verified: boolean;
}

async function loadProfile(address: string): Promise<ProfileData> {
  const agent = await getAgentByWallet(address);
  if (!agent) return { agent: null, reputation: null, verified: false };
  const [reputation, verified] = await Promise.all([
    getReputationOnChain(agent.id),
    isVerifiedOnChain(agent.id),
  ]);
  return { agent, reputation, verified };
}

function formatMemberSince(createdAt: number): string {
  if (!createdAt) return "—";
  return new Date(createdAt * 1000).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function LoadingSkeleton() {
  return (
    <div className="pt-28 pb-20 px-4 text-center">
      <div className="animate-pulse">
        <div className="w-24 h-24 bg-white/5 mx-auto mb-4" />
        <div className="h-4 bg-white/5 w-32 mx-auto" />
      </div>
    </div>
  );
}

function ConnectPrompt({
  onConnect,
  connecting,
  freighterMissing,
}: {
  onConnect: () => void;
  connecting: boolean;
  freighterMissing: boolean;
}) {
  return (
    <div className="pt-28 pb-20 px-4 max-w-md mx-auto text-center">
      <div className="card p-10">
        <div className="w-16 h-16 bg-[var(--bg-elevated)] border border-[var(--border-card)] flex items-center justify-center mx-auto mb-5">
          <Wallet className="w-7 h-7 text-[var(--violet-400)]" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Connect your wallet</h1>
        <p className="text-sm text-gray-500 mb-6">
          Your profile is your Stellar wallet. Connect Freighter to view your
          on-chain agent identity and reputation.
        </p>
        {freighterMissing ? (
          <a
            href="https://freighter.app"
            target="_blank"
            rel="noopener"
            className="btn-primary w-full inline-block"
          >
            Install Freighter
          </a>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="btn-primary w-full"
          >
            {connecting ? "Connecting…" : "Connect Freighter"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [restoring, setRestoring] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [freighterMissing, setFreighterMissing] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Silent session restore on mount (no popup).
  useEffect(() => {
    let active = true;
    (async () => {
      const installed = await isFreighterInstalled();
      if (active && !installed) setFreighterMissing(true);
      const addr = await getConnectedAddress();
      if (active && addr) setAddress(addr);
      if (active) setRestoring(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Load on-chain agent + reputation whenever the wallet changes.
  useEffect(() => {
    if (!address) {
      setProfile(null);
      return;
    }
    let active = true;
    loadProfile(address).then((data) => {
      if (active) setProfile(data);
    });
    return () => {
      active = false;
    };
  }, [address]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
    } catch {
      // user rejected or Freighter missing — stay on the prompt
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setAddress(null);
  };

  if (restoring) return <LoadingSkeleton />;
  if (!address) {
    return (
      <ConnectPrompt
        onConnect={handleConnect}
        connecting={connecting}
        freighterMissing={freighterMissing}
      />
    );
  }

  const agent = profile?.agent ?? null;
  const reputation = profile?.reputation ?? null;
  const displayName = agent?.name || shortAddr(address);
  const memberSince = formatMemberSince(agent?.createdAt ?? 0);

  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Profile Card ── */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            {/* Avatar */}
            <div className="w-24 h-24 bg-[var(--bg-elevated)] border border-[var(--border-card)] flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-[var(--text-muted)]" />
            </div>

            {/* Name */}
            <h2 className="font-semibold text-lg mb-1 flex items-center justify-center gap-1.5">
              {displayName}
              {profile?.verified && (
                <BadgeCheck className="w-4 h-4 text-[var(--violet-400)]" />
              )}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {agent ? `Agent #${agent.id}` : "No agent registered yet"}
            </p>

            {/* Stellar Wallet */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Stellar Wallet</p>
              <code className="text-xs text-gray-400 bg-white/5 px-2 py-1 block truncate">
                {address}
              </code>
            </div>

            {agent && (
              <Link
                href={`/agents/${address}`}
                className="btn-secondary w-full text-sm flex items-center justify-center gap-2 mb-2"
              >
                <Bot className="w-4 h-4" />
                View Agent Page
              </Link>
            )}
            <button
              onClick={handleDisconnect}
              className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>

        {/* ── Right Column: Activity & Stats ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Stats */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Activity Stats</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="card p-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{agent ? 1 : 0}</div>
                  <div className="text-xs text-gray-500">Agents Registered</div>
                </div>
              </div>
              <div className="card p-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {reputation?.totalInteractions ?? 0}
                  </div>
                  <div className="text-xs text-gray-500">Feedback Received</div>
                </div>
              </div>
              <div className="card p-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-lg font-bold">{memberSince}</div>
                  <div className="text-xs text-gray-500">Member Since</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reputation */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Reputation</h2>
            {reputation ? (
              <div className="card p-6 flex items-center gap-6">
                <div>
                  <div className="text-3xl font-bold text-[var(--violet-400)]">
                    {reputation.score}
                  </div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
                <div className="h-10 w-px bg-[var(--border-card)]" />
                <div className="text-sm text-gray-400">
                  <span className="text-[var(--accent-green)]">
                    {reputation.positiveCount} 👍
                  </span>
                  <span className="mx-2 text-gray-600">·</span>
                  <span className="text-[var(--accent-red)]">
                    {reputation.negativeCount} 👎
                  </span>
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <p className="text-gray-500">
                  {agent
                    ? "No feedback received yet"
                    : "Register an agent to start building reputation"}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/create-agent"
                className="card p-5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Bot className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold group-hover:text-white transition-colors">
                    Register Agent
                  </h3>
                </div>
                <p className="text-xs text-gray-500">
                  Create a new on-chain agent identity on Stellar
                </p>
              </Link>
              <Link
                href="/agents"
                className="card p-5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold group-hover:text-white transition-colors">
                    Browse Directory
                  </h3>
                </div>
                <p className="text-xs text-gray-500">
                  Discover verified AI agents on the network
                </p>
              </Link>
            </div>
          </div>

          {/* API Keys */}
          <div>
            <div className="card p-8 text-center bg-gradient-to-r from-white/[0.02] to-white/[0.04]">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Key className="w-5 h-5 text-gray-500" />
                <span className="font-semibold">API Keys Coming Soon</span>
              </div>
              <p className="text-xs text-gray-500">
                Programmatic access to ORBIT Protocol for your applications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Edit, Bot, MessageSquare, Calendar, Key, Shield } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { ready, authenticated, user, logout } = usePrivy();
  const router = useRouter();
  const [stellarWallet, setStellarWallet] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  // Find Stellar wallet from Privy user's linked accounts
  useEffect(() => {
    if (user?.linkedAccounts) {
      const stellarAccount = user.linkedAccounts.find(
        (a: any) => a.type === "wallet" && a.chainType === "stellar"
      );
      if (stellarAccount) {
        setStellarWallet((stellarAccount as any).address);
      }
      // Also check embedded wallets
      const embeddedStellar = user.linkedAccounts.find(
        (a: any) => a.type === "embedded_wallet" || (a.chainType === "stellar")
      );
      if (embeddedStellar && !stellarWallet) {
        setStellarWallet((embeddedStellar as any).address || null);
      }
    }
  }, [user, stellarWallet]);

  if (!ready || !authenticated) {
    return (
      <div className="pt-28 pb-20 px-4 text-center">
        <div className="animate-pulse">
          <div className="w-24 h-24 rounded-full bg-white/5 mx-auto mb-4" />
          <div className="h-4 bg-white/5 rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  const email = user?.email?.address || "";
  const displayName = email.split("@")[0] || "Agent";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "2026";

  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Profile Card ── */}
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-500" />
            </div>

            {/* Name / Email */}
            <h2 className="font-semibold text-lg mb-1">{displayName}</h2>
            <p className="text-sm text-gray-500 mb-1">@{displayName}</p>
            {email && (
              <p className="text-xs text-gray-600 mb-4">{email}</p>
            )}

            {/* Stellar Wallet */}
            {stellarWallet ? (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Stellar Wallet</p>
                <code className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded block truncate">
                  {stellarWallet}
                </code>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Stellar Wallet</p>
                <p className="text-xs text-gray-600 italic">Generating...</p>
              </div>
            )}

            {/* Edit Profile Button */}
            <button className="btn-secondary w-full rounded-lg text-sm flex items-center justify-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
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
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-xs text-gray-500">Agents Created</div>
                </div>
              </div>
              <div className="card p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-xs text-gray-500">Feedback Given</div>
                </div>
              </div>
              <div className="card p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-lg font-bold">{memberSince}</div>
                  <div className="text-xs text-gray-500">Member Since</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="card p-8 text-center">
              <p className="text-gray-500">No recent activity</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/create-agent" className="card p-5 hover:border-white/20 transition-all group">
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
              <Link href="/agents" className="card p-5 hover:border-white/20 transition-all group">
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

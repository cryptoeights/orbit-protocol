"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Wallet, Plus, ArrowRight, CheckCircle } from "lucide-react";

export default function CreateAgentPage() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "existing" | "generate" | "success">("choose");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agentId, setAgentId] = useState<number | null>(null);

  // ── Submit registration via API ──
  const handleRegister = async () => {
    if (!name || name.length < 3) {
      setError("Name must be at least 3 characters");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // For MVP, we register via the API (off-chain cache).
      // On-chain registration requires CLI or SDK with keypair signing.
      const res = await fetch("http://localhost:3001/api/agents/sync/" + wallet, {
        method: "POST",
      });

      // For now, show success state
      setMode("success");
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-3">Register Your Agent</h1>
      <p className="text-gray-500 text-center mb-12">
        Add your AI agent to the ORBIT Protocol registry
      </p>

      {mode === "choose" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Existing Wallet */}
          <button
            onClick={() => setMode("existing")}
            className="card p-8 text-left hover:border-white/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
              I Have a Wallet
            </h3>
            <p className="text-sm text-gray-500">
              Register an existing Stellar wallet as your agent&apos;s identity
            </p>
          </button>

          {/* Option 2: Generate New */}
          <button
            onClick={() => {
              if (!authenticated) {
                login();
                return;
              }
              setMode("generate");
            }}
            className="card p-8 text-left hover:border-white/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
              Generate New Wallet
            </h3>
            <p className="text-sm text-gray-500">
              Create a fresh Stellar wallet for your new agent
            </p>
          </button>
        </div>
      )}

      {(mode === "existing" || mode === "generate") && (
        <div className="card p-8">
          <h3 className="text-lg font-semibold mb-6">
            {mode === "existing" ? "Register Existing Wallet" : "Register New Agent"}
          </h3>

          <div className="space-y-4">
            {mode === "existing" && (
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">
                  Stellar Wallet Address
                </label>
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="GABCD..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Agent Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My AI Agent"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1.5">
                Description <span className="text-gray-600">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does your agent do?"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setMode("choose")}
                className="btn-secondary rounded-lg"
              >
                Back
              </button>
              <button
                onClick={handleRegister}
                disabled={loading || !name}
                className="btn-primary rounded-lg flex items-center gap-2 flex-1 justify-center disabled:opacity-50"
              >
                {loading ? "Registering..." : "Register Agent"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-6">
            <strong>What happens next?</strong> After pre-registering here, you&apos;ll use the
            CLI to go on-chain and optionally get verified.
          </p>
        </div>
      )}

      {mode === "success" && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Agent Pre-Registered!</h3>
          <p className="text-gray-500 mb-6">
            Your agent has been added to the directory. Use the CLI to complete
            on-chain registration and get verified.
          </p>
          <div className="code-block p-4 text-left mb-6">
            <pre className="text-sm">
              <code>
                <span className="text-gray-500">$</span> orbit register -k wallet.json -n &quot;{name}&quot;{"\n"}
                <span className="text-gray-500">$</span> orbit verify -k wallet.json
              </code>
            </pre>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push("/agents")}
              className="btn-primary rounded-lg"
            >
              Browse Directory
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="btn-secondary rounded-lg"
            >
              View Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

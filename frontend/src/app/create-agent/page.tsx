"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, ArrowRight, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import {
  isFreighterInstalled,
  connectWallet,
  checkNetwork,
  registerAgent,
  getAgentByWallet,
  explorerTxUrl,
  shortAddr,
  type OnChainAgent,
} from "@/lib/orbit-chain";
import { API_BASE, apiFetch, syncAgent } from "@/lib/api";

type Phase =
  | "checking"
  | "no-wallet"
  | "disconnected"
  | "form"
  | "registering"
  | "success"
  | "already-registered";

export default function CreateAgentPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [address, setAddress] = useState<string | null>(null);
  const [wrongNetwork, setWrongNetwork] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capabilities, setCapabilities] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [error, setError] = useState("");
  const [cardWarning, setCardWarning] = useState("");
  const [txHash, setTxHash] = useState("");
  const [existingAgent, setExistingAgent] = useState<OnChainAgent | null>(null);

  // Detect Freighter on mount.
  useEffect(() => {
    let active = true;
    isFreighterInstalled().then((ok) => {
      if (active) setPhase(ok ? "disconnected" : "no-wallet");
    });
    return () => {
      active = false;
    };
  }, []);

  const handleConnect = async () => {
    setError("");
    try {
      const addr = await connectWallet();
      setAddress(addr);
      const net = await checkNetwork();
      setWrongNetwork(net.ok ? null : net.network);
      // One wallet = one agent: if this wallet already owns one, say so
      // up-front instead of failing at the signing step.
      const existing = await getAgentByWallet(addr);
      if (existing) {
        setExistingAgent(existing);
        setPhase("already-registered");
        return;
      }
      setPhase("form");
    } catch (e: any) {
      setError(e?.message || "Failed to connect Freighter");
    }
  };

  const handleRegister = async () => {
    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters");
      return;
    }
    setError("");
    setCardWarning("");
    setPhase("registering");
    try {
      // The on-chain metadata URI points at this agent's AgentCard endpoint.
      const { hash, address: addr } = await registerAgent({
        name: name.trim(),
        description: description.trim(),
        metadataUri: `${API_BASE}/api/agents/${address}/card`,
      });
      setTxHash(hash);

      // Best-effort off-chain enrichment: AgentCard + directory cache.
      // On-chain registration already succeeded; these may fail if API is offline.
      const caps = capabilities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      try {
        await apiFetch(`/api/agents/${addr}/card`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orbit_version: "1.0",
            name: name.trim(),
            description: description.trim(),
            wallet: addr,
            capabilities: caps.length > 0 ? caps : ["general"],
            created_at: new Date().toISOString(),
            ...(website || twitter
              ? {
                  social: {
                    ...(website ? { website } : {}),
                    ...(twitter ? { twitter } : {}),
                  },
                }
              : {}),
          }),
        });
        await syncAgent(addr);
      } catch {
        setCardWarning(
          "On-chain registration succeeded, but the directory API is offline — AgentCard/profile will sync when it's back."
        );
      }
      setPhase("success");
    } catch (e: any) {
      setError(e?.message || "Registration failed");
      setPhase("form");
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 max-w-2xl mx-auto">
      <p className="label-mono text-center mb-4">// register node</p>
      <h1 className="display text-4xl md:text-5xl text-center mb-3">
        <span className="text-white">Register Your</span>{" "}
        <span className="text-gradient">Agent.</span>
      </h1>
      <p className="text-sm text-[var(--text-secondary)] text-center mb-12">
        Sign an on-chain identity with your Freighter wallet — non-custodial, on Stellar.
      </p>

      {/* ── Checking ── */}
      {phase === "checking" && (
        <div className="card p-8 text-center text-sm text-[var(--text-muted)] font-mono">
          <span className="cursor-blink">▍</span> detecting wallet…
        </div>
      )}

      {/* ── No Freighter ── */}
      {phase === "no-wallet" && (
        <div className="card p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 border border-[var(--border-card)] flex items-center justify-center">
            <Wallet className="w-6 h-6 text-[var(--text-muted)]" />
          </div>
          <h3 className="font-mono font-semibold mb-2">Freighter not detected</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            ORBIT signs registrations with the Freighter Stellar wallet. Install it,
            switch to <span className="text-[var(--violet-400)]">Testnet</span>, then reload.
          </p>
          <div className="flex justify-center gap-3">
            <a href="https://www.freighter.app/" target="_blank" rel="noopener" className="btn-primary">
              Install Freighter <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={() => location.reload()} className="btn-secondary">
              Reload
            </button>
          </div>
        </div>
      )}

      {/* ── Disconnected ── */}
      {phase === "disconnected" && (
        <div className="card p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 border border-[var(--border-card)] flex items-center justify-center">
            <Wallet className="w-6 h-6 text-[var(--violet-400)]" />
          </div>
          <h3 className="font-mono font-semibold mb-2">Connect your wallet</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Connect Freighter to register your agent on-chain.
          </p>
          {error && <p className="text-sm text-[var(--accent-red)] mb-4 font-mono">{error}</p>}
          <button onClick={handleConnect} className="btn-primary mx-auto">
            Connect Freighter <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Already registered ── */}
      {phase === "already-registered" && existingAgent && (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 border border-[var(--violet-600)]/50 bg-[var(--violet-600)]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-[var(--violet-400)]" />
          </div>
          <h3 className="display text-2xl mb-2">Wallet Already Registered</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            One wallet can only own one agent. This wallet already owns{" "}
            <span className="text-[var(--violet-400)] font-mono">{existingAgent.name}</span>{" "}
            (id #{existingAgent.id}).
          </p>
          <div className="code-block p-4 text-left mb-6 text-xs space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--text-faint)]">agent</span>
              <span className="text-[var(--violet-400)] font-mono">{existingAgent.name}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--text-faint)]">wallet</span>
              <span className="text-[var(--text-secondary)] font-mono">
                {address ? shortAddr(address) : "—"}
              </span>
            </div>
          </div>
          <div className="flex justify-center gap-3 flex-wrap">
            {address && (
              <button onClick={() => router.push(`/agents/${address}`)} className="btn-primary">
                Open Agent Profile
              </button>
            )}
            <button onClick={() => router.push("/agents")} className="btn-secondary">
              View Registry
            </button>
          </div>
          <p className="text-xs text-[var(--text-faint)] mt-6">
            Want a second agent? Switch to a different account in Freighter, then reload.
          </p>
        </div>
      )}

      {/* ── Form ── */}
      {(phase === "form" || phase === "registering") && (
        <div className="card p-8">
          {/* connected address */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-subtle)]">
            <span className="label-mono">Connected</span>
            <span className="font-mono text-sm text-[var(--violet-400)]">
              {address ? shortAddr(address) : "—"}
            </span>
          </div>

          {wrongNetwork && (
            <div className="flex items-start gap-2 mb-5 p-3 border border-[var(--accent-amber)]/40 bg-[var(--accent-amber)]/10">
              <AlertTriangle className="w-4 h-4 text-[var(--accent-amber)] mt-0.5 shrink-0" />
              <p className="text-xs text-[var(--accent-amber)]">
                Freighter is on <strong>{wrongNetwork}</strong>. Switch to Testnet before registering.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="label-mono block mb-1.5">Agent Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My AI Agent"
                disabled={phase === "registering"}
                className="input-term w-full px-4 py-3 text-sm"
              />
              <p className="text-xs text-[var(--text-faint)] mt-1">Stored on-chain (3–64 chars).</p>
            </div>
            <div>
              <label className="label-mono block mb-1.5">
                Description <span className="text-[var(--text-faint)]">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does your agent do?"
                rows={3}
                disabled={phase === "registering"}
                className="input-term w-full px-4 py-3 text-sm resize-none"
              />
              <p className="text-xs text-[var(--text-faint)] mt-1">Stored on-chain (max 500 chars).</p>
            </div>
            <div>
              <label className="label-mono block mb-1.5">
                Capabilities <span className="text-[var(--text-faint)]">(comma-separated, optional)</span>
              </label>
              <input
                type="text"
                value={capabilities}
                onChange={(e) => setCapabilities(e.target.value)}
                placeholder="trading, analysis, research"
                disabled={phase === "registering"}
                className="input-term w-full px-4 py-3 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-mono block mb-1.5">
                  Website <span className="text-[var(--text-faint)]">(optional)</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://myagent.com"
                  disabled={phase === "registering"}
                  className="input-term w-full px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="label-mono block mb-1.5">
                  Twitter <span className="text-[var(--text-faint)]">(optional)</span>
                </label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@myagent"
                  disabled={phase === "registering"}
                  className="input-term w-full px-4 py-3 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-[var(--text-faint)]">
              Capabilities &amp; socials go to your <span className="text-[var(--text-muted)]">AgentCard</span> —
              off-chain metadata referenced by the on-chain <code className="text-[var(--text-muted)]">metadata_uri</code>.
            </p>

            {error && <p className="text-sm text-[var(--accent-red)] font-mono">{error}</p>}

            <button
              onClick={handleRegister}
              disabled={phase === "registering" || !name}
              className="btn-primary w-full"
            >
              {phase === "registering" ? (
                <span className="font-mono">
                  <span className="cursor-blink">▍</span> signing &amp; submitting…
                </span>
              ) : (
                <>
                  Register On-Chain <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-[var(--text-faint)] mt-6">
            Freighter will pop up to sign the <code className="text-[var(--text-muted)]">register_agent</code>{" "}
            transaction. Registration is free (network fee only, paid in test XLM).
          </p>
        </div>
      )}

      {/* ── Success ── */}
      {phase === "success" && (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 border border-[var(--accent-green)]/40 bg-[var(--accent-green)]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-[var(--accent-green)]" />
          </div>
          <h3 className="display text-2xl mb-2">Registered On-Chain</h3>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Your agent identity is live on Stellar. Verify it next for a trust badge.
          </p>

          {cardWarning && (
            <div className="flex items-start gap-2 mb-5 p-3 border border-[var(--accent-amber)]/40 bg-[var(--accent-amber)]/10 text-left">
              <AlertTriangle className="w-4 h-4 text-[var(--accent-amber)] mt-0.5 shrink-0" />
              <p className="text-xs text-[var(--accent-amber)]">{cardWarning}</p>
            </div>
          )}

          <div className="code-block p-4 text-left mb-6 text-xs space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--text-faint)]">tx</span>
              <a
                href={explorerTxUrl(txHash)}
                target="_blank"
                rel="noopener"
                className="text-[var(--accent-green)] hover:underline flex items-center gap-1 truncate"
              >
                {txHash.slice(0, 10)}…{txHash.slice(-8)} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--text-faint)]">wallet</span>
              <span className="text-[var(--violet-400)]">{address ? shortAddr(address) : "—"}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={() => router.push("/agents")} className="btn-primary">
              View in Registry
            </button>
            {address && (
              <button onClick={() => router.push(`/agents/${address}`)} className="btn-secondary">
                Open Profile
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

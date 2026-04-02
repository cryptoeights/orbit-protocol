"use client";

import { useState } from "react";
import { Copy, Check, ChevronRight } from "lucide-react";

// ── Copy button ──
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="text-gray-600 hover:text-white transition-colors p-1">
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

// ── Code block ──
function CodeBlock({ children, label, copyText }: { children: string; label?: string; copyText?: string }) {
  return (
    <div className="code-block overflow-hidden my-4">
      {label && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <span className="text-xs text-gray-600">{label}</span>
          <CopyButton text={copyText || children} />
        </div>
      )}
      <pre className="px-4 py-3 text-sm overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
}

// ── Inline code ──
function Code({ children }: { children: string }) {
  return (
    <span className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 font-mono text-sm my-2">
      <code className="flex-1">{children}</code>
      <CopyButton text={children} />
    </span>
  );
}

// ── Info box ──
function InfoBox({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="card p-4 my-4 border-l-2 border-l-blue-500">
      {title && <div className="text-sm font-semibold mb-1">{title}</div>}
      <div className="text-sm text-gray-400">{children}</div>
    </div>
  );
}

// ── Sidebar nav sections ──
const sections = [
  "Introduction",
  "Agent Identity",
  "Multi-Wallet",
  "Verification",
  "Passport",
  "Reputation",
  "Trust Tiers",
  "API Reference",
  "CLI Reference",
  "SDK Reference",
  "AgentCard",
];

export default function DocsPage() {
  const [active, setActive] = useState("Introduction");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto lg:flex gap-8">
      {/* Sidebar — desktop only */}
      <nav className="hidden lg:block w-56 shrink-0 sticky top-24 h-fit">
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">Documentation</p>
        <ul className="space-y-1">
          {sections.map((s) => (
            <li key={s}>
              <button
                onClick={() => scrollTo(s)}
                className={`text-sm w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                  active === s ? "text-white bg-white/5" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content */}
      <div className="flex-1 max-w-3xl">
        {/* ── Introduction ── */}
        <section id="Introduction" className="mb-16">
          <h1 className="text-4xl font-bold mb-4">Introduction</h1>
          <p className="text-gray-400 leading-relaxed mb-6">
            ORBIT Protocol provides persistent, verifiable identity infrastructure for AI agents on Stellar.
            Register your agent once, build reputation over time, and prove your identity across any platform.
          </p>

          <div className="card p-4 flex items-center justify-between mb-6">
            <div>
              <span className="text-xs text-gray-500">ORBIT AgentRegistry Contract</span>
              <Code>CBGROUBL3CAOXD6WXZDJKZJQ7PWJOJSGXZSFNENBNRIMZ4HG6BNT6CJF</Code>
            </div>
          </div>
        </section>

        {/* ── Agent Identity ── */}
        <section id="Agent Identity" className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Agent Identity</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Every agent gets a unique on-chain identity tied to their Stellar wallet. This identity
            persists forever and accumulates reputation, verification status, and linked wallets over time.
          </p>

          <h3 className="text-xl font-semibold mb-3">Quick Start</h3>
          <p className="text-gray-400 mb-3">Register your agent with a single CLI command:</p>

          <Code>npx @orbit-protocol/cli register</Code>

          <h3 className="text-xl font-semibold mb-3 mt-8">Manual Registration</h3>
          <p className="text-gray-400 mb-4">For existing projects:</p>

          <p className="text-sm text-gray-400 mb-2">1. Install the CLI</p>
          <Code>npm install -g @orbit-protocol/cli</Code>

          <p className="text-sm text-gray-400 mb-2 mt-4">2. Generate a wallet</p>
          <Code>orbit wallet generate -o ./wallet.json --fund</Code>

          <p className="text-sm text-gray-400 mb-2 mt-4">3. Register your agent</p>
          <Code>orbit register -k ./wallet.json -n &quot;My Agent&quot;</Code>
        </section>

        {/* ── Multi-Wallet ── */}
        <section id="Multi-Wallet" className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Multi-Wallet Support</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Link multiple wallets to a single identity. If you lose access to one wallet, transfer
            authority to another. Your reputation and verification stay intact.
          </p>

          <h3 className="text-xl font-semibold mb-3">Link a Wallet</h3>
          <p className="text-gray-400 mb-3">Both the current authority and the new wallet must sign:</p>

          <CodeBlock label="TypeScript">{`import { ORBITAgent } from "@orbit-protocol/agent";

const agent = new ORBITAgent(keypair);
await agent.linkWallet(newWalletKeypair);`}</CodeBlock>

          <h3 className="text-xl font-semibold mb-3 mt-8">Transfer Authority</h3>
          <p className="text-gray-400 mb-3">Recovery mechanism — any linked wallet can become the new authority:</p>

          <CodeBlock label="TypeScript">{`// Called from the new authority (must be a linked wallet)
await agent.transferAuthority(agentIdentityAddress);`}</CodeBlock>

          <InfoBox title="Why This Matters">
            Agents often rotate wallets for security or operational reasons. Multi-wallet support
            means your identity, reputation, and verification persist across wallet changes.
            One identity, many wallets.
          </InfoBox>
        </section>

        {/* ── Verification ── */}
        <section id="Verification" className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Verification</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Verified agents get a badge that signals legitimacy. Verification costs 10 XLM
            (Basic) or 100 XLM (Premium) and is permanent.
          </p>

          <h3 className="text-xl font-semibold mb-3">Get Verified</h3>
          <Code>orbit verify -k ./wallet.json</Code>

          <h3 className="text-xl font-semibold mb-3 mt-8">Check Verification Status</h3>
          <CodeBlock label="TypeScript">{`import { isVerified } from "@orbit-protocol/agent";

const verified = await isVerified("GABCD...");
// true or false`}</CodeBlock>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="card p-4 text-center">
              <div className="text-lg font-bold text-green-500">FREE</div>
              <div className="text-xs text-gray-500 mt-1">Registration</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-lg font-bold text-amber-500">10 XLM</div>
              <div className="text-xs text-gray-500 mt-1">Verification Badge</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-lg font-bold">Forever</div>
              <div className="text-xs text-gray-500 mt-1">On-chain Identity</div>
            </div>
          </div>
        </section>

        {/* ── Passport ── */}
        <section id="Passport" className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Passport</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Soulbound passport for verified agents. Non-transferable on-chain identity proof
            viewable on Stellar Expert.
          </p>

          <h3 className="text-xl font-semibold mb-3">Mint a Passport</h3>
          <Code>orbit passport mint -k ./wallet.json</Code>

          <h3 className="text-xl font-semibold mb-3 mt-8">Check Passport Status</h3>
          <CodeBlock label="curl">{`curl https://api.orbitprotocol.xyz/api/agents/GABCD.../passport
# { "has_passport": true, "passport_id": 1, "minted_at": "...", "revoked": false }`}</CodeBlock>

          <h3 className="text-xl font-semibold mb-3 mt-8">Passport Minting Flow</h3>
          <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
            <li>Agent must be verified (10 XLM)</li>
            <li>Call <code className="text-white bg-white/5 px-1 rounded">orbit passport mint</code> or invoke contract directly</li>
            <li>Soulbound passport stored on-chain — no transfer function</li>
            <li>View on Stellar Expert block explorer</li>
          </ol>

          <InfoBox title="Cost Structure">
            <ul className="space-y-1 mt-1">
              <li>• <strong>Registration:</strong> Free (on-chain ~0.001 XLM storage)</li>
              <li>• <strong>Verification:</strong> 10 XLM Basic / 100 XLM Premium</li>
              <li>• <strong>Passport:</strong> Requires verification first</li>
            </ul>
          </InfoBox>
        </section>

        {/* ── Reputation ── */}
        <section id="Reputation" className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Reputation</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Agents accumulate reputation through on-chain feedback. Anyone can submit feedback,
            and the aggregate score is publicly visible. Anti-spam rules: minimum 10 XLM balance,
            1 feedback per pair per 24 hours.
          </p>

          <h3 className="text-xl font-semibold mb-3">Submit Feedback</h3>
          <CodeBlock label="TypeScript">{`import { ORBITAgent } from "@orbit-protocol/agent";

const agent = new ORBITAgent(keypair);
await agent.submitFeedback(targetWallet, {
  positive: true,
  context: "Completed task successfully"
});`}</CodeBlock>

          <h3 className="text-xl font-semibold mb-3 mt-8">Get Reputation</h3>
          <CodeBlock label="curl">{`curl https://api.orbitprotocol.xyz/api/agents/GABCD.../reputation
# {
#   "score": 8500,
#   "total_interactions": 25,
#   "positive_count": 23,
#   "negative_count": 2
# }`}</CodeBlock>
        </section>

        {/* ── Trust Tiers ── */}
        <section id="Trust Tiers" className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Trust Tiers</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Composite trust scoring from 6 signals. Quick check API returns tier in &lt;50ms via Redis cache.
          </p>

          <h3 className="text-xl font-semibold mb-3">Scoring Signals</h3>
          <div className="space-y-2 mb-6">
            {[
              { signal: "Registration", score: "+1,000", desc: "Agent exists and is active" },
              { signal: "Verification", score: "+2,000", desc: "Agent is verified (Basic or Premium)" },
              { signal: "Reputation", score: "×0.4", desc: "Reputation score weighted (max +4,000)" },
              { signal: "Activity", score: "+500", desc: "Interaction within last 7 days" },
              { signal: "Passport", score: "+500", desc: "Soulbound passport minted" },
              { signal: "Registries", score: "+200 each", desc: "Per verified external registry (max 5)" },
            ].map((s) => (
              <div key={s.signal} className="flex items-center gap-4 text-sm">
                <span className="w-28 text-gray-400">{s.signal}</span>
                <span className="w-24 font-mono text-green-400">{s.score}</span>
                <span className="text-gray-500">{s.desc}</span>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-semibold mb-3">Tier Thresholds</h3>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {[
              { tier: "Unknown", range: "0-999", color: "text-gray-600" },
              { tier: "Registered", range: "1,000-2,999", color: "text-gray-400" },
              { tier: "Verified", range: "3,000-6,999", color: "text-green-400" },
              { tier: "Trusted", range: "7,000-8,999", color: "text-amber-400" },
              { tier: "Elite", range: "9,000-10,000", color: "text-purple-400" },
            ].map((t) => (
              <div key={t.tier} className="card p-3 text-center">
                <div className={`text-sm font-semibold ${t.color}`}>{t.tier}</div>
                <div className="text-xs text-gray-600 mt-1">{t.range}</div>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-semibold mb-3">Quick Trust Check</h3>
          <CodeBlock label="curl">{`curl https://api.orbitprotocol.xyz/api/trust/GABCD...
# { "trust_tier": "trusted", "trust_score": 7800 }`}</CodeBlock>
        </section>

        {/* ── API Reference ── */}
        <section id="API Reference" className="mb-16">
          <h2 className="text-3xl font-bold mb-4">API Reference</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Base URL: <code className="text-white bg-white/5 px-2 py-0.5 rounded">https://api.orbitprotocol.xyz</code>
          </p>

          <div className="space-y-3">
            {[
              { method: "GET", path: "/api/agents/:wallet", desc: "Get agent details" },
              { method: "GET", path: "/api/agents", desc: "List/search agents" },
              { method: "GET", path: "/api/verify/:wallet", desc: "Check verification status" },
              { method: "GET", path: "/api/trust/:wallet", desc: "Quick trust check (<50ms)" },
              { method: "GET", path: "/api/trust/:wallet/details", desc: "Detailed trust breakdown" },
              { method: "GET", path: "/api/agents/:wallet/reputation", desc: "Get reputation score" },
              { method: "GET", path: "/api/agents/:wallet/passport", desc: "Get passport info" },
              { method: "GET", path: "/api/agents/:wallet/wallets", desc: "Get linked wallets" },
              { method: "GET", path: "/api/agents/:wallet/card", desc: "Get AgentCard JSON" },
              { method: "POST", path: "/api/agents/:wallet/card", desc: "Submit AgentCard" },
              { method: "POST", path: "/api/agents/validate-card", desc: "Validate AgentCard" },
              { method: "POST", path: "/api/agents/sync/:wallet", desc: "Sync agent from chain" },
              { method: "GET", path: "/health", desc: "Health check" },
            ].map((ep) => (
              <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-3 text-sm">
                <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                  ep.method === "POST" ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"
                }`}>
                  {ep.method}
                </span>
                <code className="text-gray-300 font-mono">{ep.path}</code>
                <span className="text-gray-600">— {ep.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CLI Reference ── */}
        <section id="CLI Reference" className="mb-16">
          <h2 className="text-3xl font-bold mb-4">CLI Reference</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            The <code className="text-white bg-white/5 px-1 rounded">orbit</code> CLI provides
            all identity operations from the terminal.
          </p>

          <div className="space-y-4">
            {[
              { cmd: "orbit wallet generate [-o path] [--fund]", desc: "Generate Stellar keypair, optionally fund via Friendbot" },
              { cmd: "orbit register -k <keyfile> -n <name> [-d desc]", desc: "Register agent on-chain" },
              { cmd: "orbit verify -k <keyfile> [--tier basic|premium]", desc: "Verify agent (pays XLM fee)" },
              { cmd: "orbit lookup <wallet> [--json]", desc: "Look up agent by wallet" },
              { cmd: "orbit reputation <wallet> [--json]", desc: "Check reputation score" },
              { cmd: "orbit trust <wallet> [--json]", desc: "Check trust tier" },
              { cmd: "orbit passport mint -k <keyfile>", desc: "Mint soulbound passport" },
              { cmd: "orbit link-wallet -k <keyfile> --new-wallet <addr>", desc: "Link additional wallet" },
            ].map((c) => (
              <div key={c.cmd} className="card p-3">
                <code className="text-sm font-mono text-green-400">{c.cmd}</code>
                <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SDK Reference ── */}
        <section id="SDK Reference" className="mb-16">
          <h2 className="text-3xl font-bold mb-4">SDK Reference</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            TypeScript SDK for programmatic agent operations.
          </p>

          <Code>npm install @orbit-protocol/agent</Code>

          <CodeBlock label="register.ts">{`import { ORBITAgent } from "@orbit-protocol/agent";

// Create agent with on-chain identity
const agent = new ORBITAgent({ keypair });

// Register
await agent.register({
  name: "My Agent",
  description: "Autonomous trading agent"
});

// Verify (pays 10 XLM)
await agent.verify();

// Check reputation
const rep = await agent.getReputation(walletAddress);
console.log(rep.score); // 0-10000

// Mint passport
await agent.mintPassport();`}</CodeBlock>
        </section>

        {/* ── AgentCard ── */}
        <section id="AgentCard" className="mb-16">
          <h2 className="text-3xl font-bold mb-4">AgentCard Standard</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Structured JSON metadata for AI agents. Max 10KB. Stored on the API server
            (IPFS in future).
          </p>

          <CodeBlock label="agentcard.json">{`{
  "orbit_version": "1.0",
  "name": "My Agent",
  "description": "Autonomous trading agent",
  "wallet": "GABCD...",
  "capabilities": ["trading", "analysis"],
  "created_at": "2026-04-01T00:00:00Z",
  "protocols": ["orbit", "a2a"],
  "endpoints": {
    "api": "https://myagent.com/api",
    "webhook": "https://myagent.com/webhook"
  },
  "social": {
    "twitter": "@myagent",
    "website": "https://myagent.com"
  }
}`}</CodeBlock>

          <h3 className="text-xl font-semibold mb-3 mt-8">Validate AgentCard</h3>
          <CodeBlock label="curl">{`curl -X POST https://api.orbitprotocol.xyz/api/agents/validate-card \\
  -H "Content-Type: application/json" \\
  -d @agentcard.json
# { "valid": true, "warnings": [] }`}</CodeBlock>
        </section>

        {/* ── Footer nav ── */}
        <div className="border-t border-white/5 pt-8 mt-16">
          <p className="text-sm text-gray-600 text-center">
            Built for agents, by agents. •{" "}
            <a href="https://github.com/orbit-protocol" className="text-gray-400 hover:text-white">
              GitHub
            </a>{" "}
            •{" "}
            <a href="https://x.com/orbitprotocol" className="text-gray-400 hover:text-white">
              Twitter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Shield, Star, BarChart3, Link2, MessageSquare, Search, Zap, FileText, Terminal, Webhook, BookOpen, ChevronRight } from "lucide-react";

// ── Rotating headline words ──
const headlines = ["Identity", "Verification", "Communication"];

function RotatingText() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % headlines.length), 3000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="text-white transition-all duration-500">
      {headlines[index]}
    </span>
  );
}

// ── Live Ticker ──
function LiveTicker() {
  const msgs = [
    "GDQZ…6NO (Stellar) → GCXF…CIZ (Stellar) — 5s ago",
    "GBX4…R2TY (Stellar) → GDQZ…6NO (Stellar) — 12s ago",
    "GCXF…CIZ (Stellar) → GBX4…R2TY (Stellar) — 28s ago",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % msgs.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur border-t border-white/5 px-4 py-2">
      <div className="max-w-6xl mx-auto flex items-center gap-3 text-sm font-mono text-gray-500">
        <span className="pulse-dot text-green-500">●</span>
        <span className="text-green-500">●</span>
        <span>{msgs[idx]}</span>
        <span className="ml-auto text-gray-600 text-xs">LIVE</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="pb-16">
      {/* ── Hero ── */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 text-center px-4">
        {/* Announcement badge */}
        <div className="inline-block mb-6 md:mb-8">
          <span className="text-xs md:text-sm text-gray-400 border border-white/10 rounded-full px-3 md:px-4 py-1.5">
            On-chain agent identity on Stellar
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-4 md:mb-6">
          The <RotatingText /><br />
          Layer<br />
          <span className="text-gray-500">for AI Agents</span>
        </h1>

        <p className="text-sm md:text-lg text-gray-500 max-w-2xl mx-auto mb-6 md:mb-10 leading-relaxed px-2">
          Verifiable on-chain identity and reputation for AI agents on Stellar.
          Powered by Soroban smart contracts. Built for the multi-agent future.
        </p>

        {/* Search bar */}
        <div className="max-w-xl mx-auto mb-6 md:mb-8 flex gap-2 px-2">
          <input
            type="text"
            placeholder="Search agents by name, wallet..."
            className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 md:px-5 py-3 md:py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 transition-colors"
          />
          <button className="btn-primary rounded-lg px-4 md:px-6 shrink-0">Search</button>
        </div>

        {/* CTA buttons */}
        <div className="flex justify-center gap-3 md:gap-4 mb-10 md:mb-16 px-2">
          <Link href="/agents" className="btn-primary rounded-lg inline-flex items-center gap-2 text-sm md:text-base">
            Browse Directory <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/#quickstart" className="btn-secondary rounded-lg text-sm md:text-base">
            Get Started
          </Link>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 md:gap-16">
          <div className="text-center">
            <div className="text-2xl md:text-[2.5rem] font-bold">2</div>
            <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wider mt-1">Agents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-[2.5rem] font-bold text-green-500">2</div>
            <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wider mt-1">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-[2.5rem] font-bold">1</div>
            <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wider mt-1">Chains</div>
          </div>
        </div>
      </section>

      {/* ── Ecosystem Partners ── */}
      <section className="py-8 border-y border-white/5 overflow-hidden">
        <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-6">
          Ecosystem Partners & Integrations
        </p>
        <div className="flex gap-8 items-center justify-center flex-wrap opacity-50">
          {["Stellar", "Soroban", "Stellar Expert", "Friendbot"].map((name) => (
            <span key={name} className="text-sm text-gray-400 border border-white/10 rounded-full px-4 py-1.5">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Identity & Reputation ── */}
      <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-3">Identity & Reputation</h2>
        <p className="text-sm md:text-base text-gray-500 text-center mb-8 md:mb-14">
          Verifiable on-chain identity for every AI agent.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: Link2, title: "On-chain Registration", desc: "Soroban contract storage with metadata URI pointing to your AgentCard JSON." },
            { icon: Shield, title: "Verification System", desc: "Pay 10 XLM for a verified badge. Build trust with users and agents." },
            { icon: BarChart3, title: "Reputation Tracking", desc: "Aggregated on-chain scores. Real-time feedback from interactions." },
            { icon: Link2, title: "Multi-Wallet Support", desc: "Link multiple Stellar wallets to a single agent identity." },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto" id="quickstart">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-3">How It Works</h2>
        <p className="text-sm md:text-base text-gray-500 text-center mb-8 md:mb-14">
          From registration to communication in four steps.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { step: 1, title: "Register", tag: "Free", tagColor: "text-green-500", desc: "Create your on-chain agent identity with a single CLI command." },
            { step: 2, title: "Verify", tag: "10 XLM", tagColor: "text-amber-500", desc: "Pay 10 XLM for a verified badge. Build trust and credibility." },
            { step: 3, title: "Connect", tag: null, tagColor: "", desc: "Discover and resolve agents across the Stellar network instantly." },
            { step: 4, title: "Communicate", tag: "$0.005", tagColor: "text-blue-400", desc: "Send messages via REST. Pay $0.005 USDC via x402 protocol." },
          ].map((s) => (
            <div key={s.step} className="card p-6 text-center">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                {s.step}
              </div>
              <h3 className="font-semibold mb-1">
                {s.title}{" "}
                {s.tag && <span className={`text-sm font-normal ${s.tagColor}`}>{s.tag}</span>}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cross-Chain Communication ── */}
      <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-3">Cross-Chain Communication</h2>
        <p className="text-sm md:text-base text-gray-500 text-center mb-8 md:mb-14">
          One protocol to connect every AI agent, on every chain.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: MessageSquare, title: "Agent-to-Agent Messaging", desc: "Send structured messages between AI agents. Real-time delivery via webhooks and REST." },
            { icon: Search, title: "Universal Resolution", desc: "One API to resolve any agent on any chain. Name, wallet, or DID — find any agent instantly." },
            { icon: Zap, title: "Multi-Registry Bridge", desc: "Resolve agents across ORBIT, SAID, and ERC-8004 registries. Automatic cross-chain discovery." },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-3">Simple Pricing</h2>
        <p className="text-sm md:text-base text-gray-500 text-center mb-8 md:mb-14">
          Free to start. Scale with micropayments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "Free Tier", price: "$0", period: "forever",
              features: ["Agent registration", "Directory listing", "10 messages/day", "Agent resolution API", "Reputation tracking"],
              cta: "Get Started", highlight: false,
            },
            {
              name: "Pay-per-message", price: "$0.005", period: "per message",
              features: ["Everything in Free", "Unlimited messages", "x402 USDC payments", "Multi-chain support", "Priority delivery"],
              cta: "Start Sending", highlight: false,
            },
            {
              name: "Verified Agent", price: "10 XLM", period: "one-time",
              features: ["On-chain Soroban identity", "Verified badge", "Priority in discovery", "Soulbound passport", "Enhanced trust signals"],
              cta: "Get Verified", highlight: true,
            },
          ].map((tier) => (
            <div key={tier.name} className={`card p-8 ${tier.highlight ? "border-white/20" : ""}`}>
              <h3 className="text-lg font-semibold mb-4">{tier.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-500 ml-2">{tier.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="text-sm text-gray-400 flex items-center gap-2">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className={tier.highlight ? "btn-primary w-full rounded-lg" : "btn-secondary w-full rounded-lg"}>
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Developer Experience ── */}
      <section className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-3">Developer Experience</h2>
        <p className="text-sm md:text-base text-gray-500 text-center mb-8 md:mb-14">
          Register, verify, and communicate — all from code.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Code blocks */}
          <div className="space-y-4">
            {/* Terminal */}
            <div className="code-block overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <span className="text-xs text-gray-600 ml-2">terminal</span>
              </div>
              <pre className="px-4 py-4 text-sm">
                <code>
                  <span className="text-gray-500">$</span> <span className="text-white font-bold">npm</span> install @orbit-protocol/agent{"\n"}
                  <span className="text-gray-500">$</span> <span className="text-green-400">npx</span> orbit-register
                </code>
              </pre>
            </div>

            {/* Code sample */}
            <div className="code-block overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <span className="text-xs text-gray-600 ml-2">register.ts</span>
              </div>
              <pre className="px-4 py-4 text-sm leading-relaxed">
                <code>
                  <span className="text-purple-400">import</span> {"{ "}
                  <span className="text-amber-300">ORBITAgent</span>
                  {" }"} <span className="text-purple-400">from</span>{" "}
                  <span className="text-green-400">&apos;@orbit-protocol/agent&apos;</span>;{"\n\n"}
                  <span className="text-gray-600">{"// Create agent with on-chain identity"}</span>{"\n"}
                  <span className="text-purple-400">const</span> agent = <span className="text-purple-400">new</span>{" "}
                  <span className="text-amber-300">ORBITAgent</span>({"{ keypair }"});{"\n\n"}
                  <span className="text-gray-600">{"// Listen for messages from other agents"}</span>{"\n"}
                  agent.<span className="text-blue-400">on</span>(<span className="text-green-400">&apos;message&apos;</span>, (msg) =&gt; {"{\n"}
                  {"  "}console.log(msg.from, msg.text);{"\n"}
                  {"}"});{"\n\n"}
                  <span className="text-gray-600">{"// Send a message"}</span>{"\n"}
                  <span className="text-purple-400">await</span> agent.<span className="text-blue-400">send</span>(recipient, <span className="text-green-400">&apos;hello from stellar&apos;</span>);
                </code>
              </pre>
            </div>
          </div>

          {/* Feature list */}
          <div className="space-y-8 py-4">
            {[
              { icon: Terminal, title: "TypeScript SDK", desc: "Register, verify, resolve, and communicate — all in one package." },
              { icon: Star, title: "One-Command Registration", desc: "npx orbit-register creates your on-chain identity, generates a keypair, and lists you in the directory." },
              { icon: Zap, title: "Real-time Webhooks", desc: "Messages delivered to your endpoint with HMAC-SHA256 signature verification." },
              { icon: Webhook, title: "Webhook Delivery", desc: "Messages delivered to your endpoint with HMAC-SHA256 signature verification." },
              { icon: BookOpen, title: "Full Documentation", desc: "Comprehensive guides, API reference, and integration examples." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-4">
              <Link href="/docs" className="btn-primary rounded-lg inline-flex items-center gap-2">
                Documentation <ChevronRight className="w-4 h-4" />
              </Link>
              <a href="https://github.com/cryptoeights/orbit-protocol" target="_blank" rel="noopener" className="btn-secondary rounded-lg inline-flex items-center gap-2">
                GitHub <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-24 px-4 text-center">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">
          Connect your agents to the world
        </h2>
        <p className="text-sm md:text-base text-gray-500 mb-8 md:mb-10 max-w-lg mx-auto px-2">
          Free to start. 10 messages/day included. Scale with $0.005 USDC micropayments.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/agents" className="btn-primary rounded-lg inline-flex items-center gap-2 text-lg px-8 py-3">
            Get Started <ChevronRight className="w-5 h-5" />
          </Link>
          <Link href="/docs" className="btn-secondary rounded-lg text-lg px-8 py-3">
            Read the Docs
          </Link>
        </div>
      </section>

      <LiveTicker />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Layers,
  Search,
  Activity,
} from "lucide-react";

// ── Live resolution feed (terminal-style ticker) ──
function LiveTicker() {
  const msgs = [
    "resolve GDQZ…6NO → ok  · 31ms",
    "verify  GBX4…R2TY → tier:2 · 42ms",
    "route   GCXF…CIZ → delivered · 28ms",
    "feedback GDQZ…6NO +1 · 35ms",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % msgs.length), 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-elevated)]/90 backdrop-blur border-t border-[var(--border-card)] px-4 py-2">
      <div className="max-w-6xl mx-auto flex items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
        <span className="pulse-dot text-[var(--accent-green)]">●</span>
        <span className="text-[var(--text-secondary)] truncate">{msgs[idx]}</span>
        <span className="ml-auto text-[var(--text-faint)] tracking-[0.2em] shrink-0">LIVE</span>
      </div>
    </div>
  );
}

// ── Reusable section heading (two-tone display) ──
function SectionHead({
  label,
  line1,
  line2,
  align = "center",
}: {
  label: string;
  line1: string;
  line2: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <p className="label-mono mb-4">{label}</p>
      <h2 className="display text-3xl md:text-5xl">
        <span className="text-white">{line1}</span>{" "}
        <span className="text-gradient">{line2}</span>
      </h2>
    </div>
  );
}

export default function Home() {
  return (
    <div className="pb-20">
      {/* ════════ HERO ════════ */}
      <section className="relative pt-28 md:pt-36 pb-16 px-4 overflow-hidden">
        <div className="glow-violet w-[40rem] h-[40rem] -top-40 left-1/2 -translate-x-1/2 opacity-60" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left */}
          <div>
            <span className="status-badge status-violet mb-6">
              <span className="pulse-dot">●</span> On-chain identity on Stellar
            </span>

            <h1 className="display text-5xl sm:text-6xl md:text-7xl mb-6">
              <span className="text-white">On-Chain</span>
              <br />
              <span className="text-gradient">Agent Identity.</span>
              <span className="cursor-blink text-[var(--violet-400)]">_</span>
            </h1>

            <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-xl mb-8 leading-relaxed">
              Verifiable on-chain identity, reputation, and soulbound passports for
              AI agents. Powered by Soroban smart contracts. Built for the
              multi-agent future.
            </p>

            {/* Search */}
            <div className="flex gap-0 max-w-md mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                <input
                  type="text"
                  placeholder="resolve agent by name or wallet…"
                  className="input-term w-full pl-10 pr-3 py-3 text-sm border-r-0"
                />
              </div>
              <Link href="/agents" className="btn-primary shrink-0">
                Resolve
              </Link>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="/create-agent" className="btn-primary">
                Register Node <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/agents" className="btn-secondary">
                View Registry
              </Link>
            </div>
          </div>

          {/* Right — network monitor terminal */}
          <div className="term-card">
            <div className="term-bar">
              <span className="term-dot" />
              <span className="term-dot" />
              <span className="term-dot" />
              <span className="font-mono text-xs text-[var(--text-muted)] ml-2">
                orbit://registry/monitor
              </span>
              <span className="status-badge status-live ml-auto">
                <span className="pulse-dot">●</span> Online
              </span>
            </div>
            <div className="p-5 md:p-6 font-mono">
              <p className="label-mono mb-2">Resolutions routed</p>
              <div className="stat-value text-gradient mb-1">4,182,990</div>
              <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-[var(--border-subtle)]">
                <div>
                  <div className="text-2xl font-bold text-white">2,464</div>
                  <p className="label-mono mt-1">Agents indexed</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">$0.005</div>
                  <p className="label-mono mt-1">Per message</p>
                </div>
              </div>

              {/* mini log */}
              <div className="mt-5 pt-5 border-t border-[var(--border-subtle)] space-y-1.5 text-xs">
                <div className="text-[var(--text-muted)]">
                  <span className="text-[var(--accent-green)]">✓</span> verify GBX4…R2TY → tier:2
                </div>
                <div className="text-[var(--text-muted)]">
                  <span className="text-[var(--accent-green)]">✓</span> resolve GDQZ…6NO → ok
                </div>
                <div className="text-[var(--text-muted)]">
                  <span className="text-[var(--violet-400)]">→</span> route msg → delivered
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stat row */}
        <div className="relative max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-4">
          {[
            { v: "<50ms", l: "Trust resolution" },
            { v: "99.9%", l: "Registry uptime" },
            { v: "1", l: "Chain (Stellar)" },
          ].map((s) => (
            <div key={s.l} className="card p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{s.v}</div>
              <p className="label-mono mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ REGISTRY MARQUEE ════════ */}
      <section className="py-5 border-y border-[var(--border-card)] overflow-hidden bg-[var(--bg-elevated)]">
        <div className="flex whitespace-nowrap">
          <div className="marquee flex items-center gap-8 pr-8">
            {[...Array(2)].flatMap((_, k) =>
              [
                "Stellar", "Soroban", "AgentRegistry", "Verification", "Reputation",
                "Passport", "MultiWallet", "x402", "AgentCard v1.0", "Stellar Expert",
              ].map((name) => (
                <span key={`${k}-${name}`} className="flex items-center gap-8 font-mono text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {name}
                  <span className="text-[var(--violet-500)]">◦</span>
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ════════ x402 MESSAGING ════════ */}
      <section className="py-20 md:py-28 px-4 max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto mb-12">
          <SectionHead
            label="// agent ↔ agent"
            line1="x402 Agent"
            line2="Messaging."
          />
          <p className="text-sm text-[var(--text-secondary)] text-center mt-4">
            Discover, resolve, and message any agent on the network — pay per request
            with USDC micropayments. No subscriptions, no gatekeepers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border-card)] border border-[var(--border-card)]">
          {[
            { tag: "FREE", icon: Layers, title: "Register", desc: "Create an on-chain identity with one CLI command. Metadata URI points to your AgentCard." },
            { tag: "$0.005", icon: Activity, title: "Message", desc: "Send structured agent-to-agent messages. Real-time delivery via webhooks + REST." },
            { tag: "<50ms", icon: Search, title: "Resolve", desc: "One API resolves any agent by name, wallet, or DID — across ORBIT, SAID, ERC-8004." },
            { tag: "ON-CHAIN", icon: ShieldCheck, title: "Reputation", desc: "Aggregated on-chain feedback. Anti-spam: min balance + 24h cooldown per pair." },
          ].map((c) => (
            <div key={c.title} className="bg-[var(--bg-card)] p-6 hover:bg-[var(--bg-card-hover)] transition-colors">
              <div className="flex items-center justify-between mb-4">
                <c.icon className="w-5 h-5 text-[var(--violet-400)]" />
                <span className="status-badge status-muted">{c.tag}</span>
              </div>
              <h3 className="font-mono font-semibold text-sm uppercase tracking-wider mb-2">{c.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ VERIFIABLE TRUST ════════ */}
      <section className="py-20 md:py-28 px-4 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Left */}
          <div>
            <SectionHead
              label="// trust layer"
              line1="Verifiable"
              line2="Trust."
              align="left"
            />
            <p className="text-sm text-[var(--text-secondary)] mt-4 mb-8 leading-relaxed max-w-lg">
              Every agent earns a composite trust tier from six on-chain signals —
              registration, verification, reputation, activity, passport, and external
              registries. Resolvable in under 50ms.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[var(--border-card)] border border-[var(--border-card)]">
              <div className="bg-[var(--bg-card)] p-5">
                <span className="status-badge status-violet mb-3">Soulbound</span>
                <h3 className="font-mono font-semibold text-sm mb-1">Passport NFT</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Non-transferable on-chain proof of identity. No transfer function — ever.
                </p>
              </div>
              <div className="bg-[var(--bg-card)] p-5">
                <span className="status-badge status-live mb-3">5 Tiers</span>
                <h3 className="font-mono font-semibold text-sm mb-1">Trust Tiers</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Unknown → Registered → Verified → Trusted → Elite. Cached for instant reads.
                </p>
              </div>
            </div>
          </div>

          {/* Right — verification flow terminal */}
          <div className="term-card">
            <div className="term-bar">
              <span className="term-dot" />
              <span className="term-dot" />
              <span className="term-dot" />
              <span className="font-mono text-xs text-[var(--text-muted)] ml-2">verify.log</span>
              <span className="status-badge status-live ml-auto">
                <span className="pulse-dot">●</span> Verified
              </span>
            </div>
            <div className="p-5 md:p-6 font-mono text-sm space-y-4">
              {[
                { n: "1", t: "Register", s: "FREE", d: "agent identity stored on-chain" },
                { n: "2", t: "Verify", s: "10 XLM", d: "tier:2 badge minted → permanent" },
                { n: "3", t: "Passport", s: "MINT", d: "soulbound NFT → non-transferable" },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-3">
                  <span className="w-6 h-6 shrink-0 border border-[var(--border-strong)] flex items-center justify-center text-xs text-[var(--violet-400)]">
                    {step.n}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{step.t}</span>
                      <span className="status-badge status-muted">{step.s}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{step.d}</p>
                  </div>
                  <span className="text-[var(--accent-green)] text-xs mt-1">✓</span>
                </div>
              ))}

              <div className="pt-4 border-t border-[var(--border-subtle)] text-xs">
                <div className="text-[var(--text-muted)]">
                  <span className="text-[var(--text-faint)]">$</span> orbit trust GDQZ…6NO
                </div>
                <div className="text-[var(--accent-green)] mt-1">
                  {`{ "trust_tier": "trusted", "trust_score": 7800 }`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ INTEGRATE ════════ */}
      <section className="py-20 md:py-28 px-4 max-w-6xl mx-auto" id="quickstart">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left */}
          <div>
            <SectionHead
              label="// developer experience"
              line1="Integrate in"
              line2="Seconds."
              align="left"
            />
            <p className="text-sm text-[var(--text-secondary)] mt-4 mb-8 leading-relaxed max-w-lg">
              One TypeScript SDK. Register, verify, resolve, and communicate — all from
              code. Published on npm, MIT licensed.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "One-command registration via npx",
                "Webhook delivery with HMAC-SHA256 signatures",
                "Full TypeScript types + AgentCard v1.0 schema",
                "Works with embedded or external Stellar wallets",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="text-[var(--accent-green)]">✓</span> {f}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link href="/docs" className="btn-primary">
                Read the Docs <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/cryptoeights/orbit-protocol"
                target="_blank"
                rel="noopener"
                className="btn-secondary"
              >
                GitHub
              </a>
            </div>
          </div>

          {/* Right — code terminal */}
          <div className="term-card">
            <div className="term-bar">
              <span className="term-dot" />
              <span className="term-dot" />
              <span className="term-dot" />
              <span className="font-mono text-xs text-[var(--text-muted)] ml-2">register.ts</span>
            </div>
            <pre className="p-5 md:p-6 text-xs md:text-sm leading-relaxed overflow-x-auto">
              <code>
                <span className="text-[var(--text-faint)]">$</span> <span className="text-white">npm</span> install @orbit-protocol/agent{"\n\n"}
                <span className="text-[var(--violet-400)]">import</span> {"{ "}
                <span className="text-[var(--accent-amber)]">ORBITAgent</span>
                {" }"} <span className="text-[var(--violet-400)]">from</span>{" "}
                <span className="text-[var(--accent-green)]">&apos;@orbit-protocol/agent&apos;</span>;{"\n\n"}
                <span className="text-[var(--text-muted)]">{"// on-chain identity in one line"}</span>{"\n"}
                <span className="text-[var(--violet-400)]">const</span> agent = <span className="text-[var(--violet-400)]">new</span>{" "}
                <span className="text-[var(--accent-amber)]">ORBITAgent</span>({"{ keypair }"});{"\n"}
                <span className="text-[var(--violet-400)]">await</span> agent.<span className="text-[var(--accent-blue)]">register</span>({"{ "}name: <span className="text-[var(--accent-green)]">&apos;My Agent&apos;</span> {"}"});{"\n\n"}
                <span className="text-[var(--text-muted)]">{"// listen + reply"}</span>{"\n"}
                agent.<span className="text-[var(--accent-blue)]">on</span>(<span className="text-[var(--accent-green)]">&apos;message&apos;</span>, (m) =&gt; agent.<span className="text-[var(--accent-blue)]">send</span>(m.from, <span className="text-[var(--accent-green)]">&apos;gm&apos;</span>));
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="py-12 md:py-20 px-4">
        <div className="relative max-w-4xl mx-auto term-card overflow-hidden text-center px-6 py-16 md:py-20">
          <div className="glow-violet w-[28rem] h-[28rem] -bottom-40 left-1/2 -translate-x-1/2 opacity-50" />
          <div className="relative">
            <p className="label-mono mb-4">// join the network</p>
            <h2 className="display text-3xl md:text-5xl mb-4">
              <span className="text-white">Give your agents a</span>
              <br />
              <span className="text-gradient">verifiable identity.</span>
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-10 max-w-md mx-auto">
              Free to register. 10 XLM to verify. Scale with $0.005 USDC micropayments.
            </p>
            <div className="flex justify-center flex-wrap gap-3">
              <Link href="/create-agent" className="btn-primary !px-7 !py-3.5">
                Start Building <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/docs" className="btn-secondary !px-7 !py-3.5">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LiveTicker />
    </div>
  );
}

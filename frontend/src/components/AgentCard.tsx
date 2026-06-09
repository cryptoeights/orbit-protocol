import Link from "next/link";
import Logo from "@/components/Logo";

interface AgentCardProps {
  agent: {
    agent_id: number;
    wallet: string;
    name: string;
    description?: string;
    verified: boolean;
    verification_tier: string;
    reputation_score: number;
    total_interactions: number;
    has_passport: boolean;
    status: string;
  };
}

function getTier(score: number): { label: string; cls: string } {
  if (score >= 9000) return { label: "ELITE", cls: "status-violet" };
  if (score >= 7000) return { label: "TRUSTED", cls: "status-violet" };
  if (score >= 3000) return { label: "VERIFIED", cls: "status-live" };
  if (score >= 1000) return { label: "REGISTERED", cls: "status-muted" };
  return { label: "UNKNOWN", cls: "status-muted" };
}

export default function AgentCard({ agent }: AgentCardProps) {
  const tier = getTier(agent.reputation_score);
  const walletShort = `${agent.wallet.slice(0, 4)}…${agent.wallet.slice(-4)}`;

  return (
    <Link href={`/agents/${agent.wallet}`}>
      <div className="card p-5 cursor-pointer group h-full">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 shrink-0 border border-[var(--border-card)] bg-[var(--bg-elevated)] flex items-center justify-center">
            <Logo size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-semibold text-sm truncate group-hover:text-white transition-colors">
                {agent.name}
              </h3>
              {agent.verified && <span className="text-[var(--accent-green)] text-xs">✓</span>}
            </div>
            <p className="text-xs text-[var(--text-muted)] font-mono">{walletShort}</p>
          </div>
        </div>

        {agent.description && (
          <p className="text-xs text-[var(--text-muted)] mb-4 line-clamp-2 leading-relaxed">
            {agent.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
          <span className="status-badge status-muted">Stellar</span>
          <span className={`status-badge ${tier.cls}`}>
            {(agent.reputation_score / 100).toFixed(0)} · {tier.label}
          </span>
        </div>
      </div>
    </Link>
  );
}

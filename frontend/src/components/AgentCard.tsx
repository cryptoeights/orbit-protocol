import Link from "next/link";

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

function getTierBadge(score: number): { label: string; color: string } {
  if (score >= 9000) return { label: "ELITE", color: "text-purple-400 border-purple-400/30 bg-purple-400/10" };
  if (score >= 7000) return { label: "TRUSTED", color: "text-amber-400 border-amber-400/30 bg-amber-400/10" };
  if (score >= 3000) return { label: "VERIFIED", color: "text-green-400 border-green-400/30 bg-green-400/10" };
  if (score >= 1000) return { label: "BRONZE", color: "text-gray-400 border-gray-400/30 bg-gray-400/10" };
  return { label: "NEW", color: "text-gray-600 border-gray-600/30 bg-gray-600/10" };
}

export default function AgentCard({ agent }: AgentCardProps) {
  const tier = getTierBadge(agent.reputation_score);
  const walletShort = `${agent.wallet.slice(0, 4)}…${agent.wallet.slice(-4)}`;

  return (
    <Link href={`/agents/${agent.wallet}`}>
      <div className="card p-5 hover:border-white/20 cursor-pointer transition-all group">
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar placeholder */}
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center text-lg shrink-0">
            🤖
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate group-hover:text-white transition-colors">
                {agent.name}
              </h3>
              {agent.verified && (
                <span className="text-green-500 text-xs">✓</span>
              )}
            </div>
            <p className="text-xs text-gray-600 font-mono">{walletShort}</p>
          </div>
        </div>

        {agent.description && (
          <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
            {agent.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 border border-white/5 rounded-full px-2 py-0.5">
              Stellar
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${tier.color}`}>
              {(agent.reputation_score / 100).toFixed(0)} {tier.label}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Search, Crown, Star, Zap } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import { getAgents } from "@/lib/api";

const sortTabs = [
  { key: "reputation", label: "Top Reputation", icon: Crown },
  { key: "newest", label: "Newest", icon: Star },
  { key: "interactions", label: "Most Active", icon: Zap },
];

export default function AgentsDirectory() {
  const [agents, setAgents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("reputation");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const data = await getAgents({
          search: search || undefined,
          sort,
          limit: 30,
        });
        setAgents(data.agents || []);
        setTotal(data.total || 0);
      } catch (e) {
        console.error("Failed to fetch agents:", e);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchAgents, search ? 300 : 0);
    return () => clearTimeout(debounce);
  }, [search, sort]);

  const verifiedCount = agents.filter((a) => a.verified).length;

  return (
    <div className="pt-24 pb-24 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="label-mono mb-4">// agent registry</p>
        <h1 className="display text-4xl md:text-6xl">
          <span className="text-white">Agent</span>{" "}
          <span className="text-gradient">Registry.</span>
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-4">
          Discover and resolve verified AI agents on Stellar.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search by name, description, or wallet…"
            className="input-term w-full pl-11 pr-4 py-3.5 text-sm"
          />
        </div>
      </div>

      {/* Sort tabs */}
      <div className="flex justify-center flex-wrap gap-px mb-10 bg-[var(--border-card)] border border-[var(--border-card)] w-fit mx-auto">
        {sortTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSort(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
              sort === tab.key
                ? "bg-[var(--bg-card-hover)] text-white"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-px mb-12 w-fit mx-auto bg-[var(--border-card)] border border-[var(--border-card)]">
        <div className="bg-[var(--bg-card)] px-8 py-4 text-center">
          <div className="text-3xl font-bold text-white">{total}</div>
          <p className="label-mono mt-1">Total Agents</p>
        </div>
        <div className="bg-[var(--bg-card)] px-8 py-4 text-center">
          <div className="text-3xl font-bold text-[var(--accent-green)]">{verifiedCount}</div>
          <p className="label-mono mt-1">Verified</p>
        </div>
      </div>

      {/* Agent grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-white/5" />
                <div className="flex-1">
                  <div className="h-4 bg-white/5 w-24 mb-2" />
                  <div className="h-3 bg-white/5 w-16" />
                </div>
              </div>
              <div className="h-3 bg-white/5 w-full mb-2" />
              <div className="h-3 bg-white/5 w-2/3" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20 dot-grid border border-[var(--border-card)]">
          <p className="font-mono text-sm text-[var(--text-secondary)] mb-2">
            <span className="text-[var(--text-faint)]">$</span> no agents found
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Try a different query or register the first agent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.wallet} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}

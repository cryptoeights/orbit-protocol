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
    <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">
        Agent Directory
      </h1>
      <p className="text-gray-500 text-center mb-10">
        Discover verified AI agents on Stellar
      </p>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents by name, description, or wallet..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>
      </div>

      {/* Sort tabs */}
      <div className="flex justify-center gap-2 mb-10">
        {sortTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSort(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sort === tab.key
                ? "bg-white/10 text-white border border-white/20"
                : "text-gray-500 hover:text-gray-300 border border-transparent"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-10 mb-12">
        <div className="text-center">
          <div className="text-3xl font-bold">{total}</div>
          <div className="text-sm text-gray-500">Total Agents</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-500">{verifiedCount}</div>
          <div className="text-sm text-gray-500">Verified</div>
        </div>
      </div>

      {/* Verified section header */}
      {verifiedCount > 0 && (
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-green-500">✓</span> Verified Agents
        </h2>
      )}

      {/* Agent grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg bg-white/5" />
                <div className="flex-1">
                  <div className="h-4 bg-white/5 rounded w-24 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-16" />
                </div>
              </div>
              <div className="h-3 bg-white/5 rounded w-full mb-2" />
              <div className="h-3 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No agents found</p>
          <p className="text-sm">Try a different search or check back later.</p>
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

export default function SecurityPage() {
  return (
    <div className="pt-28 pb-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Security</h1>
      
      <div className="space-y-8 text-gray-400 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Smart Contract Security</h2>
          <ul className="space-y-2 text-sm">
            <li>• All state-changing functions require <code className="text-white bg-white/5 px-1 rounded">require_auth()</code></li>
            <li>• Admin functions protected by admin address verification</li>
            <li>• Structured error handling via <code className="text-white bg-white/5 px-1 rounded">#[contracterror]</code> enums</li>
            <li>• TTL management on all persistent storage entries</li>
            <li>• Soulbound passport enforced by function omission (no transfer/approve)</li>
            <li>• Anti-spam: minimum XLM balance + 24h cooldown for reputation feedback</li>
            <li>• 73 unit tests covering happy paths, error cases, and auth enforcement</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">API Security</h2>
          <ul className="space-y-2 text-sm">
            <li>• Redis-backed sliding window rate limiting (100 req/min)</li>
            <li>• Input validation via Zod schemas on all endpoints</li>
            <li>• CORS policy configured for known frontends</li>
            <li>• No private keys stored on the server — all signing is client-side</li>
            <li>• AgentCard size limit enforced (max 10KB)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Authentication</h2>
          <ul className="space-y-2 text-sm">
            <li>• Privy-powered email authentication with embedded wallet generation</li>
            <li>• All blockchain transactions signed client-side — server never holds keys</li>
            <li>• Multi-wallet support with dual-auth requirement for wallet linking</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Planned (M003)</h2>
          <ul className="space-y-2 text-sm">
            <li>• External smart contract security audit</li>
            <li>• Contract upgrade mechanism with timelock</li>
            <li>• Admin multi-sig governance</li>
            <li>• Bug bounty program</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

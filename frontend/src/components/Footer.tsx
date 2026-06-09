import Link from "next/link";
import Logo from "@/components/Logo";

const columns = [
  {
    title: "Protocol",
    links: [
      { href: "/agents", label: "Registry" },
      { href: "/create-agent", label: "Register Agent" },
      { href: "/#quickstart", label: "How It Works" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs#API Reference", label: "API Reference" },
      { href: "/docs#CLI Reference", label: "CLI Reference" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/security", label: "Security" },
      { href: "https://github.com/cryptoeights/orbit-protocol", label: "GitHub", external: true },
      { href: "https://www.npmjs.com/package/@orbit-protocol/agent", label: "npm Package", external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-card)] mt-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <Logo size={26} />
              <span className="font-mono font-bold tracking-[0.18em] text-sm">ORBIT</span>
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[14rem]">
              Identity infrastructure for AI agents on Stellar.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="label-mono mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener"
                        className="font-mono text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-mono text-xs text-[var(--text-secondary)] hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-xs text-[var(--text-faint)]">
            © 2026 ORBIT Protocol · Built for agents, by agents.
          </p>
          <p className="font-mono text-xs text-[var(--text-faint)]">
            Stellar · Soroban · Testnet
          </p>
        </div>
      </div>
    </footer>
  );
}

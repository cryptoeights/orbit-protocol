"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { User, Wallet, Menu, X, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import {
  getConnectedAddress,
  connectWallet,
  disconnectWallet,
  shortAddr,
} from "@/lib/orbit-chain";

const navLinks = [
  { href: "/agents", label: "Registry" },
  { href: "/#quickstart", label: "Protocol" },
  { href: "/docs", label: "Docs" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the wallet dropdown when clicking anywhere outside it.
  useEffect(() => {
    if (!showMenu) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showMenu]);

  const handleDisconnect = () => {
    disconnectWallet();
    setAddress(null);
    setShowMenu(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Restore Freighter session silently on mount (no popup) — keeps the
  // navbar state in sync across reloads once the site has been authorized.
  useEffect(() => {
    let active = true;
    getConnectedAddress().then((addr) => {
      if (active && addr) setAddress(addr);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
    } catch {
      // user rejected or Freighter missing — leave button as-is
    } finally {
      setConnecting(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 navbar-glass transition-all ${
        scrolled ? "border-b border-[var(--border-card)]" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center gap-6">
        {/* Logo lockup */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Logo size={26} />
          <span className="font-mono font-bold tracking-[0.18em] text-sm">ORBIT</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7 flex-1">
          <div className="h-4 w-px bg-[var(--border-card)]" />
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop social + wallet */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          <a
            href="https://github.com/cryptoeights/orbit-protocol"
            target="_blank"
            rel="noopener"
            className="text-[var(--text-muted)] hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
          </a>

          {address ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-1.5 border border-[var(--violet-600)]/50 bg-[var(--violet-600)]/10 font-mono text-xs text-[var(--violet-400)] hover:border-[var(--violet-500)] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
                {shortAddr(address)}
              </button>
              {showMenu && (
                <div className="absolute right-0 top-11 w-52 card p-1.5 shadow-xl z-50 bg-[var(--bg-card)]">
                  <Link
                    href={`/agents/${address}`}
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4" /> Agent Profile
                  </Link>
                  <Link
                    href="/create-agent"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Wallet className="w-4 h-4" /> Register Agent
                  </Link>
                  <div className="border-t border-[var(--border-subtle)] my-1" />
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:bg-white/5 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" /> Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="btn-secondary !py-2 !px-4 !text-xs"
            >
              {connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>

        {/* Mobile: hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden ml-auto w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-white"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border-card)] bg-[var(--bg-primary)] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-[var(--border-subtle)] pt-2 mt-2">
            {address ? (
              <>
                <p className="px-3 py-1 font-mono text-xs text-[var(--violet-400)]">
                  ● {shortAddr(address)}
                </p>
                <Link
                  href={`/agents/${address}`}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] hover:text-white"
                >
                  Agent Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleDisconnect();
                  }}
                  className="block w-full text-left px-3 py-2 font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent-red)]"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleConnect();
                }}
                className="block w-full text-left px-3 py-2 font-mono text-xs uppercase tracking-wider text-white"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

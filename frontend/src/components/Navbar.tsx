"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { User, LogOut, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/agents", label: "Directory" },
  { href: "/#quickstart", label: "Quick Start" },
  { href: "/docs", label: "Docs" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { ready, authenticated, login, logout } = usePrivy();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">
      <div
        className={`navbar-glass rounded-full px-4 md:px-6 py-2.5 flex items-center gap-3 md:gap-6 transition-all ${
          scrolled ? "shadow-lg shadow-black/20" : ""
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm">
            ◎
          </div>
          <span className="hidden sm:inline">ORBIT</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 flex-1">
          <div className="h-4 w-px bg-white/10" />
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop social + auth */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <a href="https://github.com/cryptoeights/orbit-protocol" target="_blank" rel="noopener" className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
          </a>

          {ready && authenticated ? (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <User className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-12 w-48 card p-2 shadow-xl">
                  <Link href="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button onClick={() => { setShowMenu(false); logout(); }} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full">
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={login} className="text-sm font-medium px-4 py-1.5 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all">
              Log In
            </button>
          )}
        </div>

        {/* Mobile: hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden ml-auto w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden mt-2 navbar-glass rounded-2xl p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/5 pt-2 mt-2">
            {ready && authenticated ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                  Profile
                </Link>
                <button onClick={() => { setMobileOpen(false); logout(); }} className="block w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                  Log Out
                </button>
              </>
            ) : (
              <button onClick={() => { setMobileOpen(false); login(); }} className="block w-full text-left px-3 py-2 text-sm text-white font-medium">
                Log In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

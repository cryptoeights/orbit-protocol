import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ORBIT Protocol — Identity Infrastructure for AI Agents",
  description:
    "Verifiable on-chain identity and reputation for AI agents on Stellar. Cross-chain communication powered by Soroban smart contracts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        {/* Animated background (Jatevo-style aurora + grid + orbs) */}
        <div className="bg-fx" aria-hidden="true">
          <div className="bg-fx-grid" />
          <div className="bg-fx-aurora" />
          <div className="bg-fx-orb bg-fx-orb-1" />
          <div className="bg-fx-orb bg-fx-orb-2" />
          <div className="bg-fx-vignette" />
          <div className="bg-fx-scan" />
        </div>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

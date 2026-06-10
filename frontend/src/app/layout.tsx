import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Light-streak flares — deterministic config (no hydration mismatch).
// color drives both the gradient head and the glow; alpha sets brightness.
const STREAKS: {
  top: number;
  w: number;
  h: number;
  dur: number;
  delay: number;
  color: string;
}[] = [
  { top: 4, w: 240, h: 1, dur: 5.5, delay: 0, color: "rgba(255,255,255,0.55)" },
  { top: 8, w: 150, h: 1, dur: 7, delay: 2.4, color: "rgba(255,255,255,0.4)" },
  { top: 12, w: 330, h: 2, dur: 5, delay: 1.1, color: "rgba(255,255,255,0.3)" },
  { top: 16, w: 190, h: 1, dur: 6.5, delay: 3.6, color: "rgba(255,255,255,0.5)" },
  { top: 20, w: 120, h: 1, dur: 5.5, delay: 0.7, color: "rgba(255,255,255,0.5)" },
  { top: 24, w: 280, h: 1, dur: 8, delay: 4.3, color: "rgba(255,255,255,0.32)" },
  { top: 28, w: 170, h: 1, dur: 6, delay: 1.9, color: "rgba(255,255,255,0.28)" },
  { top: 32, w: 240, h: 2, dur: 6.8, delay: 5.2, color: "rgba(255,255,255,0.45)" },
  { top: 36, w: 140, h: 1, dur: 7.5, delay: 2.8, color: "rgba(255,255,255,0.38)" },
  { top: 40, w: 300, h: 1, dur: 5.2, delay: 3.9, color: "rgba(255,255,255,0.3)" },
  { top: 44, w: 200, h: 1, dur: 6.4, delay: 1.4, color: "rgba(255,255,255,0.48)" },
  { top: 48, w: 120, h: 1, dur: 8.5, delay: 6.1, color: "rgba(255,255,255,0.36)" },
  { top: 52, w: 220, h: 1, dur: 5.8, delay: 5.7, color: "rgba(255,255,255,0.32)" },
  { top: 56, w: 160, h: 1, dur: 7.2, delay: 0.9, color: "rgba(255,255,255,0.4)" },
  { top: 60, w: 280, h: 2, dur: 6, delay: 4.9, color: "rgba(255,255,255,0.3)" },
  { top: 64, w: 140, h: 1, dur: 7.8, delay: 2.1, color: "rgba(255,255,255,0.42)" },
  { top: 68, w: 210, h: 1, dur: 5.4, delay: 6.8, color: "rgba(255,255,255,0.5)" },
  { top: 72, w: 320, h: 1, dur: 6.6, delay: 3.2, color: "rgba(255,255,255,0.28)" },
  { top: 76, w: 150, h: 1, dur: 8.2, delay: 1.6, color: "rgba(255,255,255,0.4)" },
  { top: 80, w: 250, h: 1, dur: 5.6, delay: 5.0, color: "rgba(255,255,255,0.36)" },
  { top: 84, w: 130, h: 1, dur: 7, delay: 2.6, color: "rgba(255,255,255,0.34)" },
  { top: 88, w: 290, h: 1, dur: 6.2, delay: 4.1, color: "rgba(255,255,255,0.3)" },
  { top: 92, w: 180, h: 1, dur: 7.6, delay: 0.4, color: "rgba(255,255,255,0.36)" },
  { top: 6, w: 180, h: 1, dur: 6.9, delay: 7.3, color: "rgba(255,255,255,0.34)" },
  { top: 18, w: 140, h: 1, dur: 5.3, delay: 8.0, color: "rgba(255,255,255,0.42)" },
  { top: 30, w: 260, h: 1, dur: 6.1, delay: 7.6, color: "rgba(255,255,255,0.4)" },
  { top: 42, w: 110, h: 1, dur: 8.8, delay: 8.4, color: "rgba(255,255,255,0.38)" },
  { top: 54, w: 230, h: 1, dur: 5.9, delay: 6.5, color: "rgba(255,255,255,0.28)" },
  { top: 66, w: 160, h: 1, dur: 7.3, delay: 9.0, color: "rgba(255,255,255,0.36)" },
  { top: 78, w: 200, h: 1, dur: 6.7, delay: 7.9, color: "rgba(255,255,255,0.4)" },
  { top: 86, w: 150, h: 1, dur: 8.0, delay: 8.7, color: "rgba(255,255,255,0.34)" },
  { top: 38, w: 300, h: 2, dur: 5.1, delay: 3.0, color: "rgba(255,255,255,0.32)" },
];

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
      className={`dark ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        {/* Animated background — full black + white light-streak flares */}
        <div className="bg-fx" aria-hidden="true">
          <div className="bg-fx-grid" />
          <div className="bg-fx-streaks">
            {STREAKS.map((s, i) => (
              <span
                key={i}
                className="streak"
                style={{
                  top: `${s.top}%`,
                  width: `${s.w}px`,
                  height: `${s.h}px`,
                  color: s.color,
                  animationDuration: `${s.dur}s`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
          </div>
          <div className="bg-fx-vignette" />
          <div className="bg-fx-scan" />
        </div>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

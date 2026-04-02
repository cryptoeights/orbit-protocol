import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://auth.privy.io https://*.privy.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https:",
              "connect-src 'self' https://auth.privy.io https://*.privy.io https://soroban-testnet.stellar.org wss://auth.privy.io https://api.orbitprotocol.xyz http://localhost:3001",
              "frame-src https://auth.privy.io https://*.privy.io",
              "frame-ancestors 'self' https://auth.privy.io",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

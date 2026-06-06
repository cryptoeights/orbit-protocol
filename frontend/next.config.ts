import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone/server.js) for slim
  // Docker images — no node_modules needed at runtime. See Dockerfile.
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.privy.io https://*.vercel.app",
              "style-src 'self' 'unsafe-inline'",
              "img-src * data: blob:",
              "font-src 'self' data: https:",
              "connect-src *",
              "frame-src https://*.privy.io https://*.vercel.app",
              "frame-ancestors 'self' https://*.privy.io",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

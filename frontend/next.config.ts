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

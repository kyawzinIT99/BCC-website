import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/bccwa-logo.jpg", destination: "/_next/static/brand/bccwa-logo.jpg" },
      { source: "/favicon.png", destination: "/_next/static/brand/favicon.png" },
      { source: "/api/brand/logo", destination: "/_next/static/brand/bccwa-logo.jpg" },
      { source: "/api/brand/favicon", destination: "/_next/static/brand/favicon.png" },
    ];
  },
};

export default nextConfig;

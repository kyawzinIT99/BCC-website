import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/bccwa-logo.jpg", destination: "/api/brand/logo" },
      { source: "/favicon.png", destination: "/api/brand/favicon" },
    ];
  },
};

export default nextConfig;

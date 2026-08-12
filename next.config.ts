import type { NextConfig } from "next";

const brandRewrites = [
  "bccwa-logo.jpg",
  "logo.jpg",
  "favicon.png",
  "icon.png",
  "community-hero-group.jpg",
  "story-prayer.png",
  "story-cultural.png",
  "story-learning.png",
  "our-work-community.jpg",
  "about-community-australia.webp",
  "community-story-faith.jpg",
  "community-story-culture.jpg",
  "community-story-care.jpg",
  "it-solutions-zone-logo.png",
  "og-australian-spirit.png",
].map((name) => ({
  source: `/${name}`,
  destination: `/_next/static/brand/${name}`,
}));

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      ...brandRewrites,
      { source: "/api/brand/logo", destination: "/_next/static/brand/bccwa-logo.jpg" },
      { source: "/api/brand/favicon", destination: "/_next/static/brand/favicon.png" },
    ];
  },
};

export default nextConfig;

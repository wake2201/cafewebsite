import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // AGENTS.md is a project-owned policy document; keep `next dev` from injecting its managed block.
  agentRules: false,
  poweredByHeader: false,
  // One freshness profile for CMS data and date-dependent output (menus, "Heute", hours):
  // after 2 minutes the next request triggers a background refresh. See ARCHITECTURE.md.
  cacheLife: {
    cms: { stale: 60, revalidate: 120, expire: 3600 },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

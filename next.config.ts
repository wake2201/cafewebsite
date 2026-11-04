import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // AGENTS.md is a project-owned policy document; keep `next dev` from injecting its managed block.
  agentRules: false,
  poweredByHeader: false,
  // One freshness profile for CMS data and date-dependent output (menus, "Heute", hours).
  // - revalidate 120: the server refreshes 2 minutes after the last refresh (the next request
  //   triggers it in the background), so published changes and the Berlin date roll-over reach new
  //   page loads within about 2 to 3 minutes.
  // - stale 300: how long a browser may reuse a prefetched result during client navigation. Next 16
  //   only puts cached data into the App Shell when stale is at least 5 minutes; below that, every
  //   page that awaits CMS data outside <Suspense> blocks client navigation (dev "uncached data"
  //   validation error). 300 keeps the pages instant without Suspense fallbacks, so they still
  //   render completely without JavaScript.
  // - expire 3600: after an hour without traffic the next request renders fresh, never older data.
  // See ARCHITECTURE.md "Caching and freshness".
  cacheLife: {
    cms: { stale: 300, revalidate: 120, expire: 3600 },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

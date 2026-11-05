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
  // Baseline security headers for every route, including the Studio at /admin. No page is meant to be
  // framed (no embeds, no Sanity Presentation tool), so framing is refused (clickjacking guard for the
  // signed-in Studio). A full Content-Security-Policy is deliberately not set here: Next's inline
  // scripts and the Studio's styled-components need nonces or 'unsafe-inline', which is a separate,
  // tested change. HSTS is left to the host (Vercel sets it on its domains).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

// PostHog EU Cloud: the project's region.
const POSTHOG_INGEST = "https://eu.i.posthog.com";
const POSTHOG_ASSETS = "https://eu-assets.i.posthog.com";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The size engine ships TypeScript source (packages/sizes).
  transpilePackages: ["@framesizes/sizes"],
  // The e2e analytics server builds with a dummy token into its own folder (playwright.config.ts).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // posthog-js calls paths ending in a slash; the redirect below restores the 308 everywhere else.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        // {@link openspec/specs/seo-base/spec.md#requirement-a-trailing-slash-redirects-to-the-clean-path-in-one-hop}
        // `[^/]` first: "//evil.com/" must never become a protocol-relative Location.
        source: "/:path((?!ingest(?:/|$))[^/].*)/",
        destination: "/:path",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    // {@link openspec/specs/site-shell/spec.md#requirement-visits-are-measured-without-cookies}
    return [
      { source: "/ingest/static/:path*", destination: `${POSTHOG_ASSETS}/static/:path*` },
      { source: "/ingest/array/:path*", destination: `${POSTHOG_ASSETS}/array/:path*` },
      { source: "/ingest/:path*", destination: `${POSTHOG_INGEST}/:path*` },
    ];
  },
};

export default nextConfig;

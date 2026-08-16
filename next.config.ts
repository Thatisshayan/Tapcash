import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { validateEnv } from "@/lib/env";

validateEnv();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lootably.com" },
      { protocol: "https", hostname: "rapidoreach.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
    ppr: false,
  },
  // Removed a stale `modularizeImports` entry for lucide-react here: it
  // hardcoded a per-icon import path (lucide-react/dist/esm/icons/...)
  // that no longer matches the installed lucide-react's package layout,
  // and duplicated/conflicted with `optimizePackageImports` above (the
  // modern, Turbopack-native tree-shaking mechanism for the same
  // package). This was causing every file that imports any lucide-react
  // icon to fail to resolve during `next build`.

  staticPageGenerationTimeout: 120,
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.tapcash.online",
          },
        ],
        destination: "https://tapcash.online/:path*",
        permanent: true,
      },
    ];
  },
};

const sentryConfig = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

export default process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;
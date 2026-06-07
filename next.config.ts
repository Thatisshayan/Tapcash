import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance: Enable React strict mode for better error detection
  reactStrictMode: true,

  // Performance: Compress responses
  compress: true,

  // Performance: Optimize images
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lootably.com' },
      { protocol: 'https', hostname: 'rapidoreach.com' }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Performance: Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Performance: Configure headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  turbopack: {
    root: __dirname,
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.tapcash.online',
          },
        ],
        destination: 'https://tapcash.online/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

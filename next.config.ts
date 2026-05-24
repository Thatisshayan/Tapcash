import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lootably.com' },
      { protocol: 'https', hostname: 'rapidoreach.com' }
    ]
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

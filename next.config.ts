import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lootably.com' },
      { protocol: 'https', hostname: 'rapidoreach.com' }
    ]
  }
};

export default nextConfig;

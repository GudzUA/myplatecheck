import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/myplatecheck-8b211.firebasestorage.app/**',
      },
    ],
  },
};

export default nextConfig;

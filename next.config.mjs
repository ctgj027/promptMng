import { NextConfig } from 'next';

const nextConfig = {
  experimental: {
    serverActions: true,
    typedRoutes: true
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' }
    ]
  }
};

export default nextConfig satisfies NextConfig;

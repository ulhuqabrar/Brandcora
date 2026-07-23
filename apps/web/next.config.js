const API_URL = process.env.API_BASE_URL || 'http://localhost:10000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@saas/shared', '@saas/ui'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Use custom build directory
  distDir: 'build',
  
  // Skip TypeScript type checking during production build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during production build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable static optimization to fix React 19 compatibility issues
  experimental: {
    disableOptimizedLoading: true,
  },
  
  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;

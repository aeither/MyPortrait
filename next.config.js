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
  
  // Configuration for Netlify deployment
  experimental: {
    disableOptimizedLoading: true,
    // Enable when deployed on Netlify
    isrMemoryCacheSize: 0,
    serverComponentsExternalPackages: ['pg']
  },
  
  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'production', // Unoptimize images for Netlify deployment
  },
};

module.exports = nextConfig;

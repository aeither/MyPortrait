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
  
  // External packages that should be processed by Node.js
  serverExternalPackages: ['pg'],
  
  // Configuration for production deployment
  experimental: {
    // Disable optimized loading to prevent hydration issues
    disableOptimizedLoading: true,
    // Improve client-side rendering reliability
    optimizeCss: false
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

/**
 * Next.js Configuration with Performance Optimizations
 * Requirement 6.3: Fast performance through serverless architecture optimization
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* React Compiler for better performance */
  // reactCompiler: true, // Temporarily disabled due to versioned import issues
  
  /* Performance optimizations */
  compress: true,
  poweredByHeader: false,
  
  /* Image optimization */
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  /* Experimental features for better performance */
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-select'],
  },
  
  /* Headers for better caching and security */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ]
  },
};

export default nextConfig;

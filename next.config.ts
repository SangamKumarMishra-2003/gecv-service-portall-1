import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Turbopack is enabled by default in Next.js 15+
  },

  // Optimize images
  images: {
    // Add image domains if needed
    domains: [],
    // Enable image optimization
    unoptimized: false,
  },

  // Enable build caching
  generateBuildId: async () => {
    return 'build-cache-' + Date.now()
  },

  // Enable compression
  compress: true,

  // Note: Removed webpack config to allow Turbopack to work optimally
  // Turbopack handles optimizations automatically and is faster than webpack
};

export default nextConfig;

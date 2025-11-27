import type { NextConfig } from "next";

// Build timestamp: 2025-01-27 13:45 UTC - Force rebuild for Vercel dynamic routes
const nextConfig: NextConfig = {
  // Use system TLS certificates for Turbopack (fixes Google Fonts fetch issues)
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;

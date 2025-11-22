import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use system TLS certificates for Turbopack (fixes Google Fonts fetch issues)
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;

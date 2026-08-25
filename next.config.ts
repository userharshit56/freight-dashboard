import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allows production builds to successfully complete even if there are type warnings
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

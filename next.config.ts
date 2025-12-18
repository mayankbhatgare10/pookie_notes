import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'z3759y9was.ufs.sh',
      },
    ],
  },
};

export default nextConfig;


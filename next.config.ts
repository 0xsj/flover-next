import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return ["activity", "chaos", "failures"].map(page => ({
      source: `/app/${page}`,
      destination: `/cookbook/${page}`,
      permanent: false,
    }));
  },
};

export default nextConfig;

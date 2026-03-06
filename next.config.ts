import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-5bebe1386b8f4ea6a055f37e193c6567.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

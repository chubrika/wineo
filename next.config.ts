import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  rewrites: async () => [
    { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
  ],
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

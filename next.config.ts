import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
  },
  // Empty turbopack config to silence the webpack warning
  turbopack: {},
};

// PWA configuration will be added via separate plugin after Next.js fixes compatibility
// For now, the manifest.json and service worker will be manually configured
export default nextConfig;

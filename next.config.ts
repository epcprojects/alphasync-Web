import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "backend.alphabiomedlabs.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/login",
        permanent: false,
      },
      {
        source: "/web-app-manifest-192x192.png",
        destination: "/images/favicon/web-app-manifest-192x192.png",
        permanent: true,
      },
      {
        source: "/web-app-manifest-512x512.png",
        destination: "/images/favicon/web-app-manifest-512x512.png",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

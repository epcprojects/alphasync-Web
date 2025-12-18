import type { NextConfig } from "next";

const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT
  ? new URL(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT).hostname
  : "localhost";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: graphqlEndpoint,
      },
      {
        protocol: "http",
        hostname: graphqlEndpoint,
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
};

export default nextConfig;

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
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "alpha-sync-staging-20d19e9cadc9.herokuapp.com",
      },
    ],
  },
};

export default nextConfig;

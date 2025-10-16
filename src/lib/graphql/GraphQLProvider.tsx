"use client";

import apolloClient from "@/lib/graphql/apollo-client";
import { ApolloProvider } from "@apollo/client/react";

interface GraphQLProviderProps {
  children: React.ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}

export default GraphQLProvider;

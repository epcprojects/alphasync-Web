import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// HTTP link to GraphQL endpoint
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    // Configure cache policies if needed
    typePolicies: {
      // Add specific type policies here
    },
  }),
});

export default apolloClient;

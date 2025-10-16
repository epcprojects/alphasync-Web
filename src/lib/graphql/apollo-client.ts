import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const uploadLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  fetch: fetch,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("auth_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    const messages = graphQLErrors.map(({ message }) => message);
    const isAccessRevoked = messages.some(
      (message) =>
        message.includes(
          "Your account access is revoked. Please contact admin"
        ) ||
        message.includes(
          "Account access has been revoked. Please contact admin to get it enabled!"
        )
    );
    if (isAccessRevoked) {
      // Show toast for all access revoked messages, do not redirect
      messages.forEach((message) => {
        if (
          message.includes(
            "Your account access is revoked. Please contact admin"
          ) ||
          message.includes(
            "Account access has been revoked. Please contact admin to get it enabled!"
          )
        ) {
          // ToastAlert(message, false);
        }
      });
      return;
    }
    // If not access revoked, handle session expired or unauthorized
    messages.forEach((message) => {
      if (
        message.includes(
          "Your session has expired or you are not authenticated. Please log in to continue."
        ) ||
        message.includes("Unauthorized error")
      ) {
        console.log(message, false);
        localStorage.clear();
        window.location.replace("/");
      }
    });
  }
  if (networkError) {
    console.log(networkError.message, false);
  }
});

const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, uploadLink]),
  cache: new InMemoryCache({
    addTypename: false,
  }),
});

export default apolloClient;

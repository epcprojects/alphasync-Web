import { ApolloClient, ApolloLink, InMemoryCache, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { getMainDefinition } from "@apollo/client/utilities";
import Cookies from "js-cookie";
import { ActionCableLink } from "./actioncable-link";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const uploadLink = createUploadLink({
  uri: `${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT}/graphql`,
  fetch: fetch,
});

const authLink = setContext((_, { headers }) => {
  const token = Cookies.get("auth_token");
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
        Cookies.remove("auth_token");
        Cookies.remove("user_data");
        window.location.replace("/");
      }
    });
  }
  if (networkError) {
    console.log(networkError.message, false);
  }
});

// Create ActionCable link for subscriptions
const actionCableLink = new ActionCableLink();

// Split link to handle subscriptions via ActionCable and other operations via HTTP
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  actionCableLink,
  ApolloLink.from([errorLink, authLink, uploadLink])
);

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    addTypename: false,
  }),
});

export default apolloClient;

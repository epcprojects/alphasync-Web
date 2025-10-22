import { ApolloLink, Observable } from "@apollo/client";
import { createActionCableConsumer, GraphQLActionCableSubscription } from "../actioncable";

export class ActionCableLink extends ApolloLink {
  private consumer: any;

  constructor() {
    super();
    this.consumer = createActionCableConsumer();
  }

  request(operation: any, forward: any) {
    // Only handle subscription operations
    if (operation.query.definitions.some((def: any) => def.operation === "subscription")) {
      return new Observable((observer) => {
        const subscription = new GraphQLActionCableSubscription(this.consumer);
        
        const graphqlSubscription = subscription.subscribe(
          operation.query.loc?.source?.body || operation.query,
          operation.variables,
          "GraphqlChannel", // Channel name
          {
            next: (data: any) => {
              observer.next({
                data,
                loading: false,
                networkStatus: 7, // NetworkStatus.ready
              });
            },
            error: (error: any) => {
              observer.error(error);
            },
            complete: () => {
              observer.complete();
            },
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      });
    }

    // For non-subscription operations, pass them to the next link
    return forward(operation);
  }
}

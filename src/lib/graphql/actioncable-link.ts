import { ApolloLink, Observable, Operation, NextLink, FetchResult } from "@apollo/client";
import { createActionCableConsumer, GraphQLActionCableSubscription } from "../actioncable";
import { DefinitionNode } from "graphql";

export class ActionCableLink extends ApolloLink {
  private consumer: ReturnType<typeof createActionCableConsumer>;

  constructor() {
    super();
    this.consumer = createActionCableConsumer();
  }

  request(operation: Operation, forward: NextLink): Observable<FetchResult> | null {
    // Only handle subscription operations
    if (operation.query.definitions.some((def: DefinitionNode) => 'operation' in def && def.operation === "subscription")) {
      return new Observable<FetchResult>((observer) => {
        const subscription = new GraphQLActionCableSubscription(this.consumer);
        
        subscription.subscribe(
          operation.query.loc?.source?.body || operation.query.toString(),
          operation.variables,
          "GraphqlChannel", // Channel name
          {
            next: (data: unknown) => {
              observer.next({
                data: data as Record<string, unknown>,
              });
            },
            error: (error: unknown) => {
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

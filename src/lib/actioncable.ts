import { createConsumer } from "@rails/actioncable";
import Cookies from "js-cookie";
import { validateActionCableConfig } from "./validate-config";

// Type definitions for ActionCable
interface ActionCableConsumer {
  subscriptions: {
    create: (
      channel: string | { channel: string },
      callbacks: ActionCableCallbacks
    ) => ActionCableSubscriptionInstance;
  };
}

interface ActionCableSubscriptionInstance {
  unsubscribe: () => void;
  perform: (action: string, data?: unknown) => void;
}

interface ActionCableCallbacks {
  received?: (data: unknown) => void;
  connected?: () => void;
  disconnected?: () => void;
}

interface GraphQLSubscriptionData {
  result?: unknown;
  error?: unknown;
}

// ActionCable consumer configuration
export const createActionCableConsumer = () => {
  // Validate configuration
  validateActionCableConfig();

  const userData = Cookies.get("user_data");
  const user = userData ? JSON.parse(userData) : null;

  const baseEndpoint = process.env.NEXT_PUBLIC_CABLE_ENDPOINT;

  if (!baseEndpoint) {
    throw new Error(
      "NEXT_PUBLIC_CABLE_ENDPOINT is not defined in environment variables"
    );
  }

  // Construct endpoint with userId parameter
  const endpoint = user?.id
    ? `${baseEndpoint}?userId=${user.id}`
    : baseEndpoint;

  return createConsumer(endpoint);
};

// ActionCable subscription helper
export class ActionCableSubscription {
  private consumer: ActionCableConsumer;
  private subscription: ActionCableSubscriptionInstance | null = null;

  constructor(consumer: ActionCableConsumer) {
    this.consumer = consumer;
  }

  subscribe(
    channel: string,
    callbacks: {
      received?: (data: unknown) => void;
      connected?: () => void;
      disconnected?: () => void;
    }
  ) {
    this.subscription = this.consumer.subscriptions.create(channel, {
      received: callbacks.received,
      connected: callbacks.connected,
      disconnected: callbacks.disconnected,
    });
    return this.subscription;
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  perform(action: string, data?: unknown) {
    if (this.subscription) {
      this.subscription.perform(action, data);
    }
  }
}

// GraphQL subscription over ActionCable
export class GraphQLActionCableSubscription {
  private consumer: ActionCableConsumer;
  private subscription: ActionCableSubscriptionInstance | null = null;

  constructor(consumer: ActionCableConsumer) {
    this.consumer = consumer;
  }

  subscribe(
    query: string,
    variables: Record<string, unknown> = {},
    channelName: string = "GraphqlChannel",
    callbacks: {
      next?: (data: unknown) => void;
      error?: (error: unknown) => void;
      complete?: () => void;
    }
  ) {
    this.subscription = this.consumer.subscriptions.create(
      { channel: channelName },
      {
        received: (data: unknown) => {
          const graphqlData = data as GraphQLSubscriptionData;
          if (graphqlData.result && callbacks.next) {
            callbacks.next(graphqlData.result);
          }
          if (graphqlData.error && callbacks.error) {
            callbacks.error(graphqlData.error);
          }
        },
        connected: () => {
          // Send the GraphQL subscription query
          if (this.subscription) {
            this.subscription.perform("execute", {
              query,
              variables,
            });
          }
        },
        disconnected: () => {
          if (callbacks.complete) {
            callbacks.complete();
          }
        },
      }
    );
    return this.subscription;
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}

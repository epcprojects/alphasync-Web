"use client";

import { useEffect, useRef, useState } from "react";
import { createActionCableConsumer, ActionCableSubscription, GraphQLActionCableSubscription } from "@/lib/actioncable";

interface UseActionCableOptions {
  channel: string;
  onReceived?: (data: unknown) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export const useActionCable = (options: UseActionCableOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef<ActionCableSubscription | null>(null);

  useEffect(() => {
    try {
      const consumer = createActionCableConsumer();
      const subscription = new ActionCableSubscription(consumer);

      subscription.subscribe(options.channel, {
        received: options.onReceived,
        connected: () => {
          setIsConnected(true);
          options.onConnected?.();
        },
        disconnected: () => {
          setIsConnected(false);
          options.onDisconnected?.();
        },
      });

      subscriptionRef.current = subscription;

      return () => {
        subscription.unsubscribe();
        subscriptionRef.current = null;
      };
    } catch (error) {
      console.error("Failed to create ActionCable subscription:", error);
    }
  }, [options.channel, options.onReceived, options.onConnected, options.onDisconnected]); // eslint-disable-line react-hooks/exhaustive-deps

  const perform = (action: string, data?: object) => {
    subscriptionRef.current?.perform(action, data);
  };

  return {
    isConnected,
    perform,
  };
};

// Hook specifically for GraphQL subscriptions
interface UseGraphQLSubscriptionOptions {
  query: string;
  variables?: Record<string, unknown>;
  onNext?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  onComplete?: () => void;
}

export const useGraphQLSubscription = (options: UseGraphQLSubscriptionOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<unknown>(null);
  const subscriptionRef = useRef<GraphQLActionCableSubscription | null>(null);

  useEffect(() => {
    try {
      const consumer = createActionCableConsumer();
      const subscription = new GraphQLActionCableSubscription(consumer);

      subscription.subscribe(
        options.query,
        options.variables,
        "GraphqlChannel",
        {
          next: (result: unknown) => {
            setData(result);
            options.onNext?.(result);
          },
          error: (err: unknown) => {
            setError(err);
            options.onError?.(err);
          },
          complete: () => {
            setIsConnected(false);
            options.onComplete?.();
          },
        }
      );

      subscriptionRef.current = subscription;
      setIsConnected(true);

      return () => {
        subscription.unsubscribe();
        subscriptionRef.current = null;
      };
    } catch (err) {
      console.error("Failed to create GraphQL subscription:", err);
      setError(err);
    }
  }, [options.query, options.variables, options.onNext, options.onError, options.onComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isConnected,
    data,
    error,
  };
};

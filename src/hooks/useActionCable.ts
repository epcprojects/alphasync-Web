"use client";

import { useEffect, useRef, useState } from "react";
import { createActionCableConsumer, ActionCableSubscription } from "@/lib/actioncable";

interface UseActionCableOptions {
  channel: string;
  onReceived?: (data: any) => void;
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
  }, [options.channel]);

  const perform = (action: string, data?: any) => {
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
  variables?: any;
  onNext?: (data: any) => void;
  onError?: (error: any) => void;
  onComplete?: () => void;
}

export const useGraphQLSubscription = (options: UseGraphQLSubscriptionOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    try {
      const consumer = createActionCableConsumer();
      const subscription = new (require("@/lib/actioncable").GraphQLActionCableSubscription)(consumer);

      subscription.subscribe(options.query, options.variables, {
        next: (result: any) => {
          setData(result);
          options.onNext?.(result);
        },
        error: (err: any) => {
          setError(err);
          options.onError?.(err);
        },
        complete: () => {
          setIsConnected(false);
          options.onComplete?.();
        },
      });

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
  }, [options.query, JSON.stringify(options.variables)]);

  return {
    isConnected,
    data,
    error,
  };
};

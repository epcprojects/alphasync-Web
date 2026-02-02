"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useAppSelector, useAppDispatch } from "./hooks";
import { setUser } from "./slices/authSlice";
import { clearCart, setCartFromServer } from "./slices/cartSlice";
import { useQuery } from "@apollo/client";
import { FETCH_USER } from "@/lib/graphql/queries";
import { Loader } from "@/components";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";

function AuthInitializer() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const cartLoaded = useAppSelector((state) => state.cart.loaded);
  const [isClient, setIsClient] = useState(false);
  const previousTokenRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check token directly from cookies to ensure it's always current
  // This prevents queries from running after logout when cookies are cleared
  const currentToken = isClient ? Cookies.get("auth_token") : null;
  const userType = user?.userType?.toLowerCase();
  const isDoctor = userType === "doctor";
  // Cart is managed only for doctors:
  // - doctors: fetch once to hydrate cart (until cartLoaded)
  // - non-doctors: skip if user already exists
  const shouldSkip =
    !isClient ||
    !currentToken ||
    (!!user && (!isDoctor || cartLoaded));

  const { loading, data, error, stopPolling } = useQuery(FETCH_USER, {
    skip: shouldSkip,
    fetchPolicy: "network-only",
    errorPolicy: "ignore",
    notifyOnNetworkStatusChange: false,
  });

  // Watch for token removal (logout) and prevent query from processing results
  useEffect(() => {
    const previousToken = previousTokenRef.current;
    previousTokenRef.current = currentToken || undefined;

    // If token was removed (logout happened), stop polling if active
    if (previousToken && !currentToken && stopPolling) {
      stopPolling();
    }
  }, [currentToken, stopPolling]);

  useEffect(() => {
    if (data?.fetchUser?.user && currentToken) {
      Cookies.set("user_data", JSON.stringify(data.fetchUser.user), {
        expires: 7,
      });
      const fetchedUser = data.fetchUser.user;
      dispatch(setUser(fetchedUser));
      if (fetchedUser?.userType?.toLowerCase() === "doctor") {
        dispatch(setCartFromServer(fetchedUser.cart ?? null));
      } else {
        dispatch(clearCart());
      }
    }
  }, [data, dispatch, currentToken]);

  useEffect(() => {
    // Only log errors if we have a token (not during logout)
    if (error && currentToken) {
      console.log("Fetch user error:", error.message);
    }
  }, [error, currentToken]);

  // Show loader when fetching user data (only if we have a token)
  if (loading && currentToken) {
    return <Loader />;
  }

  return null;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      {children}
    </Provider>
  );
}

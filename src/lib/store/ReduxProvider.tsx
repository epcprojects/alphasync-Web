"use client";

import { Provider } from "react-redux";
import { store } from "./index";
import { useAppSelector, useAppDispatch } from "./hooks";
import { setUser } from "./slices/authSlice";
import { useQuery } from "@apollo/client";
import { FETCH_USER } from "@/lib/graphql/queries";
import { Loader } from "@/components";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

function AuthInitializer() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null | undefined>(null);

  useEffect(() => {
    setIsClient(true);
    setToken(Cookies.get("auth_token"));
  }, []);

  const shouldSkip = !isClient || !token || !!user;

  const { loading, data, error } = useQuery(FETCH_USER, {
    skip: shouldSkip,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.fetchUser?.user) {
      Cookies.set("user_data", JSON.stringify(data.fetchUser.user), {
        expires: 7,
      });
      dispatch(setUser(data.fetchUser.user));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (error) {
      console.log(error.message);
    }
  }, [error]);

  // Show loader when fetching user data
  if (loading) {
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

"use client";

import { Provider } from 'react-redux';
import { store } from './index';
import { useAppSelector, useAppDispatch } from './hooks';
import { setUser, clearUser } from './slices/authSlice';
import { useQuery } from '@apollo/client';
import { FETCH_USER } from '@/lib/graphql/queries';
import { Loader } from '@/components';
import { useEffect, useState } from 'react';

function AuthInitializer() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem('auth_token'));
  }, []);

  const shouldSkip = !isClient || !token || !!user;

  const { loading } = useQuery(FETCH_USER, {
    skip: shouldSkip,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.fetchUser?.user) {
        console.log(data);
        dispatch(setUser(data.fetchUser.user));
      }
    },
    onError: (error) => {
      console.error('Error fetching user:', error);
      localStorage.removeItem('auth_token');
      dispatch(clearUser());
    }
  });

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

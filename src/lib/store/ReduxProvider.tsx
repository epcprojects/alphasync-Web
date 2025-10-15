"use client";

import { Provider } from 'react-redux';
import { store } from './index';
import { useEffect } from 'react';
import { initializeAuth } from '@/lib/utils/authInit';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeAuth();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

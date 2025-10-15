import { store } from '@/lib/store';
import { setUser } from '@/lib/store/slices/authSlice';
import { storage } from './storage';

export const initializeAuth = () => {
  const user = storage.getUser();
  
  if (user) {
    store.dispatch(setUser(user));
  }
};

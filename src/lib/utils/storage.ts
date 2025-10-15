const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const storage = {
  // Token operations
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },
  
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  
  // User operations
  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  
  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },
  
  removeUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  },
  
  // Clear all auth data
  clearAuth: () => {
    storage.removeToken();
    storage.removeUser();
  }
};

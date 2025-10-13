/**
 * useAuth Hook
 * Authentication hook for user context
 */

import { create } from 'zustand';

interface User {
  user_id: number;
  username: string;
  email?: string;
  role: string;
  level?: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

export const useAuth = () => {
  const { user, token, setAuth, logout } = useAuthStore();

  return {
    user,
    token,
    setAuth,
    logout,
    isAuthenticated: !!token,
  };
};


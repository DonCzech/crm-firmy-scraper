import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resetClient } from '@/lib/graphql-client';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken, user) => {
        localStorage.setItem('accessToken', accessToken);
        set({ accessToken, refreshToken, user, isAuthenticated: true });
        resetClient();
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false });
        resetClient();
      },
    }),
    {
      name: 'bezrealitky-auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken, isAuthenticated: s.isAuthenticated }),
    },
  ),
);

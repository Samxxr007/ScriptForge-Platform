import { create } from 'zustand';
import { api } from '../lib/api.ts';
import { disconnectSocket } from '../lib/socket.ts';

interface User {
  id: string;
  name: string;
  email: string;
  roleTitle?: string | null;
  preferredType?: string | null;
  avatar?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, roleTitle?: string, preferredType?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateOnboarding: (data: { roleTitle?: string; preferredType?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('scriptforge_token'),
  isAuthenticated: !!localStorage.getItem('scriptforge_token'),
  isLoading: true,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem('scriptforge_token', res.token);
      set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password, roleTitle, preferredType) => {
    set({ isLoading: true });
    try {
      const res = await api.auth.register({ name, email, password, roleTitle, preferredType });
      localStorage.setItem('scriptforge_token', res.token);
      set({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('scriptforge_token');
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('scriptforge_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.auth.getMe();
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      localStorage.removeItem('scriptforge_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateOnboarding: async (data) => {
    try {
      const res = await api.auth.updateOnboarding(data);
      set({ user: res.user });
    } catch (err) {
      throw err;
    }
  },
}));

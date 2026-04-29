import { create } from 'zustand';
import api from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin';
  token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

/**
 * Global authentication state management using Zustand.
 * Simplified for a single-admin system where authenticated users have full access.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('ioms_token', data.token);
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post('/auth/signup', userData);
      localStorage.setItem('ioms_token', data.token);
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Signup failed', isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('ioms_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('ioms_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      set({ user: { ...data, token }, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('ioms_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null })
}));


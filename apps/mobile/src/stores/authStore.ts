/**
 * Authentication Store (Zustand)
 *
 * Global state management for authentication:
 * - Current user
 * - Current session
 * - Loading states
 * - Auth actions (login, register, logout)
 */

import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import {
  signIn,
  signUp,
  signOut,
  getSession,
  getCurrentUser,
  onAuthStateChange,
} from '../services/auth.service';

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  /**
   * Initialize auth state
   * - Check for existing session
   * - Set up auth state listener
   */
  initialize: async () => {
    try {
      set({ isLoading: true });

      // Get current session
      const session = await getSession();
      const user = session ? await getCurrentUser() : null;

      set({
        session,
        user,
        isInitialized: true,
        isLoading: false,
      });

      // Listen to auth changes
      onAuthStateChange((event, session) => {
        console.log('🔄 Auth state change:', event);

        if (event === 'SIGNED_IN' && session) {
          set({
            session,
            user: session.user,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          set({
            session: null,
            user: null,
            error: null,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          set({
            session,
            user: session.user,
          });
        }
      });
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      set({
        isInitialized: true,
        isLoading: false,
        error: String(error),
      });
    }
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const result = await signIn(email, password);

      if (result.success && result.user && result.session) {
        set({
          user: result.user,
          session: result.session,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: result.error || 'Login failed',
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      set({
        isLoading: false,
        error: String(error),
      });
      return false;
    }
  },

  /**
   * Register new user
   */
  register: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });

      const result = await signUp(email, password, name);

      if (result.success && result.user) {
        set({
          user: result.user,
          session: result.session || null,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: result.error || 'Registration failed',
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Register error:', error);
      set({
        isLoading: false,
        error: String(error),
      });
      return false;
    }
  },

  /**
   * Logout current user
   */
  logout: async () => {
    try {
      set({ isLoading: true });

      await signOut();

      set({
        user: null,
        session: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      set({
        isLoading: false,
        error: String(error),
      });
    }
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Authentication Store
 * Manages user authentication state with Zustand
 */

import { create } from 'zustand';
import type { User, AuthState, AuthProvider } from '../types/user';
import { authService, type AuthResult } from '../services/auth';

interface AuthStore extends AuthState {
  // Actions
  initialize: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signInWithApple: () => Promise<AuthResult>;
  signInAnonymously: () => Promise<AuthResult>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<{ success: boolean; error: string | null }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize auth state
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      const user = await authService.getCurrentUser();

      if (user) {
        set({
          user: {
            id: user.id,
            email: user.email ?? null,
            createdAt: user.created_at,
            lastSignIn: user.last_sign_in_at ?? null,
            provider: (user.app_metadata?.provider as AuthProvider) || 'email',
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      // Listen to auth state changes
      authService.onAuthStateChange((event, session) => {
        if (session?.user) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email ?? null,
              createdAt: session.user.created_at,
              lastSignIn: session.user.last_sign_in_at ?? null,
              provider: (session.user.app_metadata?.provider as AuthProvider) || 'email',
            },
            isAuthenticated: true,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false, error: 'Failed to initialize authentication' });
    }
  },

  // Sign up with email
  signUpWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    const result = await authService.signUpWithEmail(email, password);

    if (result.success && result.user) {
      set({
        user: {
          id: result.user.id,
          email: result.user.email ?? null,
          createdAt: result.user.created_at,
          lastSignIn: result.user.last_sign_in_at ?? null,
          provider: 'email',
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, error: result.error });
    }

    return result;
  },

  // Sign in with email
  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    const result = await authService.signInWithEmail(email, password);

    if (result.success && result.user) {
      set({
        user: {
          id: result.user.id,
          email: result.user.email ?? null,
          createdAt: result.user.created_at,
          lastSignIn: result.user.last_sign_in_at ?? null,
          provider: 'email',
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, error: result.error });
    }

    return result;
  },

  // Sign in with Apple
  signInWithApple: async () => {
    set({ isLoading: true, error: null });

    const result = await authService.signInWithApple();

    if (result.success && result.user) {
      set({
        user: {
          id: result.user.id,
          email: result.user.email ?? null,
          createdAt: result.user.created_at,
          lastSignIn: result.user.last_sign_in_at ?? null,
          provider: 'apple',
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } else if (result.error) {
      set({ isLoading: false, error: result.error });
    } else {
      // User cancelled - no error, just stop loading
      set({ isLoading: false });
    }

    return result;
  },

  // Sign in anonymously
  signInAnonymously: async () => {
    set({ isLoading: true, error: null });

    const result = await authService.signInAnonymously();

    if (result.success && result.user) {
      set({
        user: {
          id: result.user.id,
          email: null,
          createdAt: result.user.created_at,
          lastSignIn: result.user.last_sign_in_at ?? null,
          provider: 'anonymous',
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, error: result.error });
    }

    return result;
  },

  // Send password reset email
  sendPasswordResetEmail: async (email: string) => {
    set({ isLoading: true, error: null });

    const result = await authService.sendPasswordResetEmail(email);

    if (!result.success) {
      set({ error: result.error });
    }

    set({ isLoading: false });
    return result;
  },

  // Sign out
  signOut: async () => {
    set({ isLoading: true, error: null });

    const result = await authService.signOut();

    if (result.success) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } else {
      set({ isLoading: false, error: result.error });
    }

    return result;
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));

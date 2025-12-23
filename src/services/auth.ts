/**
 * Authentication Service
 * Handles user authentication using Supabase
 *
 * Supports:
 * - Email/Password authentication
 * - Apple Sign-In (iOS)
 * - Password reset
 * - Anonymous sessions
 */

import { createClient, SupabaseClient, AuthError, Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Supabase configuration
// NOTE: Replace these with your actual Supabase credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Secure storage adapter for Supabase auth
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('SecureStore getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.warn('SecureStore setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.warn('SecureStore removeItem error:', error);
    }
  },
};

// Auth result type
export interface AuthResult {
  success: boolean;
  user: User | null;
  error: string | null;
}

class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  /**
   * Get the Supabase client instance
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, user: null, error: error.message };
      }

      return { success: true, user: data.user, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      return { success: false, user: null, error: message };
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, user: null, error: error.message };
      }

      return { success: true, user: data.user, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      return { success: false, user: null, error: message };
    }
  }

  /**
   * Sign in with Apple (iOS only)
   */
  async signInWithApple(): Promise<AuthResult> {
    if (Platform.OS !== 'ios') {
      return {
        success: false,
        user: null,
        error: 'Apple Sign-In is only available on iOS',
      };
    }

    try {
      // Check if Apple Sign-In is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        return {
          success: false,
          user: null,
          error: 'Apple Sign-In is not available on this device',
        };
      }

      // Request Apple authentication
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Sign in with Supabase using the Apple ID token
      if (credential.identityToken) {
        const { data, error } = await this.supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) {
          return { success: false, user: null, error: error.message };
        }

        return { success: true, user: data.user, error: null };
      }

      return {
        success: false,
        user: null,
        error: 'Failed to get Apple identity token',
      };
    } catch (error) {
      if (error instanceof Error) {
        // User cancelled
        if (error.message.includes('cancelled') || error.message.includes('canceled')) {
          return { success: false, user: null, error: null };
        }
        return { success: false, user: null, error: error.message };
      }
      return { success: false, user: null, error: 'Apple Sign-In failed' };
    }
  }

  /**
   * Sign in anonymously
   */
  async signInAnonymously(): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInAnonymously();

      if (error) {
        return { success: false, user: null, error: error.message };
      }

      return { success: true, user: data.user, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Anonymous sign in failed';
      return { success: false, user: null, error: message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'quranapp://reset-password',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      return { success: false, error: message };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update password';
      return { success: false, error: message };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      return { success: false, error: message };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
}

export const authService = new AuthService();

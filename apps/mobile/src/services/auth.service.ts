/**
 * Authentication Service
 *
 * Handles all authentication operations with Supabase:
 * - Sign up (registration)
 * - Sign in (login)
 * - Sign out (logout)
 * - Session management
 * - Password reset
 */

import { supabase } from './supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // Metadata stored in auth.users
        },
      },
    });

    if (error) {
      console.error('❌ Sign up error:', error.message);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'No user returned from sign up' };
    }

    console.log('✅ Sign up successful:', data.user.email);
    return {
      success: true,
      user: data.user,
      session: data.session ?? undefined,
    };
  } catch (error) {
    console.error('❌ Sign up exception:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Sign in error:', error.message);
      return { success: false, error: error.message };
    }

    if (!data.user || !data.session) {
      return { success: false, error: 'No session returned from sign in' };
    }

    console.log('✅ Sign in successful:', data.user.email);
    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error('❌ Sign in exception:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Sign out error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Sign out successful');
    return { success: true };
  } catch (error) {
    console.error('❌ Sign out exception:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get the current session
 */
export const getSession = async (): Promise<Session | null> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Get session error:', error.message);
      return null;
    }

    return session;
  } catch (error) {
    console.error('❌ Get session exception:', error);
    return null;
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('❌ Get user error:', error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('❌ Get user exception:', error);
    return null;
  }
};

/**
 * Request a password reset email
 */
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'growgame://reset-password', // Deep link for mobile app
    });

    if (error) {
      console.error('❌ Password reset error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Password reset email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset exception:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (
  newPassword: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('❌ Update password error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Password updated successfully');
    return { success: true, user: data.user };
  } catch (error) {
    console.error('❌ Update password exception:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state changed:', event);
    callback(event, session);
  });
};

/**
 * Auth Provider
 *
 * Initializes authentication state when the app starts
 * and provides loading state during initialization
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useCharacterStore } from '../stores/characterStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized, user } = useAuthStore();
  const { loadCharacter, clearCharacter } = useCharacterStore();
  const [isReady, setIsReady] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        await initialize();
        if (isMounted) {
          setIsReady(true);
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        if (isMounted) {
          setIsReady(true); // Continue even if auth fails
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [initialize]);

  // Load character when user changes
  useEffect(() => {
    if (!isInitialized) return;

    if (user) {
      // User is logged in, load their character
      console.log('👤 Loading character for user:', user.id);
      loadCharacter(user.id);
    } else {
      // User logged out, clear character
      console.log('🚪 Clearing character data');
      clearCharacter();
    }
  }, [user, isInitialized, loadCharacter, clearCharacter]);

  // Show loading screen while initializing
  if (!isReady || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});

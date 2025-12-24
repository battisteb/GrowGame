/**
 * Auth Provider
 *
 * Initializes authentication state when the app starts
 * and provides loading state during initialization
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

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

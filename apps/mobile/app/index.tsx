/**
 * Root Index Screen
 *
 * Handles initial routing based on authentication state
 * - Redirects to /login if not authenticated
 * - Redirects to /(tabs)/home if authenticated
 */

import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      return; // Wait for auth to initialize
    }

    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      // User is not signed in and trying to access protected route
      router.replace('/login');
    } else if (user && !inAuthGroup) {
      // User is signed in but on auth screen
      router.replace('/(tabs)/home');
    } else if (!user) {
      // User is not signed in, go to login
      router.replace('/login');
    } else {
      // User is signed in, go to home
      router.replace('/(tabs)/home');
    }
  }, [user, segments, isInitialized]);

  // Show loading indicator while determining route
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});

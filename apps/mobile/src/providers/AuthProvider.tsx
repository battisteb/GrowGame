/**
 * Auth Provider
 *
 * Initializes authentication state when the app starts
 * and provides loading state during initialization
 */

import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useCharacterStore } from '../stores/characterStore';
import { useHabitsStore } from '../stores/habitsStore';
import {
  initializeNotifications,
  rescheduleAllNotifications,
} from '../services/notification.service';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, isInitialized, user } = useAuthStore();
  const { loadCharacter, clearCharacter, loadNotificationPreference } = useCharacterStore();
  const { clearHabits } = useHabitsStore();
  const [isReady, setIsReady] = useState(false);
  const appState = useRef(AppState.currentState);

  // Initialize auth and notifications on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        await initialize();
        await initializeNotifications();
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
      loadNotificationPreference();
    } else {
      // User logged out, clear all data
      console.log('🚪 Clearing character and habits data');
      clearCharacter();
      clearHabits();
    }
  }, [user, isInitialized, loadCharacter, clearCharacter, clearHabits, loadNotificationPreference]);

  // Reschedule notifications when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const character = useCharacterStore.getState().character;
        const todayLogs = useHabitsStore.getState().todayLogs;
        if (character) {
          rescheduleAllNotifications({
            currentStreak: character.current_streak,
            lastActivityDate: character.last_activity_date,
            hasCompletedHabitsToday: todayLogs.size > 0,
          }).catch(console.error);
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

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

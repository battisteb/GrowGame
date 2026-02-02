/**
 * Notification Service
 *
 * Local push notifications via expo-notifications:
 * - Daily reminder at 20h00 if no habits completed
 * - Streak danger alert at 21h00 if streak is at risk
 * - Milestone congratulations (immediate)
 * - Global on/off toggle via AsyncStorage
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isStreakInDanger } from '../utils/streakCalculator';

const STORAGE_KEY = '@growgame_notifications_enabled';
const DAILY_REMINDER_ID = 'daily-reminder';
const STREAK_DANGER_ID = 'streak-danger';

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize notification system: configure handlers and request permissions.
 */
export const initializeNotifications = async (): Promise<{
  success: boolean;
  granted: boolean;
  error?: string;
}> => {
  try {
    // Configure how notifications appear when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('🔕 Notification permissions not granted');
      return { success: true, granted: false };
    }

    console.log('🔔 Notifications initialized');
    return { success: true, granted: true };
  } catch (error) {
    console.error('❌ initializeNotifications error:', error);
    return { success: false, granted: false, error: String(error) };
  }
};

// =============================================================================
// PREFERENCE MANAGEMENT
// =============================================================================

/**
 * Get notification enabled preference from AsyncStorage.
 * Defaults to true if not set.
 */
export const getNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value === null ? true : value === 'true';
  } catch {
    return true;
  }
};

/**
 * Set notification enabled preference and cancel/reschedule accordingly.
 */
export const setNotificationsEnabled = async (
  enabled: boolean
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, String(enabled));

    if (!enabled) {
      await cancelAllNotifications();
    }
  } catch (error) {
    console.error('❌ setNotificationsEnabled error:', error);
  }
};

// =============================================================================
// SCHEDULING
// =============================================================================

/**
 * Cancel all scheduled notifications.
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🔕 All notifications cancelled');
  } catch (error) {
    console.error('❌ cancelAllNotifications error:', error);
  }
};

/**
 * Reschedule all notifications based on current character state.
 * Called on app open, habit completion, and toggle on.
 */
export const rescheduleAllNotifications = async (data: {
  currentStreak: number;
  lastActivityDate: string | null;
  hasCompletedHabitsToday: boolean;
}): Promise<void> => {
  try {
    const enabled = await getNotificationsEnabled();
    if (!enabled) return;

    // Cancel existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily reminder if no habits completed today
    if (!data.hasCompletedHabitsToday) {
      await scheduleDailyReminder();
    }

    // Schedule streak danger if applicable
    if (
      data.currentStreak > 0 &&
      isStreakInDanger(data.lastActivityDate)
    ) {
      await scheduleStreakDangerAlert(data.currentStreak);
    }
  } catch (error) {
    console.error('❌ rescheduleAllNotifications error:', error);
  }
};

/**
 * Schedule daily reminder at 20:00.
 */
const scheduleDailyReminder = async (): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: "N'oublie pas tes habitudes ! 💪",
      body: "Tu n'as complété aucune habitude aujourd'hui. Continue ta série !",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });

  console.log('🔔 Daily reminder scheduled at 20:00');
};

/**
 * Schedule streak danger alert at 21:00.
 */
const scheduleStreakDangerAlert = async (
  currentStreak: number
): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_DANGER_ID,
    content: {
      title: '🔥 Ta série est en danger !',
      body: `Tu as une série de ${currentStreak} jour${currentStreak > 1 ? 's' : ''} ! Ne la perds pas demain.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });

  console.log('🔔 Streak danger alert scheduled at 21:00');
};

/**
 * Show immediate milestone notification.
 */
export const showMilestoneNotification = async (
  streak: number,
  bonusCoins: number
): Promise<void> => {
  try {
    const enabled = await getNotificationsEnabled();
    if (!enabled) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🎉 Bravo ! Série de ${streak} jours !`,
        body: `Bonus de ${bonusCoins} pièces ! Continue comme ça !`,
      },
      trigger: null,
    });

    console.log(`🔔 Milestone notification for ${streak} days`);
  } catch (error) {
    console.error('❌ showMilestoneNotification error:', error);
  }
};

/**
 * Streak Calculator
 *
 * Calculates and manages user activity streaks
 * - Tracks consecutive days of activity
 * - Resets streak after 1 day gap
 * - Awards bonus for milestone streaks
 */

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  shouldAwardBonus: boolean;
  bonusAmount: number;
}

/**
 * Calculate the new streak based on last activity date
 *
 * Rules:
 * - If activity is today: continue streak
 * - If last activity was yesterday: increment streak
 * - If gap > 1 day: reset streak to 1
 * - Track longest streak ever achieved
 */
export function calculateStreak(
  lastActivityDate: string | null,
  currentStreak: number,
  longestStreak: number
): StreakResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If no previous activity, start streak at 1
  if (!lastActivityDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      shouldAwardBonus: false,
      bonusAmount: 0,
    };
  }

  const lastActivity = new Date(lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);

  const daysDifference = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Same day - check if we need to start the streak
  if (daysDifference === 0) {
    // If current streak is 0, this means we're starting a new streak today
    // (happens when multiple habits are completed on the same day)
    if (currentStreak === 0) {
      return {
        currentStreak: 1,
        longestStreak: Math.max(1, longestStreak),
        shouldAwardBonus: false,
        bonusAmount: 0,
      };
    }

    // Otherwise, no change to existing streak
    return {
      currentStreak,
      longestStreak,
      shouldAwardBonus: false,
      bonusAmount: 0,
    };
  }

  // Yesterday - increment streak
  if (daysDifference === 1) {
    const newStreak = currentStreak + 1;
    const newLongest = Math.max(newStreak, longestStreak);
    const bonus = calculateStreakBonus(newStreak);

    return {
      currentStreak: newStreak,
      longestStreak: newLongest,
      shouldAwardBonus: bonus > 0,
      bonusAmount: bonus,
    };
  }

  // Gap > 1 day - reset streak
  return {
    currentStreak: 1,
    longestStreak,
    shouldAwardBonus: false,
    bonusAmount: 0,
  };
}

/**
 * Calculate bonus coins for reaching streak milestones
 *
 * Milestones:
 * - 7 days: +10 coins
 * - 14 days: +25 coins
 * - 30 days: +50 coins
 * - 60 days: +100 coins
 * - 100 days: +200 coins
 */
export function calculateStreakBonus(streak: number): number {
  const milestones: { [key: number]: number } = {
    7: 10,
    14: 25,
    30: 50,
    60: 100,
    100: 200,
  };

  return milestones[streak] || 0;
}

/**
 * Get a message for the streak milestone
 */
export function getStreakMilestoneMessage(streak: number): string | null {
  const messages: { [key: number]: string } = {
    7: '🔥 7 jours consécutifs ! Continue comme ça !',
    14: '🌟 2 semaines de discipline ! Incroyable !',
    30: '💪 1 mois complet ! Tu es une légende !',
    60: '🏆 2 mois ! Ta détermination est inspirante !',
    100: '👑 100 JOURS ! Tu es un maître de la discipline !',
  };

  return messages[streak] || null;
}

/**
 * Check if user's streak is in danger (last activity was yesterday)
 * Useful for sending notifications
 */
export function isStreakInDanger(lastActivityDate: string | null): boolean {
  if (!lastActivityDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = new Date(lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);

  const daysDifference = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Streak is in danger if last activity was 1 day ago (yesterday)
  // because if no activity today, streak will reset tomorrow
  return daysDifference === 1;
}

/**
 * Format streak for display
 */
export function formatStreak(streak: number): string {
  if (streak === 0) return 'Pas encore de série';
  if (streak === 1) return '1 jour';
  return `${streak} jours`;
}

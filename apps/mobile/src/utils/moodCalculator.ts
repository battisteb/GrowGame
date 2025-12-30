/**
 * Mood Calculator
 *
 * Calculates character mood based on activity patterns
 * - Sad: 3+ days without any activity
 * - Tired: 2 days without activity
 * - Happy: streak >= 7 days
 * - Neutral: default
 */

import type { Mood } from '../types';

export interface MoodCalculationInput {
  currentStreak: number;
  lastActivityDate: string | null;
}

export interface MoodResult {
  mood: Mood;
  reason: string;
}

/**
 * Calculate days since last activity
 */
function daysSinceLastActivity(lastActivityDate: string | null, currentDate: Date = new Date()): number {
  if (!lastActivityDate) {
    return Infinity; // Never had activity
  }

  const lastActivity = new Date(lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);

  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (current.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysDiff;
}

/**
 * Calculate character mood based on activity
 *
 * Priority order (highest to lowest):
 * 1. Sad: 3+ days without activity (most critical)
 * 2. Tired: 2 days without activity
 * 3. Happy: streak >= 7 days AND active within last day
 * 4. Neutral: everything else
 */
export function calculateMood(
  input: MoodCalculationInput,
  currentDate: Date = new Date()
): MoodResult {
  const { currentStreak, lastActivityDate } = input;
  const daysSinceActivity = daysSinceLastActivity(lastActivityDate, currentDate);

  // Priority 1: Sad (3+ days without activity)
  if (daysSinceActivity >= 3) {
    return {
      mood: 'sad',
      reason: `${daysSinceActivity} jours sans activité`,
    };
  }

  // Priority 2: Tired (2 days without activity)
  if (daysSinceActivity >= 2) {
    return {
      mood: 'tired',
      reason: `${daysSinceActivity} jours sans activité`,
    };
  }

  // Priority 3: Happy (good streak and recently active)
  if (currentStreak >= 7 && daysSinceActivity <= 1) {
    return {
      mood: 'happy',
      reason: `${currentStreak} jours de streak !`,
    };
  }

  // Priority 4: Neutral (default)
  return {
    mood: 'neutral',
    reason: daysSinceActivity === 0 ? 'Activité régulière' : 'En cours de progression',
  };
}

/**
 * Get a human-readable mood description
 */
export function getMoodDescription(mood: Mood): string {
  const descriptions: Record<Mood, string> = {
    happy: 'Ton personnage est heureux ! Continue comme ça !',
    neutral: 'Ton personnage est concentré sur ses objectifs.',
    tired: 'Ton personnage semble fatigué. Une petite activité ?',
    sad: 'Ton personnage a besoin de toi ! Reprends le rythme.',
  };

  return descriptions[mood];
}

/**
 * Habit Logs Service
 *
 * Handles habit completion tracking:
 * - Log habit completions
 * - Award XP and coins
 * - Update character and domain skills
 * - Prevent duplicate completions per day
 */

import { supabase } from './supabase';
import type { HabitLog, Habit, CompletionMode } from '../types';
import { XP_REWARDS, COIN_REWARDS, RANKED_XP_REWARDS } from '../constants/game';
import { updateStreak, updateMood } from './character.service';
import { uploadHabitPhoto } from './storage.service';
import { verifyHabitPhoto } from './photoVerification.service';
import * as FileSystem from 'expo-file-system/legacy';

// =============================================================================
// GET HABIT LOGS
// =============================================================================

/**
 * Get today's completion log for a specific habit
 * Uses server-side date comparison to avoid timezone issues
 */
export const getTodayLog = async (
  habitId: string
): Promise<{ success: boolean; log?: HabitLog | null; error?: string }> => {
  try {
    // Use PostgreSQL's DATE() function to compare only the date part
    // This avoids timezone issues with JavaScript date handling
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .gte('completed_at', new Date().toISOString().split('T')[0]) // Just the date: YYYY-MM-DD
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching today log:', error);
      return { success: false, error: error.message };
    }

    // Return the first log if found, or null
    return { success: true, log: data && data.length > 0 ? data[0] : null };
  } catch (error) {
    console.error('❌ Exception in getTodayLog:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get all logs for a habit
 */
export const getHabitLogs = async (
  habitId: string
): Promise<{ success: boolean; logs?: HabitLog[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching habit logs:', error);
      return { success: false, error: error.message };
    }

    return { success: true, logs: data || [] };
  } catch (error) {
    console.error('❌ Exception in getHabitLogs:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get all logs for today for a character
 * Uses server-side date comparison to avoid timezone issues
 */
export const getTodayLogsForCharacter = async (
  characterId: string
): Promise<{ success: boolean; logs?: HabitLog[]; error?: string }> => {
  try {
    // Use just the date part (YYYY-MM-DD) to avoid timezone issues
    const todayDate = new Date().toISOString().split('T')[0];

    console.log('🔍 Fetching logs for date:', todayDate);

    const { data, error } = await supabase
      .from('habit_logs')
      .select('*, habits!inner(character_id)')
      .eq('habits.character_id', characterId)
      .gte('completed_at', todayDate);

    if (error) {
      console.error('❌ Error fetching today logs:', error);
      return { success: false, error: error.message };
    }

    console.log(`📊 Found ${data?.length || 0} log(s) for today`);
    return { success: true, logs: data || [] };
  } catch (error) {
    console.error('❌ Exception in getTodayLogsForCharacter:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// COMPLETE HABIT
// =============================================================================

export interface CompleteHabitResult {
  success: boolean;
  log?: HabitLog;
  xpEarned?: number;
  coinsEarned?: number;
  rankedXpEarned?: number;
  verificationFailed?: boolean;
  streakBonus?: number;
  streakMessage?: string;
  currentStreak?: number;
  error?: string;
}

/**
 * Complete a habit with mode selection (Normal or Ranked)
 *
 * Mode Normal: Behavior as before (no photo required)
 * Mode Ranked: Photo required → upload → AI verification → ranked XP if valid
 *
 * This function:
 * 1. Checks if habit was already completed today
 * 2. If ranked mode: uploads photo and verifies with AI
 * 3. Fetches character streak values (before trigger updates them)
 * 4. Calculates XP and coins based on difficulty
 * 5. Creates a habit_log entry with completion_mode and photo_url
 * 6. Updates character (global XP, coins)
 * 7. Updates domain_skill (domain XP)
 * 8. If ranked: awards ranked XP
 * 9. Updates streak and awards milestone bonuses
 */
export const completeHabitWithMode = async (
  habit: Habit,
  characterId: string,
  userId: string,
  options: {
    mode: CompletionMode;
    photoUri?: string;
  }
): Promise<CompleteHabitResult> => {
  try {
    const { mode, photoUri } = options;

    // Step 1: Check if already completed today
    const todayLogResult = await getTodayLog(habit.id);
    if (!todayLogResult.success) {
      return {
        success: false,
        error: todayLogResult.error || 'Failed to check today log',
      };
    }

    if (todayLogResult.log) {
      return {
        success: false,
        error: 'Habit already completed today',
      };
    }

    let photoUrl: string | null = null;
    let verified = true; // Default for normal mode

    // Step 2: If ranked mode, handle photo upload and verification
    if (mode === 'ranked') {
      if (!photoUri) {
        return {
          success: false,
          error: 'Photo required for ranked mode',
        };
      }

      // Generate habit log ID for photo storage (temporary UUID)
      const tempHabitLogId = 'temp_' + Date.now();

      // Upload photo to Supabase Storage
      console.log('📸 Uploading photo for ranked completion...');
      const uploadResult = await uploadHabitPhoto(userId, tempHabitLogId, photoUri);

      if (!uploadResult.success || !uploadResult.photoUrl) {
        return {
          success: false,
          error: uploadResult.error || 'Failed to upload photo',
        };
      }

      photoUrl = uploadResult.photoUrl;

      // Verify photo with Google Cloud Vision API
      console.log('🔍 Verifying photo with AI...');
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const verificationResult = await verifyHabitPhoto(base64);

      if (!verificationResult.success) {
        return {
          success: false,
          error: verificationResult.error || 'Failed to verify photo',
        };
      }

      if (!verificationResult.isValid) {
        console.log('❌ Photo verification failed');
        return {
          success: false,
          verificationFailed: true,
          error: 'Photo invalide. Prends une photo plus claire montrant ton activité.',
        };
      }

      verified = true;
      console.log('✅ Photo verified successfully');
    }

    // Step 3: Fetch character streak values BEFORE creating the log
    const { data: character, error: charFetchError } = await supabase
      .from('characters')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('id', characterId)
      .single();

    if (charFetchError || !character) {
      console.error('❌ Error fetching character for streak:', charFetchError);
    }

    // Step 4: Calculate rewards based on difficulty
    const xpEarned = XP_REWARDS[habit.difficulty];
    const coinsEarned = COIN_REWARDS[habit.difficulty];
    const rankedXpEarned = mode === 'ranked' ? RANKED_XP_REWARDS[habit.difficulty] : 0;

    // Step 5: Create habit_log entry
    const { data: log, error: logError } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: habit.id,
        completed_at: new Date().toISOString(),
        photo_url: photoUrl,
        verified: verified,
        xp_earned: xpEarned,
        coins_earned: coinsEarned,
        completion_mode: mode,
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Error creating habit log:', logError);
      return { success: false, error: logError.message };
    }

    // Step 6: Update character (global XP and coins)
    const { error: characterError } = await supabase.rpc('add_character_rewards', {
      p_character_id: characterId,
      p_xp: xpEarned,
      p_coins: coinsEarned,
    });

    if (characterError) {
      console.error('❌ Error updating character:', characterError);
    }

    // Step 7: Update domain_skill (domain XP)
    const { error: skillError } = await supabase.rpc('add_domain_skill_xp', {
      p_character_id: characterId,
      p_domain: habit.domain,
      p_xp: xpEarned,
    });

    if (skillError) {
      console.error('❌ Error updating domain skill:', skillError);
    }

    // Step 8: If ranked mode, award ranked XP
    if (mode === 'ranked' && rankedXpEarned > 0) {
      const { error: rankedError } = await supabase.rpc('add_ranked_xp', {
        p_character_id: characterId,
        p_xp: rankedXpEarned,
      });

      if (rankedError) {
        console.error('❌ Error updating ranked XP:', rankedError);
      } else {
        console.log(`🏆 Ranked XP awarded: +${rankedXpEarned}`);
      }
    }

    // Step 9: Update streak and check for bonus
    const streakResult = await updateStreak(
      characterId,
      character
        ? {
            lastActivityDate: character.last_activity_date,
            currentStreak: character.current_streak,
            longestStreak: character.longest_streak,
          }
        : undefined
    );

    let bonusMessage = '';
    if (streakResult.success && streakResult.bonusCoins && streakResult.bonusCoins > 0) {
      bonusMessage = ` | 🔥 Streak bonus: +${streakResult.bonusCoins} coins!`;
    }

    // Step 10: Update character mood based on new streak/activity
    await updateMood(characterId);

    const modeLabel = mode === 'ranked' ? 'Ranked 🏆' : 'Normal';
    console.log(
      `✅ Habit completed [${modeLabel}]: ${habit.name} (+${xpEarned} XP, +${coinsEarned} coins${mode === 'ranked' ? `, +${rankedXpEarned} ranked XP` : ''}${bonusMessage})`
    );

    return {
      success: true,
      log,
      xpEarned,
      coinsEarned,
      rankedXpEarned,
      streakBonus: streakResult.bonusCoins,
      streakMessage: streakResult.message,
      currentStreak: streakResult.currentStreak,
    };
  } catch (error) {
    console.error('❌ Exception in completeHabitWithMode:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Complete a habit in normal mode (backwards compatibility)
 *
 * This function wraps completeHabitWithMode with mode='normal'
 * Kept for backwards compatibility with existing code
 */
export const completeHabit = async (
  habit: Habit,
  characterId: string
): Promise<CompleteHabitResult> => {
  try {
    // Step 1: Check if already completed today
    const todayLogResult = await getTodayLog(habit.id);
    if (!todayLogResult.success) {
      return {
        success: false,
        error: todayLogResult.error || 'Failed to check today log',
      };
    }

    if (todayLogResult.log) {
      return {
        success: false,
        error: 'Habit already completed today',
      };
    }

    // Step 2: Fetch character streak values BEFORE creating the log
    // (to avoid race condition with the trigger that updates last_activity_date)
    const { data: character, error: charFetchError } = await supabase
      .from('characters')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('id', characterId)
      .single();

    if (charFetchError || !character) {
      console.error('❌ Error fetching character for streak:', charFetchError);
      // Continue anyway - this is not critical
    }

    // Step 3: Calculate rewards based on difficulty
    const xpEarned = XP_REWARDS[habit.difficulty];
    const coinsEarned = COIN_REWARDS[habit.difficulty];

    // Step 4: Create habit_log entry
    const { data: log, error: logError } = await supabase
      .from('habit_logs')
      .insert({
        habit_id: habit.id,
        completed_at: new Date().toISOString(),
        photo_url: null,
        verified: true, // Auto-verified for now (no photo check)
        xp_earned: xpEarned,
        coins_earned: coinsEarned,
        completion_mode: 'normal', // Normal mode (no photo)
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Error creating habit log:', logError);
      return { success: false, error: logError.message };
    }

    // Step 5: Update character (global XP and coins)
    const { error: characterError } = await supabase.rpc('add_character_rewards', {
      p_character_id: characterId,
      p_xp: xpEarned,
      p_coins: coinsEarned,
    });

    if (characterError) {
      console.error('❌ Error updating character:', characterError);
      // Continue anyway - log was created
    }

    // Step 6: Update domain_skill (domain XP)
    const { error: skillError } = await supabase.rpc('add_domain_skill_xp', {
      p_character_id: characterId,
      p_domain: habit.domain,
      p_xp: xpEarned,
    });

    if (skillError) {
      console.error('❌ Error updating domain skill:', skillError);
      // Continue anyway - log was created
    }

    // Step 7: Update streak and check for bonus
    // Pass the previous values we fetched BEFORE creating the log
    // to avoid race condition with the trigger
    const streakResult = await updateStreak(
      characterId,
      character
        ? {
            lastActivityDate: character.last_activity_date,
            currentStreak: character.current_streak,
            longestStreak: character.longest_streak,
          }
        : undefined
    );

    let bonusMessage = '';
    if (streakResult.success && streakResult.bonusCoins && streakResult.bonusCoins > 0) {
      bonusMessage = ` | 🔥 Streak bonus: +${streakResult.bonusCoins} coins!`;
    }

    // Step 8: Update character mood based on new streak/activity
    await updateMood(characterId);

    console.log(
      `✅ Habit completed: ${habit.name} (+${xpEarned} XP, +${coinsEarned} coins${bonusMessage})`
    );

    return {
      success: true,
      log,
      xpEarned,
      coinsEarned,
      streakBonus: streakResult.bonusCoins,
      streakMessage: streakResult.message,
      currentStreak: streakResult.currentStreak,
    };
  } catch (error) {
    console.error('❌ Exception in completeHabit:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// UNCOMPLETE HABIT (UNDO)
// =============================================================================

/**
 * Uncomplete a habit (delete ALL today's logs and revert rewards)
 * Useful for mistakes or testing
 * Uses server-side date comparison to avoid timezone issues
 */
export const uncompleteHabit = async (
  habitId: string,
  characterId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Use just the date part (YYYY-MM-DD) to avoid timezone issues
    const todayDate = new Date().toISOString().split('T')[0];

    console.log('🔍 Searching for logs to delete for habit:', habitId, 'date:', todayDate);

    // Get ALL logs for today (in case of duplicates)
    const { data: logs, error: fetchError } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .gte('completed_at', todayDate);

    if (fetchError) {
      console.error('❌ Error fetching today logs:', fetchError);
      return { success: false, error: fetchError.message };
    }

    console.log(`📋 Found ${logs?.length || 0} log(s) to delete:`, logs?.map(l => l.id));

    if (!logs || logs.length === 0) {
      return {
        success: false,
        error: 'No completion found for today',
      };
    }

    // Calculate total rewards to revert (sum of all logs)
    const totalXp = logs.reduce((sum, log) => sum + log.xp_earned, 0);
    const totalCoins = logs.reduce((sum, log) => sum + log.coins_earned, 0);

    console.log(`💰 Reverting rewards: -${totalXp} XP, -${totalCoins} coins`);

    // Revert character rewards
    const { error: characterError } = await supabase.rpc('add_character_rewards', {
      p_character_id: characterId,
      p_xp: -totalXp,
      p_coins: -totalCoins,
    });

    if (characterError) {
      console.error('❌ Error reverting character rewards:', characterError);
    }

    // Get habit to know the domain
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('domain')
      .eq('id', habitId)
      .single();

    if (!habitError && habit) {
      // Revert domain skill XP
      const { error: skillError } = await supabase.rpc('add_domain_skill_xp', {
        p_character_id: characterId,
        p_domain: habit.domain,
        p_xp: -totalXp,
      });

      if (skillError) {
        console.error('❌ Error reverting domain skill XP:', skillError);
      }
    }

    // Delete logs by ID instead of using date filter
    // This is more reliable than using gte with date comparison
    const logIds = logs.map(log => log.id);
    console.log('🗑️ Deleting logs by IDs:', logIds);

    const { error: deleteError, count } = await supabase
      .from('habit_logs')
      .delete({ count: 'exact' })
      .in('id', logIds);

    if (deleteError) {
      console.error('❌ Error deleting habit logs:', deleteError);
      return { success: false, error: deleteError.message };
    }

    console.log(`✅ Habit uncompleted successfully (deleted ${count} log(s))`);
    return { success: true };
  } catch (error) {
    console.error('❌ Exception in uncompleteHabit:', error);
    return { success: false, error: String(error) };
  }
};

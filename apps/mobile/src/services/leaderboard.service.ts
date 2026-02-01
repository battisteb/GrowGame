/**
 * Leaderboard Service
 *
 * Handles ranked leaderboard data:
 * - Global leaderboard (all-time ranked XP)
 * - Weekly leaderboard (XP earned this week, resets Monday)
 * - Current user rank
 */

import { supabase } from './supabase';
import type { LeaderboardEntry } from '../types';

/**
 * Fetch global leaderboard (all-time ranked XP)
 */
export const getGlobalLeaderboard = async (
  limit: number = 20
): Promise<{ success: boolean; entries?: LeaderboardEntry[]; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_type: 'global',
      p_limit: limit,
    });

    if (error) {
      console.error('❌ Error fetching global leaderboard:', error);
      return { success: false, error: error.message };
    }

    return { success: true, entries: data || [] };
  } catch (error) {
    console.error('❌ Exception in getGlobalLeaderboard:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Fetch weekly leaderboard (XP earned this week)
 */
export const getWeeklyLeaderboard = async (
  limit: number = 20
): Promise<{ success: boolean; entries?: LeaderboardEntry[]; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_type: 'weekly',
      p_limit: limit,
    });

    if (error) {
      console.error('❌ Error fetching weekly leaderboard:', error);
      return { success: false, error: error.message };
    }

    return { success: true, entries: data || [] };
  } catch (error) {
    console.error('❌ Exception in getWeeklyLeaderboard:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get current user's rank in the leaderboard
 */
export const getUserRank = async (
  characterId: string,
  type: 'global' | 'weekly'
): Promise<{ success: boolean; rank?: number; xp?: number; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc('get_user_rank', {
      p_character_id: characterId,
      p_type: type,
    });

    if (error) {
      console.error('❌ Error fetching user rank:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: true, rank: undefined, xp: 0 };
    }

    return { success: true, rank: data[0].rank, xp: data[0].xp };
  } catch (error) {
    console.error('❌ Exception in getUserRank:', error);
    return { success: false, error: String(error) };
  }
};

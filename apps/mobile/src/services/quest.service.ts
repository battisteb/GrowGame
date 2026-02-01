/**
 * Quest Service
 *
 * Handles daily quests and achievements:
 * - Generate/load daily quests
 * - Track quest progress
 * - Claim rewards
 * - Initialize and recalculate achievement progress
 */

import { supabase } from './supabase';
import type { DailyQuest, Achievement, Habit, CompletionMode } from '../types';
import {
  generateDailyQuestSet,
  ACHIEVEMENT_DEFINITIONS,
} from '../constants/quests';

// =============================================================================
// DAILY QUESTS
// =============================================================================

/**
 * Get today's daily quests for a character.
 * If none exist for today, generate 3 new ones.
 */
export const getOrGenerateDailyQuests = async (
  characterId: string
): Promise<{ success: boolean; quests?: DailyQuest[]; error?: string }> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if quests exist for today
    const { data: existing, error: fetchError } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('character_id', characterId)
      .eq('quest_date', today);

    if (fetchError) {
      console.error('❌ Error fetching daily quests:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (existing && existing.length > 0) {
      console.log(`📋 Found ${existing.length} daily quests for today`);
      return { success: true, quests: existing };
    }

    // Generate new quests for today
    console.log('🎲 Generating new daily quests...');
    const questSet = generateDailyQuestSet();

    const inserts = questSet.map((q) => ({
      character_id: characterId,
      quest_date: today,
      template_id: q.templateId,
      params: q.params,
      current_progress: 0,
      target: q.target,
      reward_xp: q.rewardXp,
      reward_coins: q.rewardCoins,
    }));

    const { data: created, error: insertError } = await supabase
      .from('daily_quests')
      .insert(inserts)
      .select();

    if (insertError) {
      console.error('❌ Error creating daily quests:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log(`✅ Generated ${created?.length || 0} daily quests`);
    return { success: true, quests: created || [] };
  } catch (error) {
    console.error('❌ Exception in getOrGenerateDailyQuests:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Update progress for a specific daily quest
 */
export const updateDailyQuestProgress = async (
  questId: string,
  newProgress: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: Record<string, unknown> = {
      current_progress: newProgress,
    };

    // Fetch the quest to check if it's newly completed
    const { data: quest, error: fetchError } = await supabase
      .from('daily_quests')
      .select('target, completed_at')
      .eq('id', questId)
      .single();

    if (fetchError || !quest) {
      return { success: false, error: fetchError?.message || 'Quest not found' };
    }

    // Mark as completed if progress meets target and not already completed
    if (newProgress >= quest.target && !quest.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('daily_quests')
      .update(updateData)
      .eq('id', questId);

    if (updateError) {
      console.error('❌ Error updating daily quest progress:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Exception in updateDailyQuestProgress:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// ACHIEVEMENTS
// =============================================================================

/**
 * Get all achievements for a character.
 * Initialize missing achievements from ACHIEVEMENT_DEFINITIONS.
 */
export const getOrInitAchievements = async (
  characterId: string
): Promise<{ success: boolean; achievements?: Achievement[]; error?: string }> => {
  try {
    // Fetch existing achievements
    const { data: existing, error: fetchError } = await supabase
      .from('achievements')
      .select('*')
      .eq('character_id', characterId);

    if (fetchError) {
      console.error('❌ Error fetching achievements:', fetchError);
      return { success: false, error: fetchError.message };
    }

    const existingIds = new Set((existing || []).map((a) => a.achievement_id));

    // Find missing achievements
    const missing = ACHIEVEMENT_DEFINITIONS.filter(
      (def) => !existingIds.has(def.id)
    );

    if (missing.length > 0) {
      console.log(`🏆 Initializing ${missing.length} new achievements...`);

      const inserts = missing.map((def) => ({
        character_id: characterId,
        achievement_id: def.id,
        current_progress: 0,
        target: def.target,
        reward_xp: def.rewardXp,
        reward_coins: def.rewardCoins,
      }));

      const { data: created, error: insertError } = await supabase
        .from('achievements')
        .insert(inserts)
        .select();

      if (insertError) {
        console.error('❌ Error initializing achievements:', insertError);
        return { success: false, error: insertError.message };
      }

      const all = [...(existing || []), ...(created || [])];
      return { success: true, achievements: all };
    }

    return { success: true, achievements: existing || [] };
  } catch (error) {
    console.error('❌ Exception in getOrInitAchievements:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Update progress for a specific achievement
 */
export const updateAchievementProgress = async (
  achievementId: string,
  characterId: string,
  newProgress: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const updateData: Record<string, unknown> = {
      current_progress: newProgress,
      updated_at: new Date().toISOString(),
    };

    // Fetch the achievement to check if it's newly completed
    const { data: achievement, error: fetchError } = await supabase
      .from('achievements')
      .select('target, completed_at')
      .eq('achievement_id', achievementId)
      .eq('character_id', characterId)
      .single();

    if (fetchError || !achievement) {
      return { success: false, error: fetchError?.message || 'Achievement not found' };
    }

    // Mark as completed if progress meets target and not already completed
    if (newProgress >= achievement.target && !achievement.completed_at) {
      updateData.completed_at = new Date().toISOString();
      console.log(`🏆 Achievement completed: ${achievementId}`);
    }

    const { error: updateError } = await supabase
      .from('achievements')
      .update(updateData)
      .eq('achievement_id', achievementId)
      .eq('character_id', characterId);

    if (updateError) {
      console.error('❌ Error updating achievement progress:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Exception in updateAchievementProgress:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// CLAIM REWARDS
// =============================================================================

/**
 * Claim reward for a completed quest (daily or achievement)
 * Uses the atomic claim_quest_reward RPC function
 */
export const claimQuestReward = async (
  questId: string,
  characterId: string,
  questType: 'daily' | 'achievement'
): Promise<{
  success: boolean;
  xpEarned?: number;
  coinsEarned?: number;
  error?: string;
}> => {
  try {
    console.log(`🎁 Claiming ${questType} reward...`);

    const { data, error } = await supabase.rpc('claim_quest_reward', {
      p_quest_id: questId,
      p_character_id: characterId,
      p_quest_type: questType,
    });

    if (error) {
      console.error('❌ Error claiming reward:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Claim failed' };
    }

    console.log(`✅ Reward claimed: +${data.xp_earned} XP, +${data.coins_earned} coins`);

    return {
      success: true,
      xpEarned: data.xp_earned,
      coinsEarned: data.coins_earned,
    };
  } catch (error) {
    console.error('❌ Exception in claimQuestReward:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// PROGRESS CALCULATION HELPERS
// =============================================================================

/**
 * Calculate daily quest progress based on today's habit logs
 */
export const calculateDailyProgress = async (
  characterId: string,
  templateId: string,
  params: Record<string, unknown>
): Promise<number> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    switch (templateId) {
      case 'complete_n_habits': {
        // Count all habit completions today
        const { count } = await supabase
          .from('habit_logs')
          .select('id', { count: 'exact', head: true })
          .gte('completed_at', today)
          .lt('completed_at', today + 'T23:59:59.999Z');
        return count || 0;
      }

      case 'complete_habit_in_domain': {
        // Count habit completions in specific domain today
        const { data: logs } = await supabase
          .from('habit_logs')
          .select('id, habits!inner(domain)')
          .gte('completed_at', today)
          .lt('completed_at', today + 'T23:59:59.999Z');

        if (!logs) return 0;
        return logs.filter(
          (log: Record<string, unknown>) =>
            (log.habits as Record<string, unknown>)?.domain === params.domain
        ).length;
      }

      case 'complete_difficulty_n': {
        // Count habit completions with specific difficulty today
        const { data: logs } = await supabase
          .from('habit_logs')
          .select('id, habits!inner(difficulty)')
          .gte('completed_at', today)
          .lt('completed_at', today + 'T23:59:59.999Z');

        if (!logs) return 0;
        return logs.filter(
          (log: Record<string, unknown>) =>
            (log.habits as Record<string, unknown>)?.difficulty === params.difficulty
        ).length;
      }

      case 'write_journal': {
        // Count journal entries today
        const { count } = await supabase
          .from('journal_entries')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today)
          .lt('created_at', today + 'T23:59:59.999Z');
        return count || 0;
      }

      case 'complete_ranked_habit': {
        // Count ranked habit completions today
        const { count } = await supabase
          .from('habit_logs')
          .select('id', { count: 'exact', head: true })
          .eq('completion_mode', 'ranked')
          .gte('completed_at', today)
          .lt('completed_at', today + 'T23:59:59.999Z');
        return count || 0;
      }

      default:
        return 0;
    }
  } catch (error) {
    console.error('❌ Error calculating daily progress:', error);
    return 0;
  }
};

/**
 * Calculate achievement progress based on cumulative game state
 */
export const calculateAchievementProgress = async (
  characterId: string,
  achievementId: string
): Promise<number> => {
  try {
    switch (achievementId) {
      // Level achievements
      case 'reach_level_5':
      case 'reach_level_10':
      case 'reach_level_25': {
        const { data } = await supabase
          .from('characters')
          .select('global_level')
          .eq('id', characterId)
          .single();
        return data?.global_level || 0;
      }

      // Streak achievements
      case 'streak_7':
      case 'streak_30': {
        const { data } = await supabase
          .from('characters')
          .select('longest_streak')
          .eq('id', characterId)
          .single();
        return data?.longest_streak || 0;
      }

      // Total habits completed
      case 'habits_10':
      case 'habits_50':
      case 'habits_100': {
        const { count } = await supabase
          .from('habit_logs')
          .select('id', { count: 'exact', head: true })
          .in(
            'habit_id',
            (
              await supabase
                .from('habits')
                .select('id')
                .eq('character_id', characterId)
            ).data?.map((h) => h.id) || []
          );
        return count || 0;
      }

      // Domain mastery: count domains with level >= 3
      case 'all_domains_3': {
        const { data } = await supabase
          .from('domain_skills')
          .select('level')
          .eq('character_id', characterId)
          .gte('level', 3);
        return data?.length || 0;
      }

      // Ranked habits completed
      case 'ranked_10': {
        const { count } = await supabase
          .from('habit_logs')
          .select('id', { count: 'exact', head: true })
          .eq('completion_mode', 'ranked')
          .in(
            'habit_id',
            (
              await supabase
                .from('habits')
                .select('id')
                .eq('character_id', characterId)
            ).data?.map((h) => h.id) || []
          );
        return count || 0;
      }

      // Coins accumulated
      case 'coins_100': {
        const { data } = await supabase
          .from('characters')
          .select('coins')
          .eq('id', characterId)
          .single();
        return data?.coins || 0;
      }

      default:
        return 0;
    }
  } catch (error) {
    console.error('❌ Error calculating achievement progress:', error);
    return 0;
  }
};

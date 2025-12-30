/**
 * Character Service
 *
 * Handles character creation and management:
 * - Create character on signup
 * - Initialize domain skills
 * - Manage character data
 */

import { supabase } from './supabase';
import type { Character, DomainSkill, Domain } from '../types';
import { calculateStreak, getStreakMilestoneMessage } from '../utils/streakCalculator';
import {
  calculateDecayForAllDomains,
  getDecaySummaryMessage,
  type DecayResult,
} from '../utils/decayCalculator';
import { calculateMood } from '../utils/moodCalculator';

/**
 * The 5 core domains for skill tracking
 */
const DOMAINS: Domain[] = ['etudes', 'sport', 'meditation', 'lecture', 'etirements'];

/**
 * Create a new character for a user
 * This should be called immediately after user signup
 */
export const createCharacter = async (
  userId: string,
  userName: string
): Promise<{ success: boolean; character?: Character; error?: string }> => {
  try {
    console.log('📝 Creating character for user:', userId);

    // Create the character
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .insert({
        user_id: userId,
        name: userName,
        global_level: 1,
        global_xp: 0,
        coins: 0,
        gems: 0,
        mood: 'neutral',
        current_streak: 0,
        longest_streak: 0,
      })
      .select()
      .single();

    if (characterError) {
      console.error('❌ Character creation error:', characterError.message);
      return { success: false, error: characterError.message };
    }

    if (!character) {
      return { success: false, error: 'No character returned after creation' };
    }

    console.log('✅ Character created:', character.id);

    // Create the 5 domain skills
    const domainSkills = DOMAINS.map((domain) => ({
      character_id: character.id,
      domain,
      level: 1,
      xp: 0,
    }));

    const { error: skillsError } = await supabase
      .from('domain_skills')
      .insert(domainSkills);

    if (skillsError) {
      console.error('❌ Domain skills creation error:', skillsError.message);
      // Character was created but skills failed - this is a partial failure
      return {
        success: false,
        character,
        error: `Character created but domain skills failed: ${skillsError.message}`,
      };
    }

    console.log('✅ Domain skills created for all 5 domains');

    return { success: true, character };
  } catch (error) {
    console.error('❌ Create character exception:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get character by user ID
 */
export const getCharacterByUserId = async (
  userId: string
): Promise<{ success: boolean; character?: Character; error?: string }> => {
  try {
    const { data: character, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Get character error:', error.message);
      return { success: false, error: error.message };
    }

    if (!character) {
      return { success: false, error: 'No character found for this user' };
    }

    return { success: true, character };
  } catch (error) {
    console.error('❌ Get character exception:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get all domain skills for a character
 */
export const getDomainSkills = async (
  characterId: string
): Promise<{ success: boolean; skills?: DomainSkill[]; error?: string }> => {
  try {
    const { data: skills, error } = await supabase
      .from('domain_skills')
      .select('*')
      .eq('character_id', characterId)
      .order('domain', { ascending: true });

    if (error) {
      console.error('❌ Get domain skills error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, skills: skills || [] };
  } catch (error) {
    console.error('❌ Get domain skills exception:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Check if a user already has a character
 */
export const userHasCharacter = async (userId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('characters')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Check character exists error:', error.message);
      return false;
    }

    return (count || 0) > 0;
  } catch (error) {
    console.error('❌ Check character exists exception:', error);
    return false;
  }
};

/**
 * Update character streak based on activity
 * Should be called when a habit is completed
 *
 * Returns the bonus coins if a milestone was reached
 *
 * @param previousValues - Optional previous values to use for calculation (to avoid race condition with trigger)
 */
export const updateStreak = async (
  characterId: string,
  previousValues?: {
    lastActivityDate: string | null;
    currentStreak: number;
    longestStreak: number;
  }
): Promise<{
  success: boolean;
  bonusCoins?: number;
  message?: string;
  currentStreak?: number;
  error?: string
}> => {
  try {
    console.log('🔥 Updating streak for character:', characterId);

    let lastActivityDate: string | null;
    let currentStreak: number;
    let longestStreak: number;

    // Use provided values or fetch from database
    if (previousValues) {
      console.log('📋 Using provided previous values:', previousValues);
      lastActivityDate = previousValues.lastActivityDate;
      currentStreak = previousValues.currentStreak;
      longestStreak = previousValues.longestStreak;
    } else {
      // Get current character data
      const { data: character, error: fetchError } = await supabase
        .from('characters')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('id', characterId)
        .single();

      if (fetchError || !character) {
        console.error('❌ Error fetching character for streak:', fetchError);
        return { success: false, error: fetchError?.message || 'Character not found' };
      }

      lastActivityDate = character.last_activity_date;
      currentStreak = character.current_streak;
      longestStreak = character.longest_streak;
    }

    // Calculate new streak
    const streakResult = calculateStreak(
      lastActivityDate,
      currentStreak,
      longestStreak
    );

    console.log('📊 Streak calculation:', {
      previous: currentStreak,
      new: streakResult.currentStreak,
      longest: streakResult.longestStreak,
      bonus: streakResult.bonusAmount,
    });

    // Update character with new streak values
    const updateData: any = {
      current_streak: streakResult.currentStreak,
      longest_streak: streakResult.longestStreak,
      updated_at: new Date().toISOString(),
    };

    // Add bonus coins if milestone reached
    if (streakResult.shouldAwardBonus && streakResult.bonusAmount > 0) {
      console.log(`🎁 Streak milestone reached! Bonus: +${streakResult.bonusAmount} coins`);

      // Increment coins
      const { error: coinsError } = await supabase.rpc('add_character_rewards', {
        p_character_id: characterId,
        p_xp: 0,
        p_coins: streakResult.bonusAmount,
      });

      if (coinsError) {
        console.error('❌ Error adding streak bonus:', coinsError);
      }
    }

    const { error: updateError } = await supabase
      .from('characters')
      .update(updateData)
      .eq('id', characterId);

    if (updateError) {
      console.error('❌ Error updating streak:', updateError);
      return { success: false, error: updateError.message };
    }

    const message = streakResult.shouldAwardBonus
      ? getStreakMilestoneMessage(streakResult.currentStreak)
      : null;

    console.log(`✅ Streak updated successfully: ${streakResult.currentStreak} days`);

    return {
      success: true,
      bonusCoins: streakResult.shouldAwardBonus ? streakResult.bonusAmount : 0,
      message: message || undefined,
      currentStreak: streakResult.currentStreak,
    };
  } catch (error) {
    console.error('❌ Update streak exception:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Apply skill decay to all domains based on inactivity
 * Should be called on app launch to check for decayed skills
 *
 * Decay rules:
 * - After 7 days of inactivity on a domain → level drops to max(1, currentLevel / 2)
 * - Never goes below level 1
 * - XP is recalculated to match the new level
 *
 * @param characterId - The character ID to check
 * @returns Summary of decay applied, with message if any decay occurred
 */
export const applyDecayToAllDomains = async (
  characterId: string
): Promise<{
  success: boolean;
  decayApplied: boolean;
  message?: string;
  decayedDomains?: string[];
  error?: string;
}> => {
  try {
    console.log('🔍 Checking skill decay for character:', characterId);

    // Get all domain skills for the character
    const { data: domainSkills, error: fetchError } = await supabase
      .from('domain_skills')
      .select('*')
      .eq('character_id', characterId);

    if (fetchError || !domainSkills) {
      console.error('❌ Error fetching domain skills:', fetchError);
      return {
        success: false,
        decayApplied: false,
        error: fetchError?.message || 'Failed to fetch domain skills',
      };
    }

    // Calculate decay for all domains
    const decayResults = calculateDecayForAllDomains(domainSkills);

    // Find domains that need decay applied
    const domainsToDecay = domainSkills.filter((skill) => {
      const result = decayResults.get(skill.domain);
      return result && result.shouldDecay;
    });

    if (domainsToDecay.length === 0) {
      console.log('✅ No skill decay needed');
      return {
        success: true,
        decayApplied: false,
      };
    }

    // Apply decay to each affected domain
    console.log(`📉 Applying decay to ${domainsToDecay.length} domain(s)`);

    for (const skill of domainsToDecay) {
      const decayResult = decayResults.get(skill.domain)!;

      // Calculate new XP based on new level
      // Formula: XP for level N = (N - 1) * 100
      const newXp = (decayResult.newLevel - 1) * 100;

      console.log(
        `  - ${skill.domain}: Level ${skill.level} → ${decayResult.newLevel} (${decayResult.daysInactive} days inactive)`
      );

      // Update the domain skill
      const { error: updateError } = await supabase
        .from('domain_skills')
        .update({
          level: decayResult.newLevel,
          xp: newXp,
          updated_at: new Date().toISOString(),
        })
        .eq('id', skill.id);

      if (updateError) {
        console.error(`❌ Error updating ${skill.domain}:`, updateError);
        // Continue with other domains even if one fails
      }
    }

    // Generate summary message
    const message = getDecaySummaryMessage(domainSkills, decayResults);

    console.log('✅ Skill decay applied successfully');

    return {
      success: true,
      decayApplied: true,
      message: message || undefined,
      decayedDomains: domainsToDecay.map((s) => s.domain),
    };
  } catch (error) {
    console.error('❌ Apply decay exception:', error);
    return {
      success: false,
      decayApplied: false,
      error: String(error),
    };
  }
};

/**
 * Update character mood based on activity
 * Should be called after habit completion or on character load
 *
 * Mood logic:
 * - Sad: 3+ days without activity
 * - Tired: 2 days without activity
 * - Happy: streak >= 7 days and recently active
 * - Neutral: default
 *
 * @param characterId - The character ID to update
 * @returns Success status and new mood
 */
export const updateMood = async (
  characterId: string
): Promise<{
  success: boolean;
  mood?: string;
  reason?: string;
  error?: string;
}> => {
  try {
    console.log('🎭 Updating mood for character:', characterId);

    // Get current character data
    const { data: character, error: fetchError } = await supabase
      .from('characters')
      .select('current_streak, last_activity_date, mood')
      .eq('id', characterId)
      .single();

    if (fetchError || !character) {
      console.error('❌ Error fetching character for mood:', fetchError);
      return { success: false, error: fetchError?.message || 'Character not found' };
    }

    // Calculate new mood
    const moodResult = calculateMood({
      currentStreak: character.current_streak,
      lastActivityDate: character.last_activity_date,
    });

    console.log('📊 Mood calculation:', {
      previous: character.mood,
      new: moodResult.mood,
      reason: moodResult.reason,
    });

    // Only update if mood changed
    if (moodResult.mood === character.mood) {
      console.log('✅ Mood unchanged, skipping update');
      return {
        success: true,
        mood: moodResult.mood,
        reason: moodResult.reason,
      };
    }

    // Update character mood
    const { error: updateError } = await supabase
      .from('characters')
      .update({
        mood: moodResult.mood,
        updated_at: new Date().toISOString(),
      })
      .eq('id', characterId);

    if (updateError) {
      console.error('❌ Error updating mood:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log(`✅ Mood updated: ${character.mood} → ${moodResult.mood} (${moodResult.reason})`);

    return {
      success: true,
      mood: moodResult.mood,
      reason: moodResult.reason,
    };
  } catch (error) {
    console.error('❌ Update mood exception:', error);
    return { success: false, error: String(error) };
  }
};

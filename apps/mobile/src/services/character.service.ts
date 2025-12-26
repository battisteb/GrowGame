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

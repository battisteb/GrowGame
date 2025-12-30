/**
 * Journal Service
 *
 * Handles daily journal entries:
 * - Create journal entries (with optional habit_log link)
 * - Award bonus XP for journal completion
 * - Fetch journal history
 */

import { supabase } from './supabase';
import type { JournalEntry, Mood } from '../types';
import { JOURNAL_XP_REWARD } from '../constants/game';

/**
 * Create a new journal entry
 *
 * @param characterId - The character ID
 * @param entryText - The journal entry text (max 1000 chars)
 * @param habitLogId - Optional habit log ID that prompted this entry
 * @param mood - Optional mood at time of writing
 * @returns Success status, entry, and XP earned
 */
export const createJournalEntry = async ({
  characterId,
  entryText,
  habitLogId = null,
  mood = null,
}: {
  characterId: string;
  entryText: string;
  habitLogId?: string | null;
  mood?: Mood | null;
}): Promise<{
  success: boolean;
  entry?: JournalEntry;
  xpEarned?: number;
  error?: string;
}> => {
  try {
    console.log('📝 Creating journal entry for character:', characterId);

    // Validate entry text
    if (!entryText || entryText.trim().length === 0) {
      return { success: false, error: 'Entry text cannot be empty' };
    }

    if (entryText.length > 1000) {
      return { success: false, error: 'Entry text cannot exceed 1000 characters' };
    }

    // Create journal entry
    const { data: entry, error: createError } = await supabase
      .from('journal_entries')
      .insert({
        character_id: characterId,
        entry_text: entryText.trim(),
        habit_log_id: habitLogId,
        mood: mood,
        xp_earned: JOURNAL_XP_REWARD,
      })
      .select()
      .single();

    if (createError || !entry) {
      console.error('❌ Error creating journal entry:', createError);
      return { success: false, error: createError?.message || 'Failed to create entry' };
    }

    // Award bonus XP to character
    const { error: xpError } = await supabase.rpc('add_character_rewards', {
      p_character_id: characterId,
      p_xp: JOURNAL_XP_REWARD,
      p_coins: 0,
    });

    if (xpError) {
      console.error('❌ Error awarding journal XP:', xpError);
      // Entry was created, but XP wasn't awarded - log but don't fail
    }

    console.log(`✅ Journal entry created (+${JOURNAL_XP_REWARD} XP)`);

    return {
      success: true,
      entry,
      xpEarned: JOURNAL_XP_REWARD,
    };
  } catch (error) {
    console.error('❌ Exception in createJournalEntry:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get journal entries for a character
 *
 * @param characterId - The character ID
 * @param limit - Maximum number of entries to fetch (default 30)
 * @returns Journal entries ordered by creation date (newest first)
 */
export const getJournalEntries = async (
  characterId: string,
  limit: number = 30
): Promise<{
  success: boolean;
  entries?: JournalEntry[];
  error?: string;
}> => {
  try {
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('character_id', characterId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching journal entries:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      entries: entries || [],
    };
  } catch (error) {
    console.error('❌ Exception in getJournalEntries:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get today's journal entries for a character
 *
 * @param characterId - The character ID
 * @returns Today's journal entries
 */
export const getTodayJournalEntries = async (
  characterId: string
): Promise<{
  success: boolean;
  entries?: JournalEntry[];
  error?: string;
}> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('character_id', characterId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching today journal entries:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      entries: entries || [],
    };
  } catch (error) {
    console.error('❌ Exception in getTodayJournalEntries:', error);
    return { success: false, error: String(error) };
  }
};

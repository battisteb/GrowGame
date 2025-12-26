/**
 * Habits Service
 *
 * CRUD operations for habits (habitudes quotidiennes)
 */

import { supabase } from './supabase';
import type { Habit, Domain, Difficulty } from '../types';

// =============================================================================
// GET HABITS
// =============================================================================

/**
 * Get all active habits for a character
 */
export const getHabits = async (
  characterId: string
): Promise<{ success: boolean; habits?: Habit[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('character_id', characterId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching habits:', error);
      return { success: false, error: error.message };
    }

    return { success: true, habits: data || [] };
  } catch (error) {
    console.error('❌ Exception in getHabits:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get a single habit by ID
 */
export const getHabitById = async (
  habitId: string
): Promise<{ success: boolean; habit?: Habit; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (error) {
      console.error('❌ Error fetching habit:', error);
      return { success: false, error: error.message };
    }

    return { success: true, habit: data };
  } catch (error) {
    console.error('❌ Exception in getHabitById:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// CREATE HABIT
// =============================================================================

export interface CreateHabitData {
  character_id: string;
  domain: Domain;
  name: string;
  difficulty: Difficulty;
}

/**
 * Create a new habit
 */
export const createHabit = async (
  data: CreateHabitData
): Promise<{ success: boolean; habit?: Habit; error?: string }> => {
  try {
    const { data: habit, error } = await supabase
      .from('habits')
      .insert({
        character_id: data.character_id,
        domain: data.domain,
        name: data.name,
        difficulty: data.difficulty,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating habit:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Habit created:', habit.name);
    return { success: true, habit };
  } catch (error) {
    console.error('❌ Exception in createHabit:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// UPDATE HABIT
// =============================================================================

export interface UpdateHabitData {
  name?: string;
  difficulty?: Difficulty;
  domain?: Domain;
  is_active?: boolean;
}

/**
 * Update an existing habit
 */
export const updateHabit = async (
  habitId: string,
  data: UpdateHabitData
): Promise<{ success: boolean; habit?: Habit; error?: string }> => {
  try {
    const { data: habit, error } = await supabase
      .from('habits')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', habitId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating habit:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Habit updated:', habit.name);
    return { success: true, habit };
  } catch (error) {
    console.error('❌ Exception in updateHabit:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// DELETE HABIT
// =============================================================================

/**
 * Soft delete a habit (set is_active to false)
 */
export const deleteHabit = async (
  habitId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('habits')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', habitId);

    if (error) {
      console.error('❌ Error deleting habit:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Habit deleted (soft)');
    return { success: true };
  } catch (error) {
    console.error('❌ Exception in deleteHabit:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Permanently delete a habit (hard delete)
 */
export const permanentlyDeleteHabit = async (
  habitId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('habits').delete().eq('id', habitId);

    if (error) {
      console.error('❌ Error permanently deleting habit:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Habit permanently deleted');
    return { success: true };
  } catch (error) {
    console.error('❌ Exception in permanentlyDeleteHabit:', error);
    return { success: false, error: String(error) };
  }
};

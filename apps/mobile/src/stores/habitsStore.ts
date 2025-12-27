/**
 * Habits Store (Zustand)
 *
 * Global state management for habits:
 * - List of habits
 * - CRUD operations
 * - Completion tracking
 * - Loading states
 */

import { create } from 'zustand';
import type { Habit, Domain, Difficulty, HabitLog } from '../types';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  type CreateHabitData,
  type UpdateHabitData,
} from '../services/habits.service';
import {
  getTodayLogsForCharacter,
  completeHabit,
  uncompleteHabit,
} from '../services/habitLogs.service';

interface HabitsState {
  // State
  habits: Habit[];
  todayLogs: Map<string, HabitLog>; // habitId -> log
  isLoading: boolean;
  error: string | null;

  // Actions
  loadHabits: (characterId: string) => Promise<void>;
  loadTodayLogs: (characterId: string) => Promise<void>;
  addHabit: (data: CreateHabitData) => Promise<boolean>;
  editHabit: (habitId: string, data: UpdateHabitData) => Promise<boolean>;
  removeHabit: (habitId: string) => Promise<boolean>;
  toggleHabitCompletion: (habit: Habit, characterId: string) => Promise<boolean>;
  clearHabits: () => void;
  clearError: () => void;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  // Initial state
  habits: [],
  todayLogs: new Map(),
  isLoading: false,
  error: null,

  /**
   * Load all habits for a character
   */
  loadHabits: async (characterId: string) => {
    try {
      set({ isLoading: true, error: null });

      const result = await getHabits(characterId);

      if (!result.success) {
        set({
          isLoading: false,
          error: result.error || 'Failed to load habits',
        });
        return;
      }

      set({
        habits: result.habits || [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ Load habits exception:', error);
      set({
        isLoading: false,
        error: String(error),
      });
    }
  },

  /**
   * Add a new habit
   */
  addHabit: async (data: CreateHabitData) => {
    try {
      set({ isLoading: true, error: null });

      const result = await createHabit(data);

      if (!result.success || !result.habit) {
        set({
          isLoading: false,
          error: result.error || 'Failed to create habit',
        });
        return false;
      }

      // Add the new habit to the list
      set((state) => ({
        habits: [result.habit!, ...state.habits],
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error('❌ Add habit exception:', error);
      set({
        isLoading: false,
        error: String(error),
      });
      return false;
    }
  },

  /**
   * Edit an existing habit
   */
  editHabit: async (habitId: string, data: UpdateHabitData) => {
    try {
      set({ isLoading: true, error: null });

      const result = await updateHabit(habitId, data);

      if (!result.success || !result.habit) {
        set({
          isLoading: false,
          error: result.error || 'Failed to update habit',
        });
        return false;
      }

      // Update the habit in the list
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === habitId ? result.habit! : h
        ),
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error('❌ Edit habit exception:', error);
      set({
        isLoading: false,
        error: String(error),
      });
      return false;
    }
  },

  /**
   * Remove a habit (soft delete)
   */
  removeHabit: async (habitId: string) => {
    try {
      set({ isLoading: true, error: null });

      const result = await deleteHabit(habitId);

      if (!result.success) {
        set({
          isLoading: false,
          error: result.error || 'Failed to delete habit',
        });
        return false;
      }

      // Remove the habit from the list
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== habitId),
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error('❌ Remove habit exception:', error);
      set({
        isLoading: false,
        error: String(error),
      });
      return false;
    }
  },

  /**
   * Load today's completion logs for a character
   */
  loadTodayLogs: async (characterId: string) => {
    try {
      const result = await getTodayLogsForCharacter(characterId);

      if (!result.success) {
        console.error('Failed to load today logs:', result.error);
        return;
      }

      // Build a map of habitId -> log
      const logsMap = new Map<string, HabitLog>();
      (result.logs || []).forEach((log) => {
        console.log('📋 Found log for habit:', log.habit_id, 'completed at:', log.completed_at);
        logsMap.set(log.habit_id, log);
      });

      console.log(`📊 Total logs loaded: ${logsMap.size}`);
      set({ todayLogs: logsMap });
    } catch (error) {
      console.error('❌ Load today logs exception:', error);
    }
  },

  /**
   * Toggle habit completion (complete or uncomplete)
   */
  toggleHabitCompletion: async (habit: Habit, characterId: string) => {
    try {
      const { todayLogs, loadTodayLogs } = get();
      const isCompleted = todayLogs.has(habit.id);

      if (isCompleted) {
        // Uncomplete the habit
        console.log('🔄 Uncompleting habit:', habit.name);
        const result = await uncompleteHabit(habit.id, characterId);

        if (!result.success) {
          console.error('❌ Failed to uncomplete:', result.error);
          set({ error: result.error || 'Failed to uncomplete habit' });
          return false;
        }

        console.log('✅ Habit uncompleted, refreshing logs...');
        // Reload today's logs from database to ensure sync
        await loadTodayLogs(characterId);
      } else {
        // Complete the habit
        console.log('🔄 Completing habit:', habit.name);
        const result = await completeHabit(habit, characterId);

        if (!result.success) {
          console.error('❌ Failed to complete:', result.error);
          set({ error: result.error || 'Failed to complete habit' });
          return false;
        }

        console.log('✅ Habit completed, refreshing logs...');
        // Reload today's logs from database to ensure sync
        await loadTodayLogs(characterId);
      }

      return true;
    } catch (error) {
      console.error('❌ Toggle habit completion exception:', error);
      set({ error: String(error) });
      return false;
    }
  },

  /**
   * Clear all habits (on logout)
   */
  clearHabits: () => {
    set({
      habits: [],
      todayLogs: new Map(),
      isLoading: false,
      error: null,
    });
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },
}));

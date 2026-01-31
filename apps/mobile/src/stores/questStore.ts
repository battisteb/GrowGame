/**
 * Quest Store (Zustand)
 *
 * Global state management for quests:
 * - Daily quests (3 per day, semi-random)
 * - Achievements (permanent progression)
 * - Progress tracking hooks
 * - Reward claiming
 */

import { create } from 'zustand';
import type { DailyQuest, Achievement, Habit, CompletionMode } from '../types';
import {
  getOrGenerateDailyQuests,
  getOrInitAchievements,
  updateDailyQuestProgress,
  updateAchievementProgress,
  claimQuestReward,
  calculateDailyProgress,
  calculateAchievementProgress,
} from '../services/quest.service';
import { ACHIEVEMENT_DEFINITIONS } from '../constants/quests';

interface QuestState {
  // State
  dailyQuests: DailyQuest[];
  achievements: Achievement[];
  isLoading: boolean;
  isClaiming: boolean;
  error: string | null;

  // Actions
  loadDailyQuests: (characterId: string) => Promise<void>;
  loadAchievements: (characterId: string) => Promise<void>;
  claimReward: (
    questId: string,
    characterId: string,
    type: 'daily' | 'achievement'
  ) => Promise<{ success: boolean; xpEarned?: number; coinsEarned?: number }>;

  // Progress update hooks
  onHabitCompleted: (
    characterId: string,
    habit: Habit,
    mode: CompletionMode
  ) => Promise<void>;
  onJournalWritten: (characterId: string) => Promise<void>;
  onCharacterUpdated: (characterId: string) => Promise<void>;

  clearQuests: () => void;
  clearError: () => void;
}

export const useQuestStore = create<QuestState>((set, get) => ({
  // Initial state
  dailyQuests: [],
  achievements: [],
  isLoading: false,
  isClaiming: false,
  error: null,

  /**
   * Load (or generate) today's daily quests
   */
  loadDailyQuests: async (characterId: string) => {
    try {
      set({ isLoading: true, error: null });

      const result = await getOrGenerateDailyQuests(characterId);

      if (!result.success) {
        set({ isLoading: false, error: result.error });
        return;
      }

      set({ dailyQuests: result.quests || [], isLoading: false });
    } catch (error) {
      console.error('❌ Load daily quests exception:', error);
      set({ isLoading: false, error: String(error) });
    }
  },

  /**
   * Load (or initialize) all achievements
   */
  loadAchievements: async (characterId: string) => {
    try {
      const result = await getOrInitAchievements(characterId);

      if (!result.success) {
        console.error('Failed to load achievements:', result.error);
        return;
      }

      set({ achievements: result.achievements || [] });
    } catch (error) {
      console.error('❌ Load achievements exception:', error);
    }
  },

  /**
   * Claim reward for a completed quest
   */
  claimReward: async (questId, characterId, type) => {
    try {
      set({ isClaiming: true });

      const result = await claimQuestReward(questId, characterId, type);

      if (!result.success) {
        set({ isClaiming: false, error: result.error });
        return { success: false };
      }

      // Update local state to reflect claimed status
      if (type === 'daily') {
        set((state) => ({
          dailyQuests: state.dailyQuests.map((q) =>
            q.id === questId ? { ...q, is_claimed: true } : q
          ),
          isClaiming: false,
        }));
      } else {
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === questId ? { ...a, is_claimed: true } : a
          ),
          isClaiming: false,
        }));
      }

      return {
        success: true,
        xpEarned: result.xpEarned,
        coinsEarned: result.coinsEarned,
      };
    } catch (error) {
      console.error('❌ Claim reward exception:', error);
      set({ isClaiming: false, error: String(error) });
      return { success: false };
    }
  },

  /**
   * Hook: Called after a habit is completed
   * Updates daily quest and achievement progress
   */
  onHabitCompleted: async (characterId, habit, mode) => {
    try {
      const { dailyQuests } = get();

      // Update daily quests progress
      for (const quest of dailyQuests) {
        if (quest.is_claimed || quest.completed_at) continue;

        const newProgress = await calculateDailyProgress(
          characterId,
          quest.template_id,
          quest.params
        );

        if (newProgress !== quest.current_progress) {
          await updateDailyQuestProgress(quest.id, newProgress);

          // Update local state
          set((state) => ({
            dailyQuests: state.dailyQuests.map((q) =>
              q.id === quest.id
                ? {
                    ...q,
                    current_progress: newProgress,
                    completed_at:
                      newProgress >= q.target && !q.completed_at
                        ? new Date().toISOString()
                        : q.completed_at,
                  }
                : q
            ),
          }));
        }
      }

      // Update relevant achievements
      const relevantCategories = ['habits', 'domain'];
      if (mode === 'ranked') relevantCategories.push('ranked');

      await get().onCharacterUpdated(characterId);
    } catch (error) {
      console.error('❌ onHabitCompleted quest hook error:', error);
    }
  },

  /**
   * Hook: Called after a journal entry is written
   */
  onJournalWritten: async (characterId) => {
    try {
      const { dailyQuests } = get();

      // Find write_journal daily quest
      const journalQuest = dailyQuests.find(
        (q) => q.template_id === 'write_journal' && !q.is_claimed
      );

      if (journalQuest) {
        const newProgress = await calculateDailyProgress(
          characterId,
          'write_journal',
          {}
        );

        if (newProgress !== journalQuest.current_progress) {
          await updateDailyQuestProgress(journalQuest.id, newProgress);

          set((state) => ({
            dailyQuests: state.dailyQuests.map((q) =>
              q.id === journalQuest.id
                ? {
                    ...q,
                    current_progress: newProgress,
                    completed_at:
                      newProgress >= q.target && !q.completed_at
                        ? new Date().toISOString()
                        : q.completed_at,
                  }
                : q
            ),
          }));
        }
      }
    } catch (error) {
      console.error('❌ onJournalWritten quest hook error:', error);
    }
  },

  /**
   * Hook: Called after character data is refreshed
   * Recalculates all achievement progress from current game state
   */
  onCharacterUpdated: async (characterId) => {
    try {
      const { achievements } = get();

      for (const achievement of achievements) {
        if (achievement.is_claimed) continue;

        const newProgress = await calculateAchievementProgress(
          characterId,
          achievement.achievement_id
        );

        if (newProgress !== achievement.current_progress) {
          await updateAchievementProgress(
            achievement.achievement_id,
            characterId,
            newProgress
          );

          // Update local state
          set((state) => ({
            achievements: state.achievements.map((a) =>
              a.id === achievement.id
                ? {
                    ...a,
                    current_progress: newProgress,
                    completed_at:
                      newProgress >= a.target && !a.completed_at
                        ? new Date().toISOString()
                        : a.completed_at,
                  }
                : a
            ),
          }));
        }
      }
    } catch (error) {
      console.error('❌ onCharacterUpdated quest hook error:', error);
    }
  },

  /**
   * Clear all quest state (on logout)
   */
  clearQuests: () => {
    set({
      dailyQuests: [],
      achievements: [],
      isLoading: false,
      isClaiming: false,
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

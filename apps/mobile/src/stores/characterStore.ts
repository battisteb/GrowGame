/**
 * Character Store (Zustand)
 *
 * Global state management for character data:
 * - Character information (level, XP, coins, gems, mood, streak)
 * - Domain skills (études, sport, méditation, lecture, étirements)
 * - Loading states
 */

import { create } from 'zustand';
import type { Character, DomainSkill } from '../types';
import {
  getCharacterByUserId,
  getDomainSkills,
  applyDecayToAllDomains,
} from '../services/character.service';

interface CharacterState {
  // State
  character: Character | null;
  domainSkills: DomainSkill[];
  isLoading: boolean;
  error: string | null;
  decayMessage: string | null;

  // Actions
  loadCharacter: (userId: string) => Promise<void>;
  refreshCharacter: () => Promise<void>;
  clearCharacter: () => void;
  clearDecayMessage: () => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  // Initial state
  character: null,
  domainSkills: [],
  isLoading: false,
  error: null,
  decayMessage: null,

  /**
   * Load character and domain skills for a user
   */
  loadCharacter: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Load character
      const characterResult = await getCharacterByUserId(userId);

      if (!characterResult.success || !characterResult.character) {
        set({
          isLoading: false,
          error: characterResult.error || 'Failed to load character',
        });
        return;
      }

      // Load domain skills
      const skillsResult = await getDomainSkills(characterResult.character.id);

      if (!skillsResult.success) {
        set({
          character: characterResult.character,
          domainSkills: [],
          isLoading: false,
          error: skillsResult.error || 'Failed to load domain skills',
        });
        return;
      }

      // Check and apply skill decay
      const decayResult = await applyDecayToAllDomains(characterResult.character.id);

      // If decay was applied, reload the skills to get updated values
      if (decayResult.success && decayResult.decayApplied) {
        console.log('📉 Skill decay applied, reloading skills...');
        const refreshedSkillsResult = await getDomainSkills(characterResult.character.id);

        set({
          character: characterResult.character,
          domainSkills: refreshedSkillsResult.skills || [],
          isLoading: false,
          error: null,
          decayMessage: decayResult.message || null,
        });
      } else {
        set({
          character: characterResult.character,
          domainSkills: skillsResult.skills || [],
          isLoading: false,
          error: null,
          decayMessage: null,
        });
      }
    } catch (error) {
      console.error('❌ Load character exception:', error);
      set({
        isLoading: false,
        error: String(error),
      });
    }
  },

  /**
   * Refresh character data (reload from database)
   */
  refreshCharacter: async () => {
    const { character } = get();
    if (!character) {
      console.warn('⚠️ No character to refresh');
      return;
    }

    const userId = character.user_id;
    await get().loadCharacter(userId);
  },

  /**
   * Clear character state (on logout)
   */
  clearCharacter: () => {
    set({
      character: null,
      domainSkills: [],
      isLoading: false,
      error: null,
      decayMessage: null,
    });
  },

  /**
   * Clear decay message after user has seen it
   */
  clearDecayMessage: () => {
    set({ decayMessage: null });
  },
}));

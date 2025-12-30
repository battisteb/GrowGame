/**
 * Character Store (Zustand)
 *
 * Global state management for character data:
 * - Character information (level, XP, coins, gems, mood, streak)
 * - Domain skills (études, sport, méditation, lecture, étirements)
 * - Equipment (equipped cosmetic items)
 * - Loading states
 */

import { create } from 'zustand';
import type { Character, DomainSkill, Equipment, ShopItem, EquipmentSlot } from '../types';
import {
  getCharacterByUserId,
  getDomainSkills,
  applyDecayToAllDomains,
  updateMood,
} from '../services/character.service';
import {
  getEquippedItems,
  equipItem as equipItemService,
  unequipItem as unequipItemService,
} from '../services/equipment.service';

interface CharacterState {
  // State
  character: Character | null;
  domainSkills: DomainSkill[];
  equipment: (Equipment & { shop_item: ShopItem })[];
  isLoading: boolean;
  isLoadingEquipment: boolean;
  error: string | null;
  decayMessage: string | null;

  // Actions
  loadCharacter: (userId: string) => Promise<void>;
  refreshCharacter: () => Promise<void>;
  loadEquipment: (characterId: string) => Promise<void>;
  equipItem: (characterId: string, itemId: string, userId: string) => Promise<boolean>;
  unequipItem: (characterId: string, slot: EquipmentSlot) => Promise<boolean>;
  clearCharacter: () => void;
  clearDecayMessage: () => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  // Initial state
  character: null,
  domainSkills: [],
  equipment: [],
  isLoading: false,
  isLoadingEquipment: false,
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

      // Update character mood based on current activity
      await updateMood(characterResult.character.id);

      // Reload character to get updated mood
      const updatedCharacterResult = await getCharacterByUserId(userId);
      const finalCharacter = updatedCharacterResult.success && updatedCharacterResult.character
        ? updatedCharacterResult.character
        : characterResult.character;

      // If decay was applied, reload the skills to get updated values
      if (decayResult.success && decayResult.decayApplied) {
        console.log('📉 Skill decay applied, reloading skills...');
        const refreshedSkillsResult = await getDomainSkills(characterResult.character.id);

        set({
          character: finalCharacter,
          domainSkills: refreshedSkillsResult.skills || [],
          isLoading: false,
          error: null,
          decayMessage: decayResult.message || null,
        });
      } else {
        set({
          character: finalCharacter,
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
      equipment: [],
      isLoading: false,
      isLoadingEquipment: false,
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

  /**
   * Load equipped items for a character
   */
  loadEquipment: async (characterId: string) => {
    try {
      set({ isLoadingEquipment: true, error: null });

      const result = await getEquippedItems(characterId);

      if (!result.success) {
        set({
          isLoadingEquipment: false,
          error: result.error || 'Failed to load equipment',
        });
        return;
      }

      set({
        equipment: result.equipment || [],
        isLoadingEquipment: false,
      });
    } catch (error) {
      console.error('❌ Exception in loadEquipment:', error);
      set({
        isLoadingEquipment: false,
        error: String(error),
      });
    }
  },

  /**
   * Equip an item to a character
   *
   * @returns true if successful, false otherwise
   */
  equipItem: async (characterId: string, itemId: string, userId: string) => {
    try {
      set({ isLoadingEquipment: true, error: null });

      const result = await equipItemService({
        characterId,
        itemId,
        userId,
      });

      if (!result.success) {
        set({
          isLoadingEquipment: false,
          error: result.error || 'Failed to equip item',
        });
        return false;
      }

      // Reload equipment to reflect the change
      await get().loadEquipment(characterId);

      set({ isLoadingEquipment: false });
      return true;
    } catch (error) {
      console.error('❌ Exception in equipItem:', error);
      set({
        isLoadingEquipment: false,
        error: String(error),
      });
      return false;
    }
  },

  /**
   * Unequip an item from a character slot
   *
   * @returns true if successful, false otherwise
   */
  unequipItem: async (characterId: string, slot: EquipmentSlot) => {
    try {
      set({ isLoadingEquipment: true, error: null });

      const result = await unequipItemService(characterId, slot);

      if (!result.success) {
        set({
          isLoadingEquipment: false,
          error: result.error || 'Failed to unequip item',
        });
        return false;
      }

      // Reload equipment to reflect the change
      await get().loadEquipment(characterId);

      set({ isLoadingEquipment: false });
      return true;
    } catch (error) {
      console.error('❌ Exception in unequipItem:', error);
      set({
        isLoadingEquipment: false,
        error: String(error),
      });
      return false;
    }
  },
}));

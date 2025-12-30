/**
 * Shop Store (Zustand)
 *
 * Global state management for shop:
 * - Shop items catalog
 * - User inventory
 * - Purchase operations
 * - Loading states
 */

import { create } from 'zustand';
import type { ShopItem, UserItem } from '../types';
import {
  getShopItems,
  getUserItems,
  purchaseItem,
} from '../services/shop.service';

interface ShopState {
  // State
  shopItems: ShopItem[];
  userItems: (UserItem & { shop_item: ShopItem })[];
  isLoading: boolean;
  isPurchasing: boolean;
  error: string | null;

  // Actions
  loadShopItems: () => Promise<void>;
  loadUserItems: (userId: string) => Promise<void>;
  buyItem: (userId: string, itemId: string, characterId: string) => Promise<boolean>;
  userOwnsItem: (itemId: string) => boolean;
  clearShop: () => void;
  clearError: () => void;
}

export const useShopStore = create<ShopState>((set, get) => ({
  // Initial state
  shopItems: [],
  userItems: [],
  isLoading: false,
  isPurchasing: false,
  error: null,

  /**
   * Load all available shop items
   */
  loadShopItems: async () => {
    try {
      set({ isLoading: true, error: null });

      const result = await getShopItems();

      if (!result.success) {
        set({
          isLoading: false,
          error: result.error || 'Failed to load shop items',
        });
        return;
      }

      set({
        shopItems: result.items || [],
        isLoading: false,
      });
    } catch (error) {
      console.error('❌ Exception in loadShopItems:', error);
      set({
        isLoading: false,
        error: String(error),
      });
    }
  },

  /**
   * Load user's inventory
   */
  loadUserItems: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      const result = await getUserItems(userId);

      if (!result.success) {
        set({
          isLoading: false,
          error: result.error || 'Failed to load user items',
        });
        return;
      }

      set({
        userItems: result.items || [],
        isLoading: false,
      });
    } catch (error) {
      console.error('❌ Exception in loadUserItems:', error);
      set({
        isLoading: false,
        error: String(error),
      });
    }
  },

  /**
   * Purchase an item from the shop
   *
   * @returns true if purchase successful, false otherwise
   */
  buyItem: async (userId: string, itemId: string, characterId: string) => {
    try {
      set({ isPurchasing: true, error: null });

      const result = await purchaseItem({
        userId,
        itemId,
        characterId,
      });

      if (!result.success) {
        set({
          isPurchasing: false,
          error: result.error || 'Failed to purchase item',
        });
        return false;
      }

      // Reload user items to reflect the purchase
      await get().loadUserItems(userId);

      set({ isPurchasing: false });
      return true;
    } catch (error) {
      console.error('❌ Exception in buyItem:', error);
      set({
        isPurchasing: false,
        error: String(error),
      });
      return false;
    }
  },

  /**
   * Check if user owns a specific item
   */
  userOwnsItem: (itemId: string) => {
    const { userItems } = get();
    return userItems.some((item) => item.itemId === itemId);
  },

  /**
   * Clear all shop data (on logout)
   */
  clearShop: () => {
    set({
      shopItems: [],
      userItems: [],
      isLoading: false,
      isPurchasing: false,
      error: null,
    });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));

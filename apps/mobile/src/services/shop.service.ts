/**
 * Shop Service
 *
 * Handles shop operations:
 * - Fetch available shop items
 * - Purchase items with coins
 * - Manage user inventory
 */

import { supabase } from './supabase';
import type { ShopItem, UserItem } from '../types';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Transform database shop item (snake_case) to TypeScript type (camelCase)
 */
const transformShopItem = (dbItem: any): ShopItem => ({
  id: dbItem.id,
  name: dbItem.name,
  description: dbItem.description,
  type: dbItem.type,
  slot: dbItem.slot,
  priceCoins: dbItem.price_coins,
  priceGems: dbItem.price_gems,
  rarity: dbItem.rarity,
  imageUrl: dbItem.image_url,
  unlockCondition: dbItem.unlock_condition,
});

/**
 * Transform database user item (snake_case) to TypeScript type (camelCase)
 */
const transformUserItem = (dbItem: any): UserItem => ({
  id: dbItem.id,
  userId: dbItem.user_id,
  itemId: dbItem.item_id,
  acquiredAt: dbItem.acquired_at,
});

// =============================================================================
// GET SHOP ITEMS
// =============================================================================

/**
 * Get all available shop items
 *
 * @returns All available items in the shop
 */
export const getShopItems = async (): Promise<{
  success: boolean;
  items?: ShopItem[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_available', true)
      .order('rarity', { ascending: true })
      .order('price_coins', { ascending: true });

    if (error) {
      console.error('❌ Error fetching shop items:', error);
      return { success: false, error: error.message };
    }

    // Transform database results to TypeScript types
    const items = (data || []).map(transformShopItem);

    return { success: true, items };
  } catch (error) {
    console.error('❌ Exception in getShopItems:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Get shop items filtered by type
 *
 * @param type - Item type to filter ('cosmetic', 'decoration', 'joker')
 * @returns Filtered shop items
 */
export const getShopItemsByType = async (
  type: 'cosmetic' | 'decoration' | 'joker'
): Promise<{
  success: boolean;
  items?: ShopItem[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_available', true)
      .eq('type', type)
      .order('rarity', { ascending: true })
      .order('price_coins', { ascending: true });

    if (error) {
      console.error('❌ Error fetching shop items by type:', error);
      return { success: false, error: error.message };
    }

    // Transform database results to TypeScript types
    const items = (data || []).map(transformShopItem);

    return { success: true, items };
  } catch (error) {
    console.error('❌ Exception in getShopItemsByType:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// USER INVENTORY
// =============================================================================

/**
 * Get user's inventory (all purchased items)
 *
 * @param userId - The user ID
 * @returns User's items with shop item details
 */
export const getUserItems = async (userId: string): Promise<{
  success: boolean;
  items?: (UserItem & { shop_item: ShopItem })[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('user_items')
      .select(`
        *,
        shop_item:shop_items(*)
      `)
      .eq('user_id', userId)
      .order('acquired_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user items:', error);
      return { success: false, error: error.message };
    }

    // Transform database results to TypeScript types
    const items = (data || []).map((dbItem: any) => ({
      ...transformUserItem(dbItem),
      shop_item: transformShopItem(dbItem.shop_item),
    }));

    return { success: true, items };
  } catch (error) {
    console.error('❌ Exception in getUserItems:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Check if user owns a specific item
 *
 * @param userId - The user ID
 * @param itemId - The shop item ID
 * @returns Whether the user owns the item
 */
export const userOwnsItem = async (
  userId: string,
  itemId: string
): Promise<{
  success: boolean;
  owns?: boolean;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('user_items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .maybeSingle();

    if (error) {
      console.error('❌ Error checking item ownership:', error);
      return { success: false, error: error.message };
    }

    return { success: true, owns: !!data };
  } catch (error) {
    console.error('❌ Exception in userOwnsItem:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// PURCHASE ITEM
// =============================================================================

/**
 * Purchase an item from the shop
 *
 * @param userId - The user ID
 * @param itemId - The shop item ID
 * @param characterId - The character ID
 * @returns Success status, purchased item, and new coin balance
 */
export const purchaseItem = async ({
  userId,
  itemId,
  characterId,
}: {
  userId: string;
  itemId: string;
  characterId: string;
}): Promise<{
  success: boolean;
  item?: UserItem;
  newCoins?: number;
  error?: string;
}> => {
  try {
    console.log('🛒 Purchasing item:', { userId, itemId, characterId });

    // 1. Get item details and price
    const { data: dbShopItem, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .eq('is_available', true)
      .single();

    if (itemError || !dbShopItem) {
      console.error('❌ Item not found or not available:', itemError);
      return { success: false, error: 'Item not found or not available' };
    }

    // Transform to TypeScript type
    const shopItem = transformShopItem(dbShopItem);

    // 2. Check if user already owns the item
    const ownsCheck = await userOwnsItem(userId, itemId);
    if (!ownsCheck.success) {
      return { success: false, error: ownsCheck.error };
    }
    if (ownsCheck.owns) {
      return { success: false, error: 'You already own this item' };
    }

    // 3. Get character's current coins
    const { data: character, error: charError } = await supabase
      .from('characters')
      .select('coins')
      .eq('id', characterId)
      .eq('user_id', userId)
      .single();

    if (charError || !character) {
      console.error('❌ Character not found:', charError);
      return { success: false, error: 'Character not found' };
    }

    // 4. Check if user has enough coins
    const price = shopItem.priceCoins;
    if (character.coins < price) {
      return {
        success: false,
        error: `Not enough coins. Need ${price}, have ${character.coins}`,
      };
    }

    // 5. Deduct coins from character
    const newCoins = character.coins - price;
    const { error: updateError } = await supabase
      .from('characters')
      .update({ coins: newCoins })
      .eq('id', characterId);

    if (updateError) {
      console.error('❌ Error updating character coins:', updateError);
      return { success: false, error: 'Failed to deduct coins' };
    }

    // 6. Add item to user_items
    const { data: userItem, error: addItemError } = await supabase
      .from('user_items')
      .insert({
        user_id: userId,
        item_id: itemId,
      })
      .select()
      .single();

    if (addItemError || !userItem) {
      console.error('❌ Error adding item to inventory:', addItemError);
      // Try to refund coins
      await supabase
        .from('characters')
        .update({ coins: character.coins })
        .eq('id', characterId);
      return { success: false, error: 'Failed to add item to inventory' };
    }

    console.log(`✅ Item purchased: ${shopItem.name} (-${price} coins)`);

    return {
      success: true,
      item: userItem,
      newCoins,
    };
  } catch (error) {
    console.error('❌ Exception in purchaseItem:', error);
    return { success: false, error: String(error) };
  }
};

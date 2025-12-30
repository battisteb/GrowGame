/**
 * Equipment Service
 *
 * Handles equipment operations:
 * - Fetch equipped items
 * - Equip/unequip items
 * - Validate ownership before equipping
 */

import { supabase } from './supabase';
import type { Equipment, ShopItem, EquipmentSlot } from '../types';

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Transform database equipment (snake_case) to TypeScript type (camelCase)
 */
const transformEquipment = (dbEquipment: any): Equipment => ({
  id: dbEquipment.id,
  characterId: dbEquipment.character_id,
  slot: dbEquipment.slot,
  itemId: dbEquipment.item_id,
});

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

// =============================================================================
// GET EQUIPPED ITEMS
// =============================================================================

/**
 * Get all equipped items for a character
 *
 * @param characterId - The character ID
 * @returns Equipped items with shop item details
 */
export const getEquippedItems = async (characterId: string): Promise<{
  success: boolean;
  equipment?: (Equipment & { shop_item: ShopItem })[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('equipments')
      .select(`
        *,
        shop_item:shop_items(*)
      `)
      .eq('character_id', characterId)
      .order('slot', { ascending: true });

    if (error) {
      console.error('❌ Error fetching equipped items:', error);
      return { success: false, error: error.message };
    }

    // Transform database results to TypeScript types
    const equipment = (data || []).map((dbEquip: any) => ({
      ...transformEquipment(dbEquip),
      shop_item: transformShopItem(dbEquip.shop_item),
    }));

    return { success: true, equipment };
  } catch (error) {
    console.error('❌ Exception in getEquippedItems:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// GET AVAILABLE ITEMS FOR SLOT
// =============================================================================

/**
 * Get available items that can be equipped in a specific slot
 *
 * @param userId - The user ID
 * @param slot - The equipment slot
 * @returns Available items for the slot
 */
export const getAvailableItemsForSlot = async (
  userId: string,
  slot: EquipmentSlot
): Promise<{
  success: boolean;
  items?: ShopItem[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('user_items')
      .select(`
        shop_item:shop_items(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error fetching available items for slot:', error);
      return { success: false, error: error.message };
    }

    // Filter for cosmetic items with matching slot
    const items = (data || [])
      .map((item: any) => transformShopItem(item.shop_item))
      .filter((item: ShopItem) => item.type === 'cosmetic' && item.slot === slot);

    return { success: true, items };
  } catch (error) {
    console.error('❌ Exception in getAvailableItemsForSlot:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// EQUIP ITEM
// =============================================================================

/**
 * Equip an item to a character slot
 *
 * @param characterId - The character ID
 * @param itemId - The shop item ID
 * @param userId - The user ID (for ownership validation)
 * @returns Success status
 */
export const equipItem = async ({
  characterId,
  itemId,
  userId,
}: {
  characterId: string;
  itemId: string;
  userId: string;
}): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    console.log('⚙️ Equipping item:', { characterId, itemId, userId });

    // 1. Get item details
    const { data: dbShopItem, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError || !dbShopItem) {
      console.error('❌ Item not found:', itemError);
      return { success: false, error: 'Item not found' };
    }

    const shopItem = transformShopItem(dbShopItem);

    // 2. Validate item is cosmetic with a slot
    if (shopItem.type !== 'cosmetic' || !shopItem.slot) {
      return { success: false, error: 'Item cannot be equipped (not a cosmetic with slot)' };
    }

    // 3. Check if user owns the item
    const { data: userItem, error: ownershipError } = await supabase
      .from('user_items')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .maybeSingle();

    if (ownershipError) {
      console.error('❌ Error checking ownership:', ownershipError);
      return { success: false, error: 'Failed to verify item ownership' };
    }

    if (!userItem) {
      return { success: false, error: 'You do not own this item' };
    }

    // 4. Equip item using upsert (replaces existing item in slot if any)
    const { error: equipError } = await supabase
      .from('equipments')
      .upsert(
        {
          character_id: characterId,
          slot: shopItem.slot,
          item_id: itemId,
        },
        {
          onConflict: 'character_id,slot',
        }
      );

    if (equipError) {
      console.error('❌ Error equipping item:', equipError);
      return { success: false, error: 'Failed to equip item' };
    }

    console.log(`✅ Item equipped: ${shopItem.name} in slot ${shopItem.slot}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Exception in equipItem:', error);
    return { success: false, error: String(error) };
  }
};

// =============================================================================
// UNEQUIP ITEM
// =============================================================================

/**
 * Unequip an item from a character slot
 *
 * @param characterId - The character ID
 * @param slot - The equipment slot to unequip
 * @returns Success status
 */
export const unequipItem = async (
  characterId: string,
  slot: EquipmentSlot
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    console.log('⚙️ Unequipping item:', { characterId, slot });

    const { error } = await supabase
      .from('equipments')
      .delete()
      .eq('character_id', characterId)
      .eq('slot', slot);

    if (error) {
      console.error('❌ Error unequipping item:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Item unequipped from slot ${slot}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Exception in unequipItem:', error);
    return { success: false, error: String(error) };
  }
};

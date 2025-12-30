/**
 * Shop Screen
 *
 * Browse and purchase items with coins:
 * - Cosmetics (character customization)
 * - Decorations (environment items)
 * - Jokers (special power-ups)
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';
import { useCharacterStore } from '../../src/stores/characterStore';
import { useShopStore } from '../../src/stores/shopStore';
import { showAlert, showConfirmAlert } from '../../src/utils/alert';
import type { ShopItem, ItemType } from '../../src/types';

const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const RARITY_LABELS = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

type FilterType = 'all' | ItemType;

export default function ShopScreen() {
  const { user } = useAuthStore();
  const { character, refreshCharacter } = useCharacterStore();
  const {
    shopItems,
    isLoading,
    isPurchasing,
    error,
    loadShopItems,
    loadUserItems,
    buyItem,
    userOwnsItem,
    clearError,
  } = useShopStore();

  const [filter, setFilter] = useState<FilterType>('all');

  // Load shop items and user inventory
  useEffect(() => {
    loadShopItems();
    if (user?.id) {
      loadUserItems(user.id);
    }
  }, [user?.id]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      showAlert('Erreur', error, [
        {
          text: 'OK',
          onPress: () => clearError(),
        },
      ]);
    }
  }, [error]);

  const handlePurchase = (item: ShopItem) => {
    if (!user?.id || !character?.id) return;

    // Check if already owned
    if (userOwnsItem(item.id)) {
      showAlert('Déjà possédé', 'Vous possédez déjà cet item !');
      return;
    }

    // Check if enough coins
    if (character.coins < item.priceCoins) {
      showAlert(
        'Pas assez de coins',
        `Il vous manque ${item.priceCoins - character.coins} coins pour acheter cet item.`
      );
      return;
    }

    // Confirm purchase
    showConfirmAlert(
      'Confirmer l\'achat',
      `Acheter "${item.name}" pour ${item.priceCoins} coins ?`,
      async () => {
        const success = await buyItem(user.id, item.id, character.id);
        if (success) {
          showAlert('Achat réussi !', `Vous avez acheté "${item.name}" !`);
          // Refresh character to update coins display
          refreshCharacter();
        }
      }
    );
  };

  // Filter items based on selected filter
  const filteredItems = shopItems.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // Group items by type for better display
  const groupedItems = {
    cosmetic: filteredItems.filter((item) => item.type === 'cosmetic'),
    decoration: filteredItems.filter((item) => item.type === 'decoration'),
    joker: filteredItems.filter((item) => item.type === 'joker'),
  };

  const renderShopItem = ({ item }: { item: ShopItem }) => {
    const owned = userOwnsItem(item.id);
    const canAfford = character ? character.coins >= item.priceCoins : false;

    return (
      <View style={styles.itemCard}>
        {/* Rarity badge */}
        <View
          style={[
            styles.rarityBadge,
            { backgroundColor: RARITY_COLORS[item.rarity] },
          ]}
        >
          <Text style={styles.rarityText}>{RARITY_LABELS[item.rarity]}</Text>
        </View>

        {/* Item info */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.itemDescription}>{item.description}</Text>
          )}
          {item.slot && (
            <Text style={styles.itemSlot}>Slot: {item.slot}</Text>
          )}
        </View>

        {/* Price and purchase button */}
        <View style={styles.itemFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>💰 {item.priceCoins}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.buyButton,
              owned && styles.ownedButton,
              !canAfford && !owned && styles.disabledButton,
            ]}
            onPress={() => handlePurchase(item)}
            disabled={owned || !canAfford || isPurchasing}
          >
            <Text
              style={[
                styles.buyButtonText,
                owned && styles.ownedButtonText,
              ]}
            >
              {owned ? '✓ Possédé' : canAfford ? 'Acheter' : 'Trop cher'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading && shopItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Chargement de la boutique...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Boutique</Text>
        {character && (
          <View style={styles.coinsDisplay}>
            <Text style={styles.coinsText}>💰 {character.coins}</Text>
          </View>
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >
              Tout ({shopItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'cosmetic' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('cosmetic')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'cosmetic' && styles.filterTabTextActive,
              ]}
            >
              Cosmétiques ({groupedItems.cosmetic.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'decoration' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('decoration')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'decoration' && styles.filterTabTextActive,
              ]}
            >
              Décorations ({groupedItems.decoration.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'joker' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('joker')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'joker' && styles.filterTabTextActive,
              ]}
            >
              Jokers ({groupedItems.joker.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Items grid */}
      <FlatList
        data={filteredItems}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun item disponible</Text>
          </View>
        }
      />

      {/* Loading overlay */}
      {isPurchasing && (
        <View style={styles.purchasingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.purchasingText}>Achat en cours...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  coinsDisplay: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coinsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterTabActive: {
    backgroundColor: '#6366f1',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  gridContent: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemSlot: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  buyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  ownedButton: {
    backgroundColor: '#10b981',
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  ownedButtonText: {
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  purchasingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchasingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

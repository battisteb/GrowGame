import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_ITEMS = [
  { id: '1', name: 'Chapeau de Scholar', price: 100, rarity: 'common', emoji: '🎓' },
  { id: '2', name: 'Cape du Méditant', price: 300, rarity: 'rare', emoji: '🧥' },
  { id: '3', name: 'Bandeau Sportif', price: 150, rarity: 'common', emoji: '🎽' },
  { id: '4', name: 'Lunettes de Lecteur', price: 200, rarity: 'rare', emoji: '👓' },
  { id: '5', name: 'Statue Dorée', price: 700, rarity: 'legendary', emoji: '🏆' },
  { id: '6', name: 'Joker de Streak', price: 500, rarity: 'epic', emoji: '🃏' },
];

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export default function ShopScreen() {
  const userCoins = 142; // TODO: Get from store

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Boutique</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsEmoji}>🪙</Text>
          <Text style={styles.coinsValue}>{userCoins}</Text>
        </View>
      </View>

      <FlatList
        data={MOCK_ITEMS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemCard,
              { borderColor: RARITY_COLORS[item.rarity] || RARITY_COLORS.common },
            ]}
          >
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={[styles.rarityBadge, { color: RARITY_COLORS[item.rarity] }]}>
              {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceEmoji}>🪙</Text>
              <Text
                style={[styles.priceValue, userCoins < item.price && styles.priceInsufficient]}
              >
                {item.price}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinsEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  coinsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  gridContent: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  rarityBadge: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  priceInsufficient: {
    color: '#ef4444',
  },
});

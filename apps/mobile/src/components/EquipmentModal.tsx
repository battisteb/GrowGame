/**
 * Equipment Modal
 *
 * Modal for managing character equipment in a specific slot:
 * - Shows available items for the selected slot
 * - Allows equipping items
 * - Allows unequipping current item
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import type { EquipmentSlot, ShopItem, Equipment } from '../types';
import { getAvailableItemsForSlot } from '../services/equipment.service';
import { RARITY_COLORS } from '../constants/game';

interface EquipmentModalProps {
  visible: boolean;
  slot: EquipmentSlot;
  currentEquipment?: Equipment & { shop_item: ShopItem };
  characterId: string;
  userId: string;
  onClose: () => void;
  onEquip: (itemId: string) => Promise<void>;
  onUnequip: () => Promise<void>;
}

// Slot labels with emojis
const SLOT_LABELS: Record<EquipmentSlot, { name: string; emoji: string }> = {
  couvre_chef: { name: 'Couvre-chef', emoji: '🎩' },
  haut: { name: 'Haut', emoji: '👕' },
  bas: { name: 'Bas', emoji: '👖' },
  chaussures: { name: 'Chaussures', emoji: '👟' },
  accessoire: { name: 'Accessoire', emoji: '✨' },
};

export function EquipmentModal({
  visible,
  slot,
  currentEquipment,
  characterId,
  userId,
  onClose,
  onEquip,
  onUnequip,
}: EquipmentModalProps) {
  const [availableItems, setAvailableItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load available items when modal opens
  useEffect(() => {
    if (visible) {
      loadAvailableItems();
    }
  }, [visible, slot]);

  const loadAvailableItems = async () => {
    setIsLoading(true);
    const result = await getAvailableItemsForSlot(userId, slot);
    if (result.success) {
      setAvailableItems(result.items || []);
    }
    setIsLoading(false);
  };

  const handleEquip = async (itemId: string) => {
    setIsProcessing(true);
    await onEquip(itemId);
    setIsProcessing(false);
    onClose();
  };

  const handleUnequip = async () => {
    setIsProcessing(true);
    await onUnequip();
    setIsProcessing(false);
    onClose();
  };

  const slotLabel = SLOT_LABELS[slot];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {slotLabel.emoji} {slotLabel.name}
            </Text>
            <Text style={styles.subtitle}>
              {currentEquipment
                ? `Équipé: ${currentEquipment.shop_item.name}`
                : 'Aucun équipement'}
            </Text>
          </View>

          {/* Unequip button if something is equipped */}
          {currentEquipment && (
            <TouchableOpacity
              style={styles.unequipButton}
              onPress={handleUnequip}
              disabled={isProcessing}
            >
              <Text style={styles.unequipButtonText}>❌ Retirer l'équipement</Text>
            </TouchableOpacity>
          )}

          {/* Available items list */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : availableItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Aucun item disponible pour ce slot.
              </Text>
              <Text style={styles.emptyHint}>
                Achète des items dans la boutique !
              </Text>
            </View>
          ) : (
            <FlatList
              data={availableItems}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => {
                const isEquipped = currentEquipment?.itemId === item.id;
                const rarityColor = RARITY_COLORS[item.rarity];

                return (
                  <View style={styles.itemCard}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                      <View
                        style={[
                          styles.rarityBadge,
                          { backgroundColor: rarityColor },
                        ]}
                      >
                        <Text style={styles.rarityText}>{item.rarity}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.equipButton,
                        isEquipped && styles.equipButtonDisabled,
                      ]}
                      onPress={() => handleEquip(item.id)}
                      disabled={isProcessing || isEquipped}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.equipButtonText}>
                          {isEquipped ? '✓ Équipé' : 'Équiper'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={isProcessing}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  unequipButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  unequipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  list: {
    maxHeight: 400,
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  equipButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  equipButtonDisabled: {
    backgroundColor: '#10b981',
  },
  equipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});

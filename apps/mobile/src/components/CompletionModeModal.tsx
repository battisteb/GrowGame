/**
 * Completion Mode Modal
 *
 * Modal to choose between Normal and Ranked completion modes
 * - Normal: Standard completion (existing flow)
 * - Ranked: Photo verification required for competitive ranking
 */

import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import type { CompletionMode } from '../types';

interface CompletionModeModalProps {
  visible: boolean;
  habitName: string;
  onSelectMode: (mode: CompletionMode) => void;
  onCancel: () => void;
}

export function CompletionModeModal({
  visible,
  habitName,
  onSelectMode,
  onCancel,
}: CompletionModeModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Mode de completion</Text>
            <Text style={styles.subtitle}>
              Comment veux-tu compléter : {habitName} ?
            </Text>
          </View>

          {/* Mode Options */}
          <View style={styles.options}>
            {/* Normal Mode */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => onSelectMode('normal')}
            >
              <Text style={styles.optionEmoji}>✅</Text>
              <Text style={styles.optionTitle}>Mode Normal</Text>
              <Text style={styles.optionDescription}>
                Complétion standard sans vérification
              </Text>
              <View style={styles.optionReward}>
                <Text style={styles.rewardText}>XP normal</Text>
              </View>
            </TouchableOpacity>

            {/* Ranked Mode */}
            <TouchableOpacity
              style={[styles.optionCard, styles.rankedCard]}
              onPress={() => onSelectMode('ranked')}
            >
              <Text style={styles.optionEmoji}>🏆</Text>
              <Text style={styles.optionTitle}>Mode Ranked</Text>
              <Text style={styles.optionDescription}>
                Photo requise + vérification IA pour le classement compétitif
              </Text>
              <View style={styles.rankedReward}>
                <Text style={styles.rankedRewardText}>XP ×1.5</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  options: {
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  rankedCard: {
    borderColor: '#fbbf24',
    backgroundColor: '#fffbeb',
  },
  optionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  optionReward: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
  },
  rankedReward: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rankedRewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});

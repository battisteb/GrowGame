/**
 * Quest Reward Modal
 *
 * Celebration modal shown after claiming a quest reward.
 * Displays XP and coins earned.
 */

import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

interface QuestRewardModalProps {
  visible: boolean;
  xpEarned: number;
  coinsEarned: number;
  onClose: () => void;
}

export function QuestRewardModal({
  visible,
  xpEarned,
  coinsEarned,
  onClose,
}: QuestRewardModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.title}>Recompense reclamee !</Text>

          <View style={styles.rewardsContainer}>
            {xpEarned > 0 && (
              <View style={styles.rewardRow}>
                <Text style={styles.rewardEmoji}>⭐</Text>
                <Text style={styles.rewardValue}>+{xpEarned} XP</Text>
              </View>
            )}
            {coinsEarned > 0 && (
              <View style={styles.rewardRow}>
                <Text style={styles.rewardEmoji}>🪙</Text>
                <Text style={styles.rewardValue}>+{coinsEarned} coins</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Super !</Text>
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
    padding: 32,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  rewardsContainer: {
    gap: 12,
    marginBottom: 28,
    width: '100%',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 10,
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
});

/**
 * Quest Card Component
 *
 * Reusable card for daily quests and achievements:
 * - Progress bar (current/target)
 * - Claim button when completed
 * - Visual states: in progress, completed (gold border), claimed (greyed)
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getDailyQuestTemplate, getAchievementDefinition } from '../constants/quests';

interface QuestCardProps {
  type: 'daily' | 'achievement';
  templateId: string;
  params?: Record<string, unknown>;
  currentProgress: number;
  target: number;
  rewardXp: number;
  rewardCoins: number;
  isClaimed: boolean;
  isCompleted: boolean;
  onClaim: () => void;
  isClaimLoading?: boolean;
}

export function QuestCard({
  type,
  templateId,
  params,
  currentProgress,
  target,
  rewardXp,
  rewardCoins,
  isClaimed,
  isCompleted,
  onClaim,
  isClaimLoading,
}: QuestCardProps) {
  // Get display info from template/definition
  const displayInfo = getDisplayInfo(type, templateId, params);
  const progress = Math.min(currentProgress / target, 1);
  const canClaim = isCompleted && !isClaimed;

  return (
    <View
      style={[
        styles.card,
        isCompleted && !isClaimed && styles.cardCompleted,
        isClaimed && styles.cardClaimed,
      ]}
    >
      <View style={styles.content}>
        {/* Icon + Title */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{displayInfo.emoji}</Text>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, isClaimed && styles.titleClaimed]}>
              {displayInfo.title}
            </Text>
            <Text style={[styles.description, isClaimed && styles.descriptionClaimed]}>
              {displayInfo.description}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` },
                isCompleted && styles.progressFillCompleted,
                isClaimed && styles.progressFillClaimed,
              ]}
            />
          </View>
          <Text style={[styles.progressText, isClaimed && styles.progressTextClaimed]}>
            {currentProgress}/{target}
          </Text>
        </View>

        {/* Rewards + Claim */}
        <View style={styles.footer}>
          <View style={styles.rewards}>
            <Text style={[styles.rewardBadge, isClaimed && styles.rewardBadgeClaimed]}>
              +{rewardXp} XP
            </Text>
            <Text style={[styles.rewardBadge, styles.coinBadge, isClaimed && styles.rewardBadgeClaimed]}>
              +{rewardCoins} coins
            </Text>
          </View>

          {isClaimed ? (
            <View style={styles.claimedBadge}>
              <Text style={styles.claimedText}>Reclamee</Text>
            </View>
          ) : canClaim ? (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={onClaim}
              disabled={isClaimLoading}
            >
              <Text style={styles.claimButtonText}>
                {isClaimLoading ? '...' : 'Reclamer'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function getDisplayInfo(
  type: 'daily' | 'achievement',
  templateId: string,
  params?: Record<string, unknown>
): { emoji: string; title: string; description: string } {
  if (type === 'daily') {
    const template = getDailyQuestTemplate(templateId);
    if (template) {
      return {
        emoji: template.emoji,
        title: template.titleFn(params || {}),
        description: template.descriptionFn(params || {}),
      };
    }
  } else {
    const def = getAchievementDefinition(templateId);
    if (def) {
      return {
        emoji: def.emoji,
        title: def.title,
        description: def.description,
      };
    }
  }

  return { emoji: '?', title: 'Quete inconnue', description: '' };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardCompleted: {
    borderColor: '#fbbf24',
    backgroundColor: '#fffbeb',
  },
  cardClaimed: {
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    opacity: 0.7,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 28,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  titleClaimed: {
    color: '#9ca3af',
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
  },
  descriptionClaimed: {
    color: '#d1d5db',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  progressFillCompleted: {
    backgroundColor: '#22c55e',
  },
  progressFillClaimed: {
    backgroundColor: '#9ca3af',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    minWidth: 40,
    textAlign: 'right',
  },
  progressTextClaimed: {
    color: '#9ca3af',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewards: {
    flexDirection: 'row',
    gap: 8,
  },
  rewardBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '600',
    color: '#4f46e5',
    overflow: 'hidden',
  },
  coinBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  rewardBadgeClaimed: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  claimButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  claimButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  claimedBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  claimedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
});

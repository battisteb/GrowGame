/**
 * Quests Tab Screen
 *
 * Displays daily quests and achievements with:
 * - Segment control: Quotidiennes | Succes
 * - Quest cards with progress and claim
 * - Achievement grouping by category
 */

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuestStore } from '../../src/stores/questStore';
import { useCharacterStore } from '../../src/stores/characterStore';
import { QuestCard } from '../../src/components/QuestCard';
import { QuestRewardModal } from '../../src/components/QuestRewardModal';
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  type AchievementCategory,
} from '../../src/constants/quests';

type TabKey = 'daily' | 'achievements';

export default function QuestsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('daily');
  const [rewardModal, setRewardModal] = useState<{
    visible: boolean;
    xp: number;
    coins: number;
  }>({ visible: false, xp: 0, coins: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const character = useCharacterStore((s) => s.character);
  const {
    dailyQuests,
    achievements,
    isLoading,
    isClaiming,
    loadDailyQuests,
    loadAchievements,
    claimReward,
  } = useQuestStore();

  // Load quests on mount
  useEffect(() => {
    if (character?.id) {
      loadDailyQuests(character.id);
      loadAchievements(character.id);
    }
  }, [character?.id]);

  const handleRefresh = useCallback(async () => {
    if (!character?.id) return;
    setRefreshing(true);
    await Promise.all([
      loadDailyQuests(character.id),
      loadAchievements(character.id),
    ]);
    setRefreshing(false);
  }, [character?.id]);

  const handleClaim = async (
    questId: string,
    type: 'daily' | 'achievement'
  ) => {
    if (!character?.id) return;

    const result = await claimReward(questId, character.id, type);
    if (result.success && result.xpEarned !== undefined) {
      setRewardModal({
        visible: true,
        xp: result.xpEarned || 0,
        coins: result.coinsEarned || 0,
      });
    }
  };

  // Group achievements by category
  const achievementsByCategory = achievements.reduce(
    (acc, a) => {
      // Find category from achievement_id
      const categoryMap: Record<string, AchievementCategory> = {
        reach_level_5: 'level',
        reach_level_10: 'level',
        reach_level_25: 'level',
        streak_7: 'streak',
        streak_30: 'streak',
        habits_10: 'habits',
        habits_50: 'habits',
        habits_100: 'habits',
        all_domains_3: 'domain',
        ranked_10: 'ranked',
        coins_100: 'coins',
      };
      const cat = categoryMap[a.achievement_id] || 'habits';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(a);
      return acc;
    },
    {} as Record<AchievementCategory, typeof achievements>
  );

  // Count unclaimed completed quests for badge
  const unclaimedDaily = dailyQuests.filter(
    (q) => q.completed_at && !q.is_claimed
  ).length;
  const unclaimedAchievements = achievements.filter(
    (a) => a.completed_at && !a.is_claimed
  ).length;

  if (!character) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Charge ton personnage d'abord</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Segment Control */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'daily' && styles.segmentActive]}
          onPress={() => setActiveTab('daily')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'daily' && styles.segmentTextActive,
            ]}
          >
            Quotidiennes
            {unclaimedDaily > 0 && (
              <Text style={styles.badge}> ({unclaimedDaily})</Text>
            )}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            activeTab === 'achievements' && styles.segmentActive,
          ]}
          onPress={() => setActiveTab('achievements')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'achievements' && styles.segmentTextActive,
            ]}
          >
            Succes
            {unclaimedAchievements > 0 && (
              <Text style={styles.badge}> ({unclaimedAchievements})</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {activeTab === 'daily' ? (
            <>
              {dailyQuests.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>🎯</Text>
                  <Text style={styles.emptyText}>
                    Aucune quete pour aujourd'hui
                  </Text>
                </View>
              ) : (
                dailyQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    type="daily"
                    templateId={quest.template_id}
                    params={quest.params}
                    currentProgress={quest.current_progress}
                    target={quest.target}
                    rewardXp={quest.reward_xp}
                    rewardCoins={quest.reward_coins}
                    isClaimed={quest.is_claimed}
                    isCompleted={!!quest.completed_at}
                    onClaim={() => handleClaim(quest.id, 'daily')}
                    isClaimLoading={isClaiming}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {achievements.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>🏆</Text>
                  <Text style={styles.emptyText}>
                    Aucun succes disponible
                  </Text>
                </View>
              ) : (
                Object.entries(achievementsByCategory).map(
                  ([category, categoryAchievements]) => (
                    <View key={category} style={styles.categorySection}>
                      <Text style={styles.categoryTitle}>
                        {ACHIEVEMENT_CATEGORY_LABELS[category as AchievementCategory]}
                      </Text>
                      {categoryAchievements.map((achievement) => (
                        <QuestCard
                          key={achievement.id}
                          type="achievement"
                          templateId={achievement.achievement_id}
                          currentProgress={achievement.current_progress}
                          target={achievement.target}
                          rewardXp={achievement.reward_xp}
                          rewardCoins={achievement.reward_coins}
                          isClaimed={achievement.is_claimed}
                          isCompleted={!!achievement.completed_at}
                          onClaim={() =>
                            handleClaim(achievement.id, 'achievement')
                          }
                          isClaimLoading={isClaiming}
                        />
                      ))}
                    </View>
                  )
                )
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Reward Modal */}
      <QuestRewardModal
        visible={rewardModal.visible}
        xpEarned={rewardModal.xp}
        coinsEarned={rewardModal.coins}
        onClose={() => setRewardModal({ visible: false, xp: 0, coins: 0 })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    margin: 16,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  segmentTextActive: {
    color: '#6366f1',
  },
  badge: {
    color: '#ef4444',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 4,
  },
});

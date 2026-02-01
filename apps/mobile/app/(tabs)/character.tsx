import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';
import { useCharacterStore } from '../../src/stores/characterStore';
import { EquipmentModal } from '../../src/components/EquipmentModal';
import { LeaderboardCard } from '../../src/components/LeaderboardCard';
import { getGlobalLeaderboard, getWeeklyLeaderboard, getUserRank } from '../../src/services/leaderboard.service';
import { DOMAIN_INFO, MOOD_EMOJIS, RARITY_COLORS, xpForLevel } from '../../src/constants/game';
import type { EquipmentSlot, Equipment, ShopItem, LeaderboardEntry } from '../../src/types';

// Slot labels with emojis
const SLOT_LABELS: Record<EquipmentSlot, { name: string; emoji: string }> = {
  couvre_chef: { name: 'Couvre-chef', emoji: '🎩' },
  haut: { name: 'Haut', emoji: '👕' },
  bas: { name: 'Bas', emoji: '👖' },
  chaussures: { name: 'Chaussures', emoji: '👟' },
  accessoire: { name: 'Accessoire', emoji: '✨' },
};

const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  'couvre_chef',
  'haut',
  'bas',
  'chaussures',
  'accessoire',
];

export default function CharacterScreen() {
  const { user } = useAuthStore();
  const {
    character,
    domainSkills,
    equipment,
    isLoading,
    isLoadingEquipment,
    loadCharacter,
    loadEquipment,
    equipItem,
    unequipItem,
  } = useCharacterStore();

  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'weekly'>('global');
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ rank?: number; xp?: number } | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Load character and equipment on mount
  useEffect(() => {
    if (user?.id) {
      loadCharacter(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (character?.id) {
      loadEquipment(character.id);
    }
  }, [character?.id]);

  const fetchLeaderboard = useCallback(async (type: 'global' | 'weekly') => {
    if (!character?.id) return;
    setIsLoadingLeaderboard(true);
    const fetchFn = type === 'global' ? getGlobalLeaderboard : getWeeklyLeaderboard;
    const [boardResult, rankResult] = await Promise.all([
      fetchFn(10),
      getUserRank(character.id, type),
    ]);
    if (boardResult.success && boardResult.entries) {
      setLeaderboardEntries(boardResult.entries);
    }
    if (rankResult.success) {
      setUserRank({ rank: rankResult.rank, xp: rankResult.xp });
    }
    setIsLoadingLeaderboard(false);
  }, [character?.id]);

  useEffect(() => {
    fetchLeaderboard(leaderboardTab);
  }, [leaderboardTab, fetchLeaderboard]);

  const handleEquipItem = async (itemId: string) => {
    if (!character?.id || !user?.id) return;
    await equipItem(character.id, itemId, user.id);
  };

  const handleUnequipItem = async () => {
    if (!character?.id || !selectedSlot) return;
    await unequipItem(character.id, selectedSlot);
  };

  // Find equipped item for a slot
  const getEquippedItem = (slot: EquipmentSlot) => {
    return equipment.find((eq) => eq.slot === slot);
  };

  const currentEquippedItem = selectedSlot ? getEquippedItem(selectedSlot) : undefined;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Chargement du personnage...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!character) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Personnage non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const moodEmoji = MOOD_EMOJIS[character.mood] || '😐';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Character Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🧑‍🎓</Text>
          </View>
          <Text style={styles.characterName}>Aventurier</Text>
          <Text style={styles.mood}>
            Humeur: {character.mood} {moodEmoji}
          </Text>
        </View>

        {/* Global Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Statistiques Globales</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{character.global_level}</Text>
              <Text style={styles.statLabel}>Niveau</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{character.global_xp.toLocaleString()}</Text>
              <Text style={styles.statLabel}>XP Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{character.coins}</Text>
              <Text style={styles.statLabel}>Pièces</Text>
            </View>
          </View>
        </View>

        {/* Ranked Stats */}
        <View style={styles.rankedStatsCard}>
          <View style={styles.rankedHeader}>
            <Text style={styles.sectionTitle}>🏆 Statistiques Ranked</Text>
          </View>
          <View style={styles.rankedContent}>
            <View style={styles.rankedLevelContainer}>
              <Text style={styles.rankedLevel}>{character.ranked_level}</Text>
              <Text style={styles.rankedLevelLabel}>Niveau Ranked</Text>
            </View>
            <View style={styles.rankedXpContainer}>
              <View style={styles.rankedXpHeader}>
                <Text style={styles.rankedXpLabel}>Progression Ranked</Text>
                <Text style={styles.rankedXpValue}>{character.ranked_xp.toLocaleString()} XP</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(
                        ((character.ranked_xp % 100) / 100) * 100,
                        100
                      )}%`,
                      backgroundColor: '#fbbf24',
                    },
                  ]}
                />
              </View>
              <Text style={styles.rankedXpHint}>
                💡 Complète des habitudes en mode ranked pour augmenter ton niveau !
              </Text>
            </View>
          </View>
        </View>

        {/* Leaderboard Section */}
        <View style={styles.leaderboardCard}>
          <Text style={styles.sectionTitle}>Classement Ranked</Text>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, leaderboardTab === 'global' && styles.tabActive]}
              onPress={() => setLeaderboardTab('global')}
            >
              <Text style={[styles.tabText, leaderboardTab === 'global' && styles.tabTextActive]}>
                Global
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, leaderboardTab === 'weekly' && styles.tabActive]}
              onPress={() => setLeaderboardTab('weekly')}
            >
              <Text style={[styles.tabText, leaderboardTab === 'weekly' && styles.tabTextActive]}>
                Hebdomadaire
              </Text>
            </TouchableOpacity>
          </View>

          {isLoadingLeaderboard ? (
            <ActivityIndicator size="small" color="#6366f1" style={{ marginVertical: 20 }} />
          ) : leaderboardEntries.length === 0 ? (
            <Text style={styles.emptyLeaderboard}>
              Aucun joueur classé pour le moment.
            </Text>
          ) : (
            <>
              {leaderboardEntries.map((entry) => (
                <LeaderboardCard
                  key={entry.character_id}
                  rank={entry.rank}
                  characterName={entry.character_name}
                  rankedLevel={entry.ranked_level}
                  xp={entry.xp}
                  isCurrentUser={entry.is_current_user}
                />
              ))}
              {userRank?.rank && userRank.rank > 10 && (
                <View style={styles.userRankFooter}>
                  <Text style={styles.userRankText}>
                    Ta position : #{userRank.rank} ({(userRank.xp ?? 0).toLocaleString()} XP)
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Equipment Section */}
        <View style={styles.equipmentCard}>
          <Text style={styles.sectionTitle}>Équipement</Text>
          {isLoadingEquipment ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <View style={styles.equipmentGrid}>
              {EQUIPMENT_SLOTS.map((slot) => {
                const equippedItem = getEquippedItem(slot);
                const slotLabel = SLOT_LABELS[slot];
                const rarityColor = equippedItem
                  ? RARITY_COLORS[equippedItem.shop_item.rarity]
                  : '#e5e7eb';

                return (
                  <View key={slot} style={styles.equipmentSlot}>
                    <View style={styles.slotHeader}>
                      <Text style={styles.slotEmoji}>{slotLabel.emoji}</Text>
                      <Text style={styles.slotName}>{slotLabel.name}</Text>
                    </View>

                    {equippedItem ? (
                      <View style={styles.equippedItemInfo}>
                        <Text style={styles.equippedItemName}>
                          {equippedItem.shop_item.name}
                        </Text>
                        <View
                          style={[
                            styles.rarityBadge,
                            { backgroundColor: rarityColor },
                          ]}
                        >
                          <Text style={styles.rarityText}>
                            {equippedItem.shop_item.rarity}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.emptySlot}>Aucun équipement</Text>
                    )}

                    <TouchableOpacity
                      style={styles.manageButton}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text style={styles.manageButtonText}>Gérer</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Domain Skills */}
        <View style={styles.skillsCard}>
          <Text style={styles.sectionTitle}>Compétences par Domaine</Text>
          {domainSkills.map((skill) => {
            const domainInfo = DOMAIN_INFO[skill.domain];
            const xpAtCurrentLevel = xpForLevel(skill.level);
            const xpAtNextLevel = xpForLevel(skill.level + 1);
            const currentXp = skill.xp - xpAtCurrentLevel;
            const requiredXp = xpAtNextLevel - xpAtCurrentLevel;
            const progress = (currentXp / requiredXp) * 100;

            return (
              <View key={skill.id} style={styles.skillRow}>
                <Text style={styles.skillEmoji}>{domainInfo.emoji}</Text>
                <View style={styles.skillInfo}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{domainInfo.name}</Text>
                    <Text style={styles.skillLevel}>Niv. {skill.level}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progress}%`, backgroundColor: domainInfo.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.xpText}>
                    {currentXp} / {requiredXp} XP
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Equipment Modal */}
      {selectedSlot && character && user && (
        <EquipmentModal
          visible={!!selectedSlot}
          slot={selectedSlot}
          currentEquipment={currentEquippedItem}
          characterId={character.id}
          userId={user.id}
          onClose={() => setSelectedSlot(null)}
          onEquip={handleEquipItem}
          onUnequip={handleUnequipItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 60,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  mood: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  // Ranked stats styles
  rankedStatsCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fbbf24',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankedHeader: {
    marginBottom: 12,
  },
  rankedContent: {
    flexDirection: 'row',
    gap: 16,
  },
  rankedLevelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    minWidth: 100,
  },
  rankedLevel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#92400e',
  },
  rankedLevelLabel: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 4,
    fontWeight: '600',
  },
  rankedXpContainer: {
    flex: 1,
  },
  rankedXpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rankedXpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  rankedXpValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
  },
  rankedXpHint: {
    fontSize: 11,
    color: '#92400e',
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Leaderboard styles
  leaderboardCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  emptyLeaderboard: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    paddingVertical: 20,
  },
  userRankFooter: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  userRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f46e5',
  },
  // Equipment styles
  equipmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  equipmentGrid: {
    gap: 12,
  },
  equipmentSlot: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  slotName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  equippedItemInfo: {
    marginBottom: 8,
  },
  equippedItemName: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  emptySlot: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 8,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  manageButton: {
    backgroundColor: '#6366f1',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Skills styles
  skillsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  skillLevel: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
});

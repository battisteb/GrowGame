/**
 * Statistics Screen
 *
 * Displays habit completion history and statistics:
 * - Summary cards (total completions, XP, streak, avg/day)
 * - 30-day activity heatmap
 * - Domain breakdown
 * - Recent completions list
 */

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCharacterStore } from '../../src/stores/characterStore';
import { DOMAIN_INFO } from '../../src/constants/game';
import {
  getDailyCompletions,
  getDomainStats,
  getStatsSummary,
  getRecentCompletions,
  type DailyCompletionCount,
  type DomainStat,
  type StatsSummary,
} from '../../src/services/statistics.service';
import type { Domain } from '../../src/types';

export default function StatsScreen() {
  const { character } = useCharacterStore();

  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyCompletionCount[]>([]);
  const [domainStats, setDomainStats] = useState<DomainStat[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!character?.id) return;

    const [summaryRes, dailyRes, domainRes, recentRes] = await Promise.all([
      getStatsSummary(character.id),
      getDailyCompletions(character.id, 27), // 4 weeks
      getDomainStats(character.id),
      getRecentCompletions(character.id, 15),
    ]);

    if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
    if (dailyRes.success && dailyRes.data) setDailyData(dailyRes.data);
    if (domainRes.success && domainRes.data) setDomainStats(domainRes.data);
    if (recentRes.success && recentRes.data) setRecentLogs(recentRes.data);

    setIsLoading(false);
    setIsRefreshing(false);
  }, [character?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Chargement des statistiques...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const maxDailyCount = Math.max(...dailyData.map((d) => d.count), 1);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#6366f1" />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary?.totalCompletions ?? 0}</Text>
            <Text style={styles.summaryLabel}>Complétions</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{(summary?.totalXpEarned ?? 0).toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>XP Total</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{character?.current_streak ?? 0}</Text>
            <Text style={styles.summaryLabel}>Streak actuel</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary?.averagePerDay ?? 0}</Text>
            <Text style={styles.summaryLabel}>Moy. / jour</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{character?.longest_streak ?? 0}</Text>
            <Text style={styles.summaryLabel}>Meilleur streak</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary?.rankedCompletions ?? 0}</Text>
            <Text style={styles.summaryLabel}>Ranked</Text>
          </View>
        </View>

        {/* Activity Heatmap (last 28 days) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Activité (4 semaines)</Text>
          <View style={styles.heatmapContainer}>
            {/* Day labels */}
            <View style={styles.heatmapDayLabels}>
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <Text key={i} style={styles.heatmapDayLabel}>{d}</Text>
              ))}
            </View>
            {/* Grid: 4 columns (weeks) x 7 rows (days) */}
            <View style={styles.heatmapGrid}>
              {Array.from({ length: 4 }).map((_, weekIdx) => (
                <View key={weekIdx} style={styles.heatmapColumn}>
                  {Array.from({ length: 7 }).map((_, dayIdx) => {
                    const dataIdx = weekIdx * 7 + dayIdx;
                    const entry = dailyData[dataIdx];
                    const count = entry?.count ?? 0;
                    const intensity = count === 0 ? 0 : Math.min(count / maxDailyCount, 1);
                    return (
                      <View
                        key={dayIdx}
                        style={[
                          styles.heatmapCell,
                          {
                            backgroundColor: count === 0
                              ? '#f3f4f6'
                              : `rgba(99, 102, 241, ${0.2 + intensity * 0.8})`,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
          <View style={styles.heatmapLegend}>
            <Text style={styles.legendText}>Moins</Text>
            {[0, 0.3, 0.6, 1].map((v, i) => (
              <View
                key={i}
                style={[
                  styles.legendCell,
                  {
                    backgroundColor: v === 0
                      ? '#f3f4f6'
                      : `rgba(99, 102, 241, ${0.2 + v * 0.8})`,
                  },
                ]}
              />
            ))}
            <Text style={styles.legendText}>Plus</Text>
          </View>
        </View>

        {/* Domain Breakdown */}
        {domainStats.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Répartition par domaine</Text>
            {domainStats.map((stat) => {
              const info = DOMAIN_INFO[stat.domain as Domain];
              if (!info) return null;
              const maxCompletions = domainStats[0]?.completions || 1;
              const barWidth = Math.max((stat.completions / maxCompletions) * 100, 5);
              return (
                <View key={stat.domain} style={styles.domainRow}>
                  <Text style={styles.domainEmoji}>{info.emoji}</Text>
                  <View style={styles.domainInfo}>
                    <View style={styles.domainHeader}>
                      <Text style={styles.domainName}>{info.name}</Text>
                      <Text style={styles.domainCount}>
                        {stat.completions} ({stat.totalXp} XP)
                      </Text>
                    </View>
                    <View style={styles.domainBarBg}>
                      <View
                        style={[
                          styles.domainBarFill,
                          { width: `${barWidth}%`, backgroundColor: info.color },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Completions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Historique récent</Text>
          {recentLogs.length === 0 ? (
            <Text style={styles.emptyText}>Aucune complétion enregistrée.</Text>
          ) : (
            recentLogs.map((log: any) => {
              const info = DOMAIN_INFO[log.habits.domain as Domain];
              const date = new Date(log.completed_at);
              const dateStr = date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              });
              const timeStr = date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <View key={log.id} style={styles.historyRow}>
                  <Text style={styles.historyEmoji}>{info?.emoji ?? '📋'}</Text>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName} numberOfLines={1}>
                      {log.habits.name}
                    </Text>
                    <Text style={styles.historyDate}>
                      {dateStr} à {timeStr}
                      {log.completion_mode === 'ranked' ? ' 🏆' : ''}
                    </Text>
                  </View>
                  <Text style={styles.historyXp}>+{log.xp_earned} XP</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  // Summary cards
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 14,
  },
  // Heatmap
  heatmapContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  heatmapDayLabels: {
    justifyContent: 'space-around',
    marginRight: 4,
  },
  heatmapDayLabel: {
    fontSize: 10,
    color: '#9ca3af',
    height: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  heatmapGrid: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    gap: 4,
  },
  heatmapColumn: {
    gap: 4,
    flex: 1,
  },
  heatmapCell: {
    height: 20,
    borderRadius: 4,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  legendCell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  // Domain breakdown
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  domainEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  domainInfo: {
    flex: 1,
  },
  domainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  domainName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  domainCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  domainBarBg: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  domainBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  // History
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    paddingVertical: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  historyDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  historyXp: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366f1',
    marginLeft: 8,
  },
});

/**
 * Leaderboard Card Component
 *
 * A single row in the leaderboard displaying:
 * - Rank (with medal emoji for top 3)
 * - Character name
 * - Ranked level
 * - XP earned
 * - Highlighted if current user
 */

import { View, Text, StyleSheet } from 'react-native';

interface LeaderboardCardProps {
  rank: number;
  characterName: string;
  rankedLevel: number;
  xp: number;
  isCurrentUser: boolean;
}

const RANK_EMOJI: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

export function LeaderboardCard({
  rank,
  characterName,
  rankedLevel,
  xp,
  isCurrentUser,
}: LeaderboardCardProps) {
  return (
    <View style={[styles.row, isCurrentUser && styles.rowCurrentUser]}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>
          {RANK_EMOJI[rank] || `#${rank}`}
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <Text
          style={[styles.name, isCurrentUser && styles.nameCurrentUser]}
          numberOfLines={1}
        >
          {characterName}
          {isCurrentUser ? ' (toi)' : ''}
        </Text>
        <Text style={styles.level}>Niv. {rankedLevel}</Text>
      </View>
      <Text style={[styles.xp, isCurrentUser && styles.xpCurrentUser]}>
        {xp.toLocaleString()} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowCurrentUser: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderBottomColor: 'transparent',
    marginVertical: 2,
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  nameCurrentUser: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  level: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  xp: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4b5563',
    marginLeft: 8,
  },
  xpCurrentUser: {
    color: '#4f46e5',
  },
});

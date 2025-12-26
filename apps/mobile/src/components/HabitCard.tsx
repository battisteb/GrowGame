/**
 * Habit Card Component
 *
 * Displays a single habit with domain, name, and difficulty
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Habit } from '../types';
import { DOMAIN_INFO } from '../constants/game';

interface HabitCardProps {
  habit: Habit;
  onPress?: () => void;
  onDelete?: () => void;
}

// Difficulty stars
const DIFFICULTY_STARS: Record<number, string> = {
  1: '⭐',
  2: '⭐⭐',
  3: '⭐⭐⭐',
};

export function HabitCard({ habit, onPress, onDelete }: HabitCardProps) {
  const domainInfo = DOMAIN_INFO[habit.domain];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Domain Badge */}
        <View
          style={[styles.domainBadge, { backgroundColor: domainInfo.color }]}
        >
          <Text style={styles.domainEmoji}>{domainInfo.emoji}</Text>
        </View>

        {/* Habit Info */}
        <View style={styles.info}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <View style={styles.meta}>
            <Text style={styles.domainName}>{domainInfo.name}</Text>
            <Text style={styles.difficulty}>
              {DIFFICULTY_STARS[habit.difficulty]}
            </Text>
          </View>
        </View>

        {/* Delete Button */}
        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  domainBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  domainEmoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  domainName: {
    fontSize: 13,
    color: '#6b7280',
  },
  difficulty: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
});

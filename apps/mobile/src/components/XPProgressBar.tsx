/**
 * XP Progress Bar Component
 *
 * Displays XP progress towards next level
 */

import { View, Text, StyleSheet } from 'react-native';
import { xpForLevel } from '../constants/game';

interface XPProgressBarProps {
  currentLevel: number;
  currentXP: number;
}

export function XPProgressBar({ currentLevel, currentXP }: XPProgressBarProps) {
  // xpForLevel(n) gives cumulative XP to reach level n+1
  // So xpForLevel(1) = 50 XP to go from level 1 to level 2
  const xpNeeded = xpForLevel(currentLevel);
  const xpForCurrentLevel = currentLevel > 1 ? xpForLevel(currentLevel - 1) : 0;
  const xpInThisLevel = currentXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpNeeded - xpForCurrentLevel;
  const progress = Math.min((xpInThisLevel / xpNeededForNextLevel) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {currentXP} / {xpNeeded} XP
        </Text>
        <Text style={styles.nextLevel}>Niveau {currentLevel + 1}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  nextLevel: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  progressBarBackground: {
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
});

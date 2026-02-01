/**
 * XP Progress Bar Component
 *
 * Displays XP progress towards next level
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { xpForLevel } from '../constants/game';

interface XPProgressBarProps {
  currentLevel: number;
  currentXP: number;
}

export function XPProgressBar({ currentLevel, currentXP }: XPProgressBarProps) {
  const xpAtCurrentLevel = xpForLevel(currentLevel);
  const xpAtNextLevel = xpForLevel(currentLevel + 1);
  const xpInThisLevel = Math.max(0, currentXP - xpAtCurrentLevel);
  const xpNeededForNextLevel = xpAtNextLevel - xpAtCurrentLevel;
  const progress = Math.min(Math.max(0, (xpInThisLevel / xpNeededForNextLevel) * 100), 100);

  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {currentXP} / {xpAtNextLevel} XP
        </Text>
        <Text style={styles.nextLevel}>Niveau {currentLevel + 1}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <Animated.View style={[styles.progressBarFill, animatedBarStyle]} />
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

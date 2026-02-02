/**
 * XP Toast Component
 *
 * Floating notification that slides down when XP is earned.
 * Uses an event emitter pattern so it can be triggered from stores/services.
 */

import { useEffect, useState, useCallback } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface ToastData {
  xp: number;
  label?: string;
}

type ToastListener = (data: ToastData) => void;

// Simple event emitter for XP toasts
const listeners: Set<ToastListener> = new Set();

export function showXPToast(xp: number, label?: string) {
  listeners.forEach((fn) => fn({ xp, label }));
}

export function XPToast() {
  const [queue, setQueue] = useState<ToastData[]>([]);
  const [current, setCurrent] = useState<ToastData | null>(null);

  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const processNext = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) {
        setCurrent(null);
        return prev;
      }
      const [next, ...rest] = prev;
      setCurrent(next);
      return rest;
    });
  }, []);

  // Subscribe to toast events
  useEffect(() => {
    const handler: ToastListener = (data) => {
      setQueue((prev) => [...prev, data]);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // Process queue
  useEffect(() => {
    if (!current && queue.length > 0) {
      processNext();
    }
  }, [queue, current, processNext]);

  // Animate when current toast changes
  useEffect(() => {
    if (!current) return;

    // Slide in
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.back(1.2)) });
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSequence(
      withTiming(1.1, { duration: 200, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 150 })
    );

    // Slide out after delay
    const timeout = setTimeout(() => {
      translateY.value = withTiming(-80, { duration: 300, easing: Easing.in(Easing.cubic) });
      opacity.value = withDelay(100, withTiming(0, {
        duration: 200,
      }));
      // Clear current after animation
      setTimeout(() => {
        setCurrent(null);
      }, 400);
    }, 1800);

    return () => clearTimeout(timeout);
  }, [current]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!current) return null;

  const label = current.label || 'XP gagné';

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Text style={styles.emoji}>✨</Text>
      <Text style={styles.text}>
        {label} : +{current.xp} XP
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  emoji: {
    fontSize: 18,
  },
  text: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

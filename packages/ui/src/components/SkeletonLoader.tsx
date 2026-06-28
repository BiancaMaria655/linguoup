import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { radius } from '../tokens/spacing';

export interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = '100%',
  height = 14,
  borderRadius = radius.DEFAULT,
  style,
}: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.bone, { width, height, borderRadius, opacity }, style]}
      accessibilityRole="none"
      aria-hidden
    />
  );
}

/* ─────────── Preset: Card skeleton ─────────── */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <SkeletonLoader width={44} height={44} borderRadius={10} />
        <View style={styles.cardMeta}>
          <SkeletonLoader width="70%" height={13} />
          <SkeletonLoader width="45%" height={11} />
        </View>
      </View>
      <SkeletonLoader width="100%" height={10} />
      <SkeletonLoader width="80%" height={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: colors.border.DEFAULT,
  },
  card: {
    gap: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardMeta: {
    flex: 1,
    gap: 6,
  },
});

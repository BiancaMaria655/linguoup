import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { radius } from '../tokens/spacing';

export interface ProgressBarProps {
  value: number;      // 0–100
  label?: string;
  showValue?: boolean;
  height?: number;
  color?: string;
  trackColor?: string;
}

export function ProgressBar({
  value,
  label,
  showValue = false,
  height = 10,
  color = colors.secondary.DEFAULT,
  trackColor = colors.secondary.light,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: clamped }}>
      {(label || showValue) && (
        <View style={styles.meta}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showValue && <Text style={styles.label}>{Math.round(clamped)}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: radius.full }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: color,
              height,
              borderRadius: radius.full,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: typography.sizes.label,
    color: colors.text.secondary,
  },
  track: {
    overflow: 'hidden',
  },
  fill: {},
});

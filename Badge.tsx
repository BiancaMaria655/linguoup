import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { radius } from '../tokens/spacing';

/* ───────────────────────────── Badge ────────────────────────────── */

export type BadgeVariant = 'xp' | 'streak' | 'level' | 'custom';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  color?: string;
  background?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  xp: { bg: colors.primary.light, text: colors.primary.dark },
  streak: { bg: '#fff3e0', text: '#bf5500' },
  level: { bg: colors.secondary.light, text: colors.secondary.dark },
  custom: { bg: colors.border.DEFAULT, text: colors.text.secondary },
};

export function Badge({ label, variant = 'custom', icon, color, background }: BadgeProps) {
  const scheme = VARIANT_STYLES[variant];
  const bg = background ?? scheme.bg;
  const textColor = color ?? scheme.text;

  return (
    <View
      style={[styles.badge, { backgroundColor: bg }]}
      accessibilityRole="text"
      accessibilityLabel={label}
    >
      {icon && <View style={styles.badgeIcon}>{icon}</View>}
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

/* ─────────────────────────── StreakIcon ─────────────────────────── */

export interface StreakIconProps {
  count: number;
}

export function StreakIcon({ count }: StreakIconProps) {
  return (
    <View style={styles.streak} accessibilityLabel={`Sequência de ${count} dias`} accessibilityRole="text">
      <Text style={styles.streakFlame}>🔥</Text>
      <Text style={styles.streakCount}>{count}</Text>
    </View>
  );
}

/* ────────────────────────────── Styles ──────────────────────────── */

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    gap: 4,
  },
  badgeIcon: {},
  badgeText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: typography.sizes.label,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  streakFlame: {
    fontSize: 20,
  },
  streakCount: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 15,
    color: '#e65100',
  },
});

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, radius } from '../tokens/spacing';

export interface AchievementCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  unlocked?: boolean;
  style?: ViewStyle;
}

export function AchievementCard({
  title,
  subtitle,
  icon,
  unlocked = false,
  style,
}: AchievementCardProps) {
  return (
    <View
      style={[styles.card, !unlocked && styles.locked, style]}
      accessibilityRole="text"
      accessibilityLabel={`${title}${unlocked ? '' : ', bloqueado'}`}
    >
      <View style={[styles.iconWrap, unlocked ? styles.iconUnlocked : styles.iconLocked]}>
        {icon}
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      )}
      {!unlocked && <Text style={styles.lockedBadge}>Bloqueado</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface,
    gap: 6,
    width: 110,
  },
  locked: {
    opacity: 0.45,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnlocked: {
    backgroundColor: '#fff3e0',
  },
  iconLocked: {
    backgroundColor: colors.border.DEFAULT,
  },
  title: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: typography.sizes.label,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: typography.sizes.caption,
    color: colors.text.muted,
    textAlign: 'center',
  },
  lockedBadge: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: typography.sizes.caption,
    color: colors.text.muted,
    marginTop: 2,
  },
});

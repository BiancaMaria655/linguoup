import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  type TouchableOpacityProps,
} from 'react-native';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, radius } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';
import { Badge } from './Badge';

export type LessonLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LessonCardProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  topic: string;
  durationMinutes: number;
  level: LessonLevel;
  icon: React.ReactNode;
  completed?: boolean;
  locked?: boolean;
}

const LEVEL_LABEL: Record<LessonLevel, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

const LEVEL_VARIANT: Record<LessonLevel, 'xp' | 'level' | 'streak'> = {
  beginner: 'xp',
  intermediate: 'level',
  advanced: 'streak',
};

export function LessonCard({
  title,
  topic,
  durationMinutes,
  level,
  icon,
  completed = false,
  locked = false,
  ...rest
}: LessonCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, shadows.sm, locked && styles.locked]}
      activeOpacity={locked ? 1 : 0.82}
      disabled={locked}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${topic}. ${durationMinutes} minutos. Nível ${LEVEL_LABEL[level]}${completed ? '. Concluída' : ''}${locked ? '. Bloqueada' : ''}`}
      {...rest}
    >
      <View style={styles.iconWrap}>{icon}</View>

      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {topic} · {durationMinutes} min
        </Text>
      </View>

      <View style={styles.right}>
        {completed && (
          <View style={styles.completedDot} accessibilityLabel="Concluída" />
        )}
        <Badge label={LEVEL_LABEL[level]} variant={LEVEL_VARIANT[level]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border.DEFAULT,
    minHeight: spacing.touchTarget,
  },
  locked: {
    opacity: 0.5,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: typography.sizes.body,
    color: colors.text.primary,
  },
  sub: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: typography.sizes.label,
    color: colors.text.muted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  completedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary.DEFAULT,
  },
});

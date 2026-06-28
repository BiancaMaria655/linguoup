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

export interface OptionCardProps extends Omit<TouchableOpacityProps, 'style' | 'onPress'> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
}

export function OptionCard({
  label,
  description,
  icon,
  selected = false,
  onPress,
  ...rest
}: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${label}${description ? `. ${description}` : ''}`}
      {...rest}
    >
      {icon && <View style={styles.icon}>{icon}</View>}

      <View style={styles.text}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        {description && (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        )}
      </View>

      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.surface,
    minHeight: spacing.touchTarget,
  },
  selected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.light,
  },
  icon: {
    flexShrink: 0,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: typography.sizes.body,
    color: colors.text.primary,
  },
  labelSelected: {
    color: colors.primary.DEFAULT,
  },
  description: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: typography.sizes.label,
    color: colors.text.muted,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.strong,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.DEFAULT,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});

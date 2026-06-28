import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  type TouchableOpacityProps,
} from 'react-native';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, radius } from '../tokens/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const SIZE_MAP: Record<ButtonSize, { height: number; fontSize: number; px: number }> = {
  sm: { height: 36, fontSize: 13, px: spacing.sm },
  md: { height: 44, fontSize: typography.sizes.body, px: spacing.md },
  lg: { height: 52, fontSize: typography.sizes.bodyLg, px: spacing.lg },
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const dim = SIZE_MAP[size];

  const containerStyle = [
    styles.base,
    { height: dim.height, paddingHorizontal: dim.px, borderRadius: radius.full },
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'ghost' && styles.ghost,
    isDisabled && styles.disabled,
    fullWidth && styles.fullWidth,
  ];

  const textStyle = [
    styles.label,
    { fontSize: dim.fontSize },
    variant === 'primary' && styles.labelPrimary,
    variant === 'secondary' && styles.labelSecondary,
    variant === 'ghost' && styles.labelGhost,
    isDisabled && styles.labelDisabled,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={isDisabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : colors.primary.DEFAULT}
        />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={textStyle}>{label}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  /* Variants */
  primary: {
    backgroundColor: colors.primary.DEFAULT,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  disabled: {
    backgroundColor: colors.border.DEFAULT,
    borderColor: colors.border.DEFAULT,
    opacity: 0.7,
  },
  /* Labels */
  label: {
    fontFamily: 'NunitoSans_700Bold',
    textAlign: 'center',
  },
  labelPrimary: { color: '#fff' },
  labelSecondary: { color: colors.primary.DEFAULT },
  labelGhost: { color: colors.primary.DEFAULT },
  labelDisabled: { color: colors.text.disabled },
  /* Icons */
  iconLeft: { marginRight: 6 },
  iconRight: { marginLeft: 6 },
});

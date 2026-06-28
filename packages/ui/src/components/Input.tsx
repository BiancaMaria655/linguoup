import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, radius } from '../tokens/spacing';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error.DEFAULT
    : focused
      ? colors.primary.DEFAULT
      : colors.border.DEFAULT;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label} accessibilityRole="none">
          {label}
        </Text>
      )}

      <View style={[styles.inputWrap, { borderColor }]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeft : undefined]}
          placeholderTextColor={colors.text.muted}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          accessibilityLabel={label}
          accessibilityHint={hint ?? error}
          {...rest}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  label: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: typography.sizes.label,
    color: colors.text.primary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.DEFAULT,
    backgroundColor: colors.surface,
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: 'NunitoSans_400Regular',
    fontSize: typography.sizes.body,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  inputWithLeft: {
    marginLeft: 8,
  },
  leftIcon: {
    marginRight: 2,
  },
  rightIcon: {
    marginLeft: 4,
  },
  error: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: typography.sizes.label,
    color: colors.error.DEFAULT,
  },
  hint: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: typography.sizes.label,
    color: colors.text.muted,
  },
});

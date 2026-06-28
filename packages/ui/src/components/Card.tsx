import React from 'react';
import { View, StyleSheet, type ViewProps, type ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, radius } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';

export interface CardProps extends ViewProps {
  elevation?: 'sm' | 'md' | 'lg' | 'none';
  style?: ViewStyle;
  children: React.ReactNode;
}

export function Card({ elevation = 'sm', style, children, ...rest }: CardProps) {
  const shadow = elevation !== 'none' ? shadows[elevation] : undefined;

  return (
    <View style={[styles.card, shadow, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border.DEFAULT,
    padding: spacing.cardPadding,
  },
});

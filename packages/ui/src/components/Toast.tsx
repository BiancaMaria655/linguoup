import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, radius } from '../tokens/spacing';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  duration?: number;
  onHide?: () => void;
  style?: ViewStyle;
}

const VARIANT_MAP: Record<ToastVariant, { bg: string; text: string; border: string }> = {
  success: { bg: colors.secondary.light, text: '#004d34', border: '#99d9be' },
  error: { bg: colors.error.light, text: colors.error.DEFAULT, border: '#f5aaa8' },
  info: { bg: colors.primary.light, text: colors.primary.dark, border: '#c4c0e0' },
};

export function Toast({
  message,
  variant = 'success',
  visible,
  duration = 3000,
  onHide,
  style,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const scheme = VARIANT_MAP[variant];

  useEffect(() => {
    if (!visible) return;

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -80,
        duration: 250,
        useNativeDriver: true,
      }).start(() => onHide?.());
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, translateY, onHide]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: scheme.bg, borderColor: scheme.border, transform: [{ translateY }] },
        style,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Text style={[styles.message, { color: scheme.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.screenPadding,
    right: spacing.screenPadding,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.DEFAULT,
    borderWidth: 1,
    zIndex: 999,
  },
  message: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: typography.sizes.body,
    textAlign: 'center',
  },
});

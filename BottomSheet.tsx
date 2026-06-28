import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing, radius } from '../tokens/spacing';
import { shadows } from '../tokens/shadows';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  /** Prevent dismissal by tapping the backdrop */
  persistent?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  persistent = false,
}: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={persistent ? undefined : onClose}
          activeOpacity={1}
          accessibilityLabel="Fechar"
        />
        <Animated.View
          style={[styles.sheet, shadows.sheet, { transform: [{ translateY }] }]}
        >
          <View style={styles.handle} />
          {title && <Text style={styles.title}>{title}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 36,
    borderTopWidth: 0.5,
    borderColor: colors.border.DEFAULT,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.strong,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: typography.sizes.subtitle,
    color: colors.text.primary,
    marginBottom: 6,
  },
  description: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: typography.sizes.body,
    color: colors.text.muted,
    lineHeight: typography.lineHeights.relaxed * typography.sizes.body,
    marginBottom: spacing.md,
  },
});

/**
 * SuccessAnimation Component
 * 
 * Animated success indicator with checkmark icon.
 * Used in AssetSuccessScreen after successfully adding an asset.
 * 
 * Requirements: 3.3
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SuccessAnimationProps {
  title: string;
  message: string;
  testID?: string;
}

const CIRCLE_SIZE = 80;
const ICON_SIZE = 40;

export function SuccessAnimation({ title, message, testID }: SuccessAnimationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate circle scale-in
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    // Animate text fade-in with delay
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <View style={styles.container} testID={testID}>
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: colors.success,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Ionicons
          name="checkmark"
          size={ICON_SIZE}
          color="#FFFFFF"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          { opacity: opacityAnim },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: colors.text },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.message,
            { color: colors.textSecondary },
          ]}
        >
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.fontSizes.base,
    textAlign: 'center',
    lineHeight: Typography.fontSizes.base * Typography.lineHeights.relaxed,
  },
});

export default SuccessAnimation;

/**
 * FloatingAddButton Component
 * 
 * Floating Action Button positioned at the bottom-right of the portfolio screen.
 * Used to navigate to the Add Asset flow.
 * 
 * Requirements: 2.4
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FloatingAddButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
}

const FAB_SIZE = 56;
const ICON_SIZE = 24;

export function FloatingAddButton({ onPress, style, testID }: FloatingAddButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.fabBackground,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityLabel="Add new asset"
        accessibilityHint="Opens the add asset flow to add a new investment to your portfolio"
        accessibilityRole="button"
        testID={testID}
      >
        <Ionicons
          name="add"
          size={ICON_SIZE}
          color={colors.fabIcon}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 96,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
});

export default FloatingAddButton;

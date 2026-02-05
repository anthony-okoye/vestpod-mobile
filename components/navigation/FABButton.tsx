/**
 * FABButton Component
 * 
 * Floating Action Button for the tab bar center position.
 * Used to navigate to the Add Asset flow.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.4
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FABButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
}

const FAB_SIZE = 56;

export function FABButton({ onPress, style, testID }: FABButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: colors.fabBackground,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel="Add new asset"
      accessibilityHint="Opens the add asset flow to add a new investment"
      accessibilityRole="button"
      testID={testID}
    >
      <Ionicons
        name="add"
        size={28}
        color={colors.fabIcon}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
});

export default FABButton;

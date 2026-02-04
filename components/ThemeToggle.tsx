/**
 * ThemeToggle Component
 * 
 * Toggle button for switching between light and dark themes.
 * Displays sun/moon icon based on current theme.
 */

import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing } from '@/constants/theme';

export interface ThemeToggleProps extends Omit<TouchableOpacityProps, 'onPress'> {
  size?: number;
  showBackground?: boolean;
}

export function ThemeToggle({
  size = 24,
  showBackground = true,
  style,
  ...props
}: ThemeToggleProps) {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const rotateAnim = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isDarkMode, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const sunOpacity = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const moonOpacity = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.7}
      style={[
        showBackground && {
          backgroundColor: colors.backgroundSecondary,
          padding: Spacing.sm,
          borderRadius: BorderRadius.full,
        },
        style,
      ]}
      accessibilityLabel={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      accessibilityRole="button"
      {...props}
    >
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <View style={{ width: size, height: size, position: 'relative' }}>
          {/* Sun Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { opacity: sunOpacity },
            ]}
          >
            <SunIcon size={size} color={colors.warning} />
          </Animated.View>
          {/* Moon Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { opacity: moonOpacity },
            ]}
          >
            <MoonIcon size={size} color={colors.info} />
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

interface IconProps {
  size: number;
  color: string;
}

function SunIcon({ size, color }: IconProps) {
  const rayLength = size * 0.15;
  const centerSize = size * 0.4;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      {/* Center circle */}
      <View
        style={{
          position: 'absolute',
          width: centerSize,
          height: centerSize,
          borderRadius: centerSize / 2,
          backgroundColor: color,
          left: center - centerSize / 2,
          top: center - centerSize / 2,
        }}
      />
      {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const rayStart = centerSize / 2 + 2;
        const x = center + Math.cos(rad) * rayStart - 1;
        const y = center + Math.sin(rad) * rayStart - rayLength / 2;
        return (
          <View
            key={angle}
            style={{
              position: 'absolute',
              width: 2,
              height: rayLength,
              backgroundColor: color,
              borderRadius: 1,
              left: x,
              top: y,
              transform: [{ rotate: `${angle + 90}deg` }],
            }}
          />
        );
      })}
    </View>
  );
}

function MoonIcon({ size, color }: IconProps) {
  const moonSize = size * 0.7;
  const cutoutSize = size * 0.5;
  const offset = size * 0.15;

  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <View
        style={{
          position: 'absolute',
          width: moonSize,
          height: moonSize,
          borderRadius: moonSize / 2,
          backgroundColor: color,
          left: offset,
          top: offset,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: cutoutSize,
          height: cutoutSize,
          borderRadius: cutoutSize / 2,
          backgroundColor: 'transparent',
          borderWidth: cutoutSize / 2,
          borderColor: '#151718',
          left: offset + moonSize * 0.35,
          top: offset - cutoutSize * 0.15,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

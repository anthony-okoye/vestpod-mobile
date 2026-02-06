/**
 * AssetTypeCard Component
 * 
 * Displays an asset type with icon, name, and interactive animations.
 * Used in asset selection flows with circular icon backgrounds.
 * 
 * Requirements: Task 7.1
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AssetType = 'stocks' | 'crypto' | 'commodities' | 'real_estate' | 'fixed_income';

interface AssetTypeConfig {
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  iconColor: string;
}

const ASSET_TYPE_CONFIG: Record<AssetType, AssetTypeConfig> = {
  stocks: {
    icon: 'trending-up',
    backgroundColor: '#DBEAFE',
    iconColor: '#1E40AF',
  },
  crypto: {
    icon: 'logo-bitcoin',
    backgroundColor: '#D1FAE5',
    iconColor: '#059669',
  },
  commodities: {
    icon: 'business',
    backgroundColor: '#FEF3C7',
    iconColor: '#D97706',
  },
  real_estate: {
    icon: 'home',
    backgroundColor: '#EDE9FE',
    iconColor: '#7C3AED',
  },
  fixed_income: {
    icon: 'document-text',
    backgroundColor: '#FCE7F3',
    iconColor: '#DB2777',
  },
};

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  stocks: 'Stocks',
  crypto: 'Crypto',
  commodities: 'Commodities',
  real_estate: 'Real Estate',
  fixed_income: 'Fixed Income',
};

interface AssetTypeCardProps {
  assetType: AssetType;
  onPress: (assetType: AssetType) => void;
  style?: ViewStyle;
  testID?: string;
}

const ICON_CONTAINER_SIZE = 64;
const ICON_SIZE = 32;

export function AssetTypeCard({ assetType, onPress, style, testID }: AssetTypeCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const config = ASSET_TYPE_CONFIG[assetType];
  const label = ASSET_TYPE_LABELS[assetType];

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.05,
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

  const handlePress = () => {
    onPress(assetType);
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
          },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityLabel={`${label} asset type`}
        accessibilityHint={`Select ${label} to add this type of asset`}
        accessibilityRole="button"
        testID={testID}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: config.backgroundColor,
            },
          ]}
        >
          <Ionicons
            name={config.icon}
            size={ICON_SIZE}
            color={config.iconColor}
          />
        </View>
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  iconContainer: {
    width: ICON_CONTAINER_SIZE,
    height: ICON_CONTAINER_SIZE,
    borderRadius: ICON_CONTAINER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
    textAlign: 'center',
  },
});

export default AssetTypeCard;

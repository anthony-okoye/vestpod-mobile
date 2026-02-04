/**
 * SkeletonCard Component
 * 
 * Reusable card skeleton with configurable rows
 * Uses ShimmerEffect for animation
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ShimmerEffect } from '../ShimmerEffect';

type SkeletonSize = 'small' | 'medium' | 'large';

interface SkeletonCardProps {
  size?: SkeletonSize;
  rows?: number;
  showAvatar?: boolean;
  style?: ViewStyle;
}

const SIZE_CONFIG = {
  small: {
    padding: 12,
    avatarSize: 32,
    titleHeight: 14,
    rowHeight: 10,
    rowSpacing: 8,
  },
  medium: {
    padding: 16,
    avatarSize: 48,
    titleHeight: 18,
    rowHeight: 12,
    rowSpacing: 10,
  },
  large: {
    padding: 20,
    avatarSize: 64,
    titleHeight: 22,
    rowHeight: 14,
    rowSpacing: 12,
  },
};

export function SkeletonCard({
  size = 'medium',
  rows = 2,
  showAvatar = false,
  style,
}: SkeletonCardProps): React.ReactElement {
  const config = SIZE_CONFIG[size];

  return (
    <View style={[styles.card, { padding: config.padding }, style]}>
      <View style={styles.content}>
        {showAvatar && (
          <ShimmerEffect
            width={config.avatarSize}
            height={config.avatarSize}
            borderRadius={config.avatarSize / 2}
            style={styles.avatar}
          />
        )}
        <View style={styles.textContainer}>
          <ShimmerEffect
            width="60%"
            height={config.titleHeight}
            borderRadius={4}
          />
          {Array.from({ length: rows }).map((_, index) => (
            <ShimmerEffect
              key={index}
              width={index === rows - 1 ? '40%' : '80%'}
              height={config.rowHeight}
              borderRadius={4}
              style={{ marginTop: config.rowSpacing }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
});

export default SkeletonCard;

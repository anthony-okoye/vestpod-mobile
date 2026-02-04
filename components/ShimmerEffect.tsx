/**
 * ShimmerEffect Component
 * 
 * Animated shimmer/shine effect for skeleton loading states
 * Uses react-native-reanimated for smooth 60fps animations
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';

interface ShimmerEffectProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const SHIMMER_DURATION = 1200;

export function ShimmerEffect({
  width,
  height,
  borderRadius = 4,
  style,
}: ShimmerEffectProps): React.ReactElement {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, {
        duration: SHIMMER_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    const shimmerTranslate = interpolate(
      translateX.value,
      [-1, 1],
      [-100, 100]
    );

    return {
      transform: [{ translateX: shimmerTranslate }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-20deg' }],
  },
});

export default ShimmerEffect;

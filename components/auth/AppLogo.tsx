/**
 * AppLogo Component
 * 
 * Renders the Vest Pod logo (upward trending arrow in a circle).
 * Size: 80x80 points with semi-transparent white circular background.
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

export function AppLogo() {
  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel="Vest Pod logo"
      accessibilityRole="image"
    >
      <Image
        source={require('../../assets/images/app-logo.svg')}
        style={styles.logo}
        resizeMode="contain"
        accessible={false} // Parent handles accessibility
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
  },
});

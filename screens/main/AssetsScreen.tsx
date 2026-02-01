/**
 * Assets Screen
 * 
 * Placeholder screen for asset list
 * Will be implemented in Task 46
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MainTabScreenProps } from '@/navigation/types';

type Props = MainTabScreenProps<'Assets'>;

export default function AssetsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assets Screen</Text>
      <Text style={styles.subtitle}>Placeholder - To be implemented in Task 46</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
});

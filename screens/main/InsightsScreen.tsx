/**
 * Insights Screen
 * 
 * Placeholder screen for AI insights (Premium feature)
 * Will be implemented in Task 58
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MainTabScreenProps } from '@/navigation/types';

type Props = MainTabScreenProps<'Insights'>;

export default function InsightsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights Screen</Text>
      <Text style={styles.subtitle}>Placeholder - To be implemented in Task 58</Text>
      <Text style={styles.badge}>Premium Feature</Text>
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
    marginBottom: 8,
  },
  badge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
});

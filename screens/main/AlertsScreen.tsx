/**
 * Alerts Screen
 * 
 * Placeholder screen for alerts list
 * Will be implemented in Task 52
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MainTabScreenProps } from '@/navigation/types';

type Props = MainTabScreenProps<'Alerts'>;

export default function AlertsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alerts Screen</Text>
      <Text style={styles.subtitle}>Placeholder - To be implemented in Task 52</Text>
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

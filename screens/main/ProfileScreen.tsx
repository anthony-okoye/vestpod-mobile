/**
 * Profile Screen
 * 
 * Placeholder screen for user profile
 * Will be implemented in Task 62
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MainTabScreenProps } from '@/navigation/types';

type Props = MainTabScreenProps<'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <Text style={styles.subtitle}>Placeholder - To be implemented in Task 62</Text>
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

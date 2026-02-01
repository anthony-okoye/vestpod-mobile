/**
 * Root Navigator
 * 
 * Top-level navigator that switches between Auth and Main stacks
 * based on authentication state
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

const Stack = createStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isAuthenticated: boolean;
}

export default function RootNavigator({ isAuthenticated }: RootNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

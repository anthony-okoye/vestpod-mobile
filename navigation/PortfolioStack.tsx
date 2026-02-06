/**
 * Portfolio Stack Navigator
 * 
 * Navigation stack for portfolio management:
 * - PortfolioList: Shows all user portfolios
 * - PortfolioDetail: Shows assets within a selected portfolio
 * 
 * Requirements: 8.1, 8.2, 8.3
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PortfolioStackParamList } from './types';
import PortfolioListScreen from '@/screens/main/PortfolioListScreen';
import PortfolioDetailScreen from '@/screens/main/PortfolioDetailScreen';

const Stack = createStackNavigator<PortfolioStackParamList>();

export default function PortfolioStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="PortfolioList" 
        component={PortfolioListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="PortfolioDetail" 
        component={PortfolioDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

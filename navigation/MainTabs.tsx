/**
 * Main Tab Navigator
 * 
 * Handles main app screens with bottom tab navigation:
 * - Dashboard
 * - Portfolio
 * - Assets
 * - Alerts
 * - Insights (Premium)
 * - Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Placeholder screens - will be implemented in later tasks
import DashboardScreen from '@/screens/main/DashboardScreen';
import PortfolioScreen from '@/screens/main/PortfolioScreen';
import AssetsScreen from '@/screens/main/AssetsScreen';
import AlertsScreen from '@/screens/main/AlertsScreen';
import InsightsScreen from '@/screens/main/InsightsScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="chart.line.uptrend.xyaxis" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="briefcase.fill" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Assets"
        component={AssetsScreen}
        options={{
          title: 'Assets',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="list.bullet" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="bell.fill" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="lightbulb.fill" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="person.fill" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

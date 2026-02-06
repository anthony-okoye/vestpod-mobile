/**
 * Add Asset Stack Navigator
 * 
 * Navigation stack for the add asset flow
 * Requirements: 3
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AddAssetStackParamList } from './types';
import AssetTypeSelectionScreen from '@/screens/assets/AssetTypeSelectionScreen';
import TickerSearchScreen from '@/screens/assets/TickerSearchScreen';
import AssetDetailsScreen from '@/screens/assets/AssetDetailsScreen';
import AssetSuccessScreen from '@/screens/assets/AssetSuccessScreen';

const Stack = createStackNavigator<AddAssetStackParamList>();

export default function AddAssetStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="AssetTypeSelection" component={AssetTypeSelectionScreen} />
      <Stack.Screen name="TickerSearch" component={TickerSearchScreen} />
      <Stack.Screen name="AssetDetails" component={AssetDetailsScreen} />
      <Stack.Screen name="AssetSuccess" component={AssetSuccessScreen} />
    </Stack.Navigator>
  );
}

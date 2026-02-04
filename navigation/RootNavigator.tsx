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
import AddAssetStack from './AddAssetStack';
import CreateAlertScreen from '@/screens/alerts/CreateAlertScreen';
import { AIChatScreen } from '@/screens/chat';
import { EditProfileScreen } from '@/screens/profile';

const Stack = createStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isAuthenticated: boolean;
}

export default function RootNavigator({ isAuthenticated }: RootNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="AddAsset"
            component={AddAssetStack}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="CreateAlert"
            component={CreateAlertScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="AIChat"
            component={AIChatScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

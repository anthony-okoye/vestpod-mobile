/**
 * Auth Stack Navigator
 * 
 * Handles authentication flow screens:
 * - Sign In
 * - Sign Up
 * - Password Reset
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';

// Placeholder screens - will be implemented in later tasks
import SignInScreen from '@/screens/auth/SignInScreen';
import SignUpScreen from '@/screens/auth/SignUpScreen';
import PasswordResetScreen from '@/screens/auth/PasswordResetScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen}
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ title: 'Sign Up' }}
      />
      <Stack.Screen 
        name="PasswordReset" 
        component={PasswordResetScreen}
        options={{ title: 'Reset Password' }}
      />
    </Stack.Navigator>
  );
}

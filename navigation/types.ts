/**
 * Navigation Types
 * 
 * Defines TypeScript types for all navigation stacks and screens
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root Stack Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  PasswordReset: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Portfolio: undefined;
  Assets: undefined;
  Alerts: undefined;
  Insights: undefined;
  Profile: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

// Declare global navigation types for TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

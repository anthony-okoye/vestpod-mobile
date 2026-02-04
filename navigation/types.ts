/**
 * Navigation Types
 * 
 * Defines TypeScript types for all navigation stacks and screens
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// Root Stack Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  AddAsset: NavigatorScreenParams<AddAssetStackParamList>;
  AssetDetailView: { assetId: string; portfolioId: string };
  CreateAlert: { preselectedAssetId?: string } | undefined;
  EditProfile: undefined;
  AIChat: undefined;
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

// Add Asset Stack Navigator
export type AddAssetStackParamList = {
  AssetTypeSelection: { portfolioId: string };
  TickerSearch: { portfolioId: string; assetType: string };
  AssetDetails: {
    portfolioId: string;
    assetType: string;
    symbol?: string;
    name?: string;
    currentPrice?: number;
  };
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

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type AddAssetStackScreenProps<T extends keyof AddAssetStackParamList> = CompositeScreenProps<
  StackScreenProps<AddAssetStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

// Declare global navigation types for TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

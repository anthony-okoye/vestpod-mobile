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

// Portfolio Stack Navigator
export type PortfolioStackParamList = {
  PortfolioList: undefined;
  PortfolioDetail: { portfolioId: string; portfolioName: string };
};

// Main Tab Navigator
// Updated: Removed Assets and Alerts tabs per home-screen-redesign requirements
// Assets can be accessed via FAB, Alerts via Profile screen
export type MainTabParamList = {
  Dashboard: undefined;
  Portfolio: NavigatorScreenParams<PortfolioStackParamList>;
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
  AssetSuccess: { assetName?: string; assetType?: string } | undefined;
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

export type PortfolioStackScreenProps<T extends keyof PortfolioStackParamList> = CompositeScreenProps<
  StackScreenProps<PortfolioStackParamList, T>,
  MainTabScreenProps<keyof MainTabParamList>
>;

// Declare global navigation types for TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

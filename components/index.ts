/**
 * Components Index
 * 
 * Central export for reusable components
 */

export { RealtimeStatus } from './RealtimeStatus';
export { PremiumPaywall } from './PremiumPaywall';
export { ShimmerEffect } from './ShimmerEffect';
export { PullToRefreshScrollView, PullToRefreshFlatList } from './PullToRefresh';

// Skeleton components
export {
  SkeletonCard,
  SkeletonChart,
  DashboardSkeleton,
  AssetListSkeleton,
  AssetDetailSkeleton,
  PortfolioListSkeleton,
  InsightsSkeleton,
  AlertsSkeleton,
  ProfileSkeleton,
} from './skeletons';
export { ThemeToggle } from './ThemeToggle';
export { SyncStatusIndicator } from './SyncStatusIndicator';
export type { SyncStatusIndicatorProps } from './SyncStatusIndicator';

// Themed components
export {
  ThemedView,
  ThemedText,
  ThemedCard,
  ThemedButton,
} from './themed';

// Error handling components
export { ErrorBoundary } from './ErrorBoundary';
export type { ErrorBoundaryProps } from './ErrorBoundary';
export { ScreenErrorBoundary } from './ScreenErrorBoundary';
export type { ScreenErrorBoundaryProps } from './ScreenErrorBoundary';
export { ErrorDisplay } from './ErrorDisplay';
export type { ErrorDisplayProps } from './ErrorDisplay';
export { NetworkError } from './NetworkError';
export type { NetworkErrorProps } from './NetworkError';
export { OfflineIndicator } from './OfflineIndicator';

// Auth components
export {
  GradientBackground,
  AppLogo,
  BrandHeader,
  FormCard,
  OAuthButton,
} from './auth';
export type { OAuthButtonProps } from './auth';

// Dashboard components
export {
  DashboardHeader,
  getGreeting,
  formatCurrency,
  getChangeColor,
} from './dashboard';
export type { DashboardHeaderProps } from './dashboard';

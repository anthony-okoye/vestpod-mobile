/**
 * Dashboard Components Index
 * 
 * Central export for dashboard-specific components
 */

export { DashboardHeader, getGreeting, formatCurrency, getChangeColor } from './DashboardHeader';
export type { DashboardHeaderProps } from './DashboardHeader';

export { PerformanceCard, getTrendColor } from './PerformanceCard';
export type { PerformanceCardProps, PerformanceDataPoint, TimePeriod } from './PerformanceCard';

export { AllocationCard, getAssetTypeColor } from './AllocationCard';
export type { AllocationCardProps, AllocationItem } from './AllocationCard';

export { 
  PerformerCard, 
  getPerformerBackgroundColor, 
  getPerformerLabel, 
  getPercentageColor, 
  getTrendIconName, 
  formatPercentage 
} from './PerformerCard';
export type { PerformerCardProps, PerformerType } from './PerformerCard';

export { 
  StatsCard, 
  getStatsBackgroundColor, 
  getStatsLabel, 
  getStatsIconName, 
  formatStatsValue, 
  getRiskLevelText 
} from './StatsCard';
export type { StatsCardProps, StatsType } from './StatsCard';

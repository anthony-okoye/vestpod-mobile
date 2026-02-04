/**
 * PullToRefresh Component
 * 
 * Wrapper component for ScrollView/FlatList with pull-to-refresh functionality
 */

import React, { useState, useCallback, ReactNode } from 'react';
import {
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
  ViewStyle,
  FlatListProps,
  ScrollViewProps,
} from 'react-native';

interface PullToRefreshScrollViewProps extends Omit<ScrollViewProps, 'refreshControl'> {
  onRefresh: () => Promise<void>;
  refreshColor?: string;
  children: ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

interface PullToRefreshFlatListProps<T> extends Omit<FlatListProps<T>, 'refreshControl'> {
  onRefresh: () => Promise<void>;
  refreshColor?: string;
}

export function PullToRefreshScrollView({
  onRefresh,
  refreshColor = '#0a7ea4',
  children,
  style,
  contentContainerStyle,
  ...props
}: PullToRefreshScrollViewProps): React.ReactElement {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={refreshColor}
          colors={[refreshColor]}
        />
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
}

export function PullToRefreshFlatList<T>({
  onRefresh,
  refreshColor = '#0a7ea4',
  ...props
}: PullToRefreshFlatListProps<T>): React.ReactElement {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <FlatList
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={refreshColor}
          colors={[refreshColor]}
        />
      }
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default {
  ScrollView: PullToRefreshScrollView,
  FlatList: PullToRefreshFlatList,
};

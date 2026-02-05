/**
 * PortfolioHeader Component
 * 
 * Sticky header with search input and horizontal filter chips
 * Requirements: 2.1
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface PortfolioHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  filters: string[];
}

export default function PortfolioHeader({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  filters,
}: PortfolioHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Portfolio</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.light.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search assets..."
          placeholderTextColor={Colors.light.inputPlaceholder}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={Colors.light.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((filter) => {
          const isSelected = filter === selectedFilter;
          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                isSelected && styles.filterChipSelected,
              ]}
              onPress={() => onFilterChange(filter)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextSelected,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    color: Colors.light.text,
    padding: 0,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  filtersContainer: {
    paddingRight: Spacing.base,
  },
  filterChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    marginRight: Spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterChipSelected: {
    backgroundColor: Colors.light.buttonPrimary,
    borderColor: Colors.light.buttonPrimary,
  },
  filterChipText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.light.textSecondary,
  },
  filterChipTextSelected: {
    color: Colors.light.buttonPrimaryText,
  },
});

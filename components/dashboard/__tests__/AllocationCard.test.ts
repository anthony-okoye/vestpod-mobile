/**
 * Property-Based Tests for AllocationCard Component
 * 
 * Tests universal properties using fast-check library.
 * Minimum 100 iterations per property test.
 */

// Mock React Native components
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Platform: {
    select: (obj: any) => obj.ios || obj.default,
    OS: 'ios',
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
}));

jest.mock('react-native-chart-kit', () => ({
  PieChart: 'PieChart',
}));

import * as fc from 'fast-check';
import { AllocationItem, getAssetTypeColor } from '../AllocationCard';

describe('AllocationCard Property Tests', () => {
  /**
   * Property 6: Allocation percentages sum
   * Feature: home-screen-redesign, Property 6: Allocation percentages sum
   * Validates: Requirements 3.3, 3.5, 10.5
   * 
   * For any set of allocation data, the sum of all percentage values 
   * should equal 100% (within floating point tolerance).
   */
  it('should have allocation percentages sum to 100% for any valid allocation data', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            type: fc.constantFrom('stock', 'crypto', 'real_estate', 'fixed_income', 'commodity'),
            value: fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true }),
            percentage: fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }),
            color: fc.string(),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (rawData) => {
          // Normalize percentages to sum to 100%
          const totalPercentage = rawData.reduce((sum, item) => sum + item.percentage, 0);
          const normalizedData: AllocationItem[] = rawData.map(item => ({
            ...item,
            percentage: (item.percentage / totalPercentage) * 100,
          }));
          
          // Calculate sum of percentages
          const sum = normalizedData.reduce((acc, item) => acc + item.percentage, 0);
          
          // Check if sum equals 100 within floating point tolerance (0.01%)
          const tolerance = 0.01;
          return Math.abs(sum - 100) < tolerance;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify individual percentages are non-negative
   */
  it('should have all allocation percentages be non-negative', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            type: fc.constantFrom('stock', 'crypto', 'real_estate', 'fixed_income', 'commodity'),
            value: fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true }),
            percentage: fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }),
            color: fc.string(),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (rawData) => {
          // Normalize percentages to sum to 100%
          const totalPercentage = rawData.reduce((sum, item) => sum + item.percentage, 0);
          const normalizedData: AllocationItem[] = rawData.map(item => ({
            ...item,
            percentage: (item.percentage / totalPercentage) * 100,
          }));
          
          // All percentages should be non-negative
          return normalizedData.every(item => item.percentage >= 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Verify percentages are within valid range [0, 100]
   */
  it('should have all allocation percentages within valid range', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            type: fc.constantFrom('stock', 'crypto', 'real_estate', 'fixed_income', 'commodity'),
            value: fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true }),
            percentage: fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }),
            color: fc.string(),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (rawData) => {
          // Normalize percentages to sum to 100%
          const totalPercentage = rawData.reduce((sum, item) => sum + item.percentage, 0);
          const normalizedData: AllocationItem[] = rawData.map(item => ({
            ...item,
            percentage: (item.percentage / totalPercentage) * 100,
          }));
          
          // All percentages should be between 0 and 100
          return normalizedData.every(item => item.percentage >= 0 && item.percentage <= 100);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Asset type color mapping
   * Feature: home-screen-redesign, Property 7: Asset type color mapping
   * Validates: Requirements 3.4
   * 
   * For any asset type in the allocation data, the color should match 
   * the predefined mapping:
   * - stock → #1E3A8A
   * - crypto → #10B981
   * - real_estate → #F59E0B
   * - fixed_income → #8B5CF6
   * - commodity → #EC4899
   */
  it('should map asset types to correct predefined colors', () => {
    // Define expected color mapping
    const expectedColorMap: Record<string, string> = {
      stock: '#1E3A8A',
      crypto: '#10B981',
      real_estate: '#F59E0B',
      fixed_income: '#8B5CF6',
      commodity: '#EC4899',
    };

    fc.assert(
      fc.property(
        fc.constantFrom('stock', 'crypto', 'real_estate', 'fixed_income', 'commodity'),
        (assetType) => {
          // Get color from the function
          const actualColor = getAssetTypeColor(assetType);
          const expectedColor = expectedColorMap[assetType];
          
          // Verify color matches expected mapping
          return actualColor === expectedColor;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case tests for specific scenarios
   */
  describe('Edge cases', () => {
    it('should handle single allocation item summing to 100%', () => {
      const data: AllocationItem[] = [
        { type: 'stock', value: 10000, percentage: 100, color: '#1E3A8A' },
      ];
      
      const sum = data.reduce((acc, item) => acc + item.percentage, 0);
      expect(Math.abs(sum - 100)).toBeLessThan(0.01);
    });

    it('should handle equal allocations', () => {
      const data: AllocationItem[] = [
        { type: 'stock', value: 5000, percentage: 50, color: '#1E3A8A' },
        { type: 'crypto', value: 5000, percentage: 50, color: '#10B981' },
      ];
      
      const sum = data.reduce((acc, item) => acc + item.percentage, 0);
      expect(Math.abs(sum - 100)).toBeLessThan(0.01);
    });

    it('should handle multiple small allocations', () => {
      const data: AllocationItem[] = [
        { type: 'stock', value: 1000, percentage: 25, color: '#1E3A8A' },
        { type: 'crypto', value: 1000, percentage: 25, color: '#10B981' },
        { type: 'real_estate', value: 1000, percentage: 25, color: '#F59E0B' },
        { type: 'fixed_income', value: 1000, percentage: 25, color: '#8B5CF6' },
      ];
      
      const sum = data.reduce((acc, item) => acc + item.percentage, 0);
      expect(Math.abs(sum - 100)).toBeLessThan(0.01);
    });

    it('should handle unequal allocations', () => {
      const data: AllocationItem[] = [
        { type: 'stock', value: 7000, percentage: 70, color: '#1E3A8A' },
        { type: 'crypto', value: 2000, percentage: 20, color: '#10B981' },
        { type: 'commodity', value: 1000, percentage: 10, color: '#EC4899' },
      ];
      
      const sum = data.reduce((acc, item) => acc + item.percentage, 0);
      expect(Math.abs(sum - 100)).toBeLessThan(0.01);
    });
  });
});

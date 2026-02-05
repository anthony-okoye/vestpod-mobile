/**
 * Property-Based Tests for PerformerCard Component
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
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

import * as fc from 'fast-check';
import {
  PerformerType,
  getPerformerLabel,
  getPercentageColor,
  getTrendIconName,
  formatPercentage,
} from '../PerformerCard';

// Mock Colors from theme
const Colors = {
  light: {
    success: '#059669',
    error: '#DC2626',
  },
};

describe('PerformerCard Property Tests', () => {
  /**
   * Property 8: Performer card display
   * Feature: home-screen-redesign, Property 8: Performer card display
   * Validates: Requirements 4.4, 4.5, 4.8, 4.9
   * 
   * For any performer data (best or worst), the card should display:
   * - The asset name
   * - The percentage change with correct sign
   * - Green color and upward icon for positive change
   * - Red color and downward icon for negative change
   */
  it('should display correct color and icon for positive change', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<PerformerType>('best', 'worst'),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.float({ min: 0, max: Math.fround(1000), noNaN: true }),
        (type, assetName, changePercent) => {
          // For positive change (>= 0)
          const color = getPercentageColor(changePercent);
          const icon = getTrendIconName(changePercent);
          const formatted = formatPercentage(changePercent);
          
          // Should be green and upward icon
          const hasCorrectColor = color === Colors.light.success;
          const hasCorrectIcon = icon === 'trending-up';
          const hasCorrectSign = formatted.startsWith('+');
          
          return hasCorrectColor && hasCorrectIcon && hasCorrectSign;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display correct color and icon for negative change', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<PerformerType>('best', 'worst'),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.float({ min: Math.fround(-1000), max: Math.fround(-0.01), noNaN: true }),
        (type, assetName, changePercent) => {
          // For negative change (< 0)
          const color = getPercentageColor(changePercent);
          const icon = getTrendIconName(changePercent);
          const formatted = formatPercentage(changePercent);
          
          // Should be red and downward icon
          const hasCorrectColor = color === Colors.light.error;
          const hasCorrectIcon = icon === 'trending-down';
          const hasNoPositiveSign = !formatted.startsWith('+');
          
          return hasCorrectColor && hasCorrectIcon && hasNoPositiveSign;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display correct label for performer type', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<PerformerType>('best', 'worst'),
        (type) => {
          const label = getPerformerLabel(type);
          
          if (type === 'best') {
            return label === 'Best Performer';
          } else {
            return label === 'Worst Performer';
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format percentage with correct sign and precision', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-1000), max: Math.fround(1000), noNaN: true }),
        (changePercent) => {
          const formatted = formatPercentage(changePercent);
          
          // Should have % symbol
          const hasPercentSymbol = formatted.endsWith('%');
          
          // Should have correct sign
          const hasCorrectSign = changePercent >= 0 
            ? formatted.startsWith('+') 
            : !formatted.startsWith('+');
          
          // Should have 2 decimal places
          const parts = formatted.replace('+', '').replace('%', '').split('.');
          const hasCorrectPrecision = parts.length === 2 && parts[1].length === 2;
          
          return hasPercentSymbol && hasCorrectSign && hasCorrectPrecision;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle zero change correctly', () => {
    const color = getPercentageColor(0);
    const icon = getTrendIconName(0);
    const formatted = formatPercentage(0);
    
    // Zero should be treated as positive (green, upward, with + sign)
    expect(color).toBe(Colors.light.success);
    expect(icon).toBe('trending-up');
    expect(formatted).toBe('+0.00%');
  });

  it('should handle edge cases for percentage formatting', () => {
    // Very small positive
    expect(formatPercentage(0.001)).toBe('+0.00%');
    
    // Very small negative
    expect(formatPercentage(-0.001)).toBe('-0.00%');
    
    // Large positive
    expect(formatPercentage(999.999)).toBe('+1000.00%');
    
    // Large negative
    expect(formatPercentage(-999.999)).toBe('-1000.00%');
  });
});

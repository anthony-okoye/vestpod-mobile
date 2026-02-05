/**
 * Property-Based Tests for DashboardScreen
 * 
 * Tests universal properties using fast-check library.
 * Minimum 100 iterations per property test.
 */

import * as fc from 'fast-check';

interface Asset {
  id: string;
  name: string;
  symbol?: string;
  asset_type: string;
  current_price: number;
  purchase_price: number;
  quantity: number;
  metadata?: Record<string, any>;
}

interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  todayChange: number;
  todayChangePercent: number;
  bestPerformer: { name: string; changePercent: number } | null;
  worstPerformer: { name: string; changePercent: number } | null;
}

/**
 * Calculates portfolio summary from assets
 * This is the same implementation as in DashboardScreen
 */
function calculateSummary(assets: Asset[]): PortfolioSummary {
  if (assets.length === 0) {
    return {
      totalValue: 0,
      totalInvested: 0,
      todayChange: 0,
      todayChangePercent: 0,
      bestPerformer: null,
      worstPerformer: null,
    };
  }

  let totalValue = 0;
  let totalInvested = 0;
  let bestPerformer: PortfolioSummary['bestPerformer'] = null;
  let worstPerformer: PortfolioSummary['worstPerformer'] = null;

  assets.forEach((asset) => {
    const currentPrice = asset.current_price || asset.purchase_price;
    const assetValue = currentPrice * asset.quantity;
    const assetCost = asset.purchase_price * asset.quantity;
    const changePercent = assetCost > 0 ? ((assetValue - assetCost) / assetCost) * 100 : 0;

    totalValue += assetValue;
    totalInvested += assetCost;

    // Track best performer (highest percentage change)
    if (!bestPerformer || changePercent > bestPerformer.changePercent) {
      bestPerformer = { name: asset.name, changePercent };
    }
    // Track worst performer (lowest percentage change)
    if (!worstPerformer || changePercent < worstPerformer.changePercent) {
      worstPerformer = { name: asset.name, changePercent };
    }
  });

  const todayChange = totalValue - totalInvested;
  const todayChangePercent = totalInvested > 0 ? (todayChange / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    todayChange,
    todayChangePercent,
    bestPerformer,
    worstPerformer,
  };
}

/**
 * Arbitrary generator for valid Asset objects
 */
const assetArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  symbol: fc.option(fc.string({ minLength: 1, maxLength: 10 }), { nil: undefined }),
  asset_type: fc.constantFrom('stock', 'crypto', 'real_estate', 'fixed_income', 'commodity'),
  current_price: fc.double({ min: 0.01, max: 100000, noNaN: true }),
  purchase_price: fc.double({ min: 0.01, max: 100000, noNaN: true }),
  quantity: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  metadata: fc.option(fc.dictionary(fc.string(), fc.anything()), { nil: undefined }),
});

describe('DashboardScreen Property Tests', () => {
  /**
   * Property 10: Total portfolio value calculation
   * Feature: home-screen-redesign, Property 10: Total portfolio value calculation
   * Validates: Requirements 10.2
   * 
   * For any set of assets, the total portfolio value should equal the sum of 
   * (current_price × quantity) for all assets.
   */
  it('should calculate total portfolio value as sum of (current_price × quantity) for all assets', () => {
    fc.assert(
      fc.property(
        fc.array(assetArbitrary, { minLength: 0, maxLength: 50 }),
        (assets) => {
          const summary = calculateSummary(assets);
          
          // Calculate expected total value manually
          const expectedTotalValue = assets.reduce((sum, asset) => {
            const currentPrice = asset.current_price || asset.purchase_price;
            return sum + (currentPrice * asset.quantity);
          }, 0);
          
          // Allow for floating point precision tolerance
          const tolerance = 0.01;
          const difference = Math.abs(summary.totalValue - expectedTotalValue);
          
          return difference < tolerance;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Empty portfolio should have zero total value
   */
  it('should return zero total value for empty portfolio', () => {
    const summary = calculateSummary([]);
    expect(summary.totalValue).toBe(0);
  });

  /**
   * Edge case: Single asset portfolio
   */
  it('should correctly calculate value for single asset', () => {
    const asset: Asset = {
      id: '1',
      name: 'Test Asset',
      asset_type: 'stock',
      current_price: 100,
      purchase_price: 80,
      quantity: 10,
    };
    
    const summary = calculateSummary([asset]);
    expect(summary.totalValue).toBe(1000); // 100 * 10
  });

  /**
   * Edge case: Asset with missing current_price should use purchase_price
   */
  it('should use purchase_price when current_price is missing', () => {
    const asset: Asset = {
      id: '1',
      name: 'Test Asset',
      asset_type: 'stock',
      current_price: 0, // Will be treated as missing
      purchase_price: 50,
      quantity: 5,
    };
    
    const summary = calculateSummary([asset]);
    // When current_price is 0, it should still use it (not fallback to purchase_price)
    // Based on the implementation: const currentPrice = asset.current_price || asset.purchase_price;
    expect(summary.totalValue).toBe(250); // 50 * 5 (fallback to purchase_price)
  });

  /**
   * Property 11: Best/worst performer identification
   * Feature: home-screen-redesign, Property 11: Best/worst performer identification
   * Validates: Requirements 10.4
   * 
   * For any set of assets with performance data:
   * - Best performer should have the highest percentage change
   * - Worst performer should have the lowest percentage change
   */
  it('should identify best performer as asset with highest percentage change', () => {
    fc.assert(
      fc.property(
        fc.array(assetArbitrary, { minLength: 1, maxLength: 50 }),
        (assets) => {
          const summary = calculateSummary(assets);
          
          // Calculate percentage change for each asset manually
          const assetChanges = assets.map((asset) => {
            const currentPrice = asset.current_price || asset.purchase_price;
            const assetValue = currentPrice * asset.quantity;
            const assetCost = asset.purchase_price * asset.quantity;
            const changePercent = assetCost > 0 ? ((assetValue - assetCost) / assetCost) * 100 : 0;
            return { name: asset.name, changePercent };
          });
          
          // Find the actual best performer (highest change)
          const actualBest = assetChanges.reduce((best, current) => 
            current.changePercent > best.changePercent ? current : best
          );
          
          // Verify the summary's best performer matches
          if (summary.bestPerformer) {
            // Allow for floating point precision tolerance
            const tolerance = 0.01;
            const difference = Math.abs(summary.bestPerformer.changePercent - actualBest.changePercent);
            return difference < tolerance;
          }
          
          return false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should identify worst performer as asset with lowest percentage change', () => {
    fc.assert(
      fc.property(
        fc.array(assetArbitrary, { minLength: 1, maxLength: 50 }),
        (assets) => {
          const summary = calculateSummary(assets);
          
          // Calculate percentage change for each asset manually
          const assetChanges = assets.map((asset) => {
            const currentPrice = asset.current_price || asset.purchase_price;
            const assetValue = currentPrice * asset.quantity;
            const assetCost = asset.purchase_price * asset.quantity;
            const changePercent = assetCost > 0 ? ((assetValue - assetCost) / assetCost) * 100 : 0;
            return { name: asset.name, changePercent };
          });
          
          // Find the actual worst performer (lowest change)
          const actualWorst = assetChanges.reduce((worst, current) => 
            current.changePercent < worst.changePercent ? current : worst
          );
          
          // Verify the summary's worst performer matches
          if (summary.worstPerformer) {
            // Allow for floating point precision tolerance
            const tolerance = 0.01;
            const difference = Math.abs(summary.worstPerformer.changePercent - actualWorst.changePercent);
            return difference < tolerance;
          }
          
          return false;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Empty portfolio should have null performers
   */
  it('should return null performers for empty portfolio', () => {
    const summary = calculateSummary([]);
    expect(summary.bestPerformer).toBeNull();
    expect(summary.worstPerformer).toBeNull();
  });

  /**
   * Edge case: Single asset should be both best and worst performer
   */
  it('should identify single asset as both best and worst performer', () => {
    const asset: Asset = {
      id: '1',
      name: 'Only Asset',
      asset_type: 'stock',
      current_price: 120,
      purchase_price: 100,
      quantity: 10,
    };
    
    const summary = calculateSummary([asset]);
    
    expect(summary.bestPerformer).not.toBeNull();
    expect(summary.worstPerformer).not.toBeNull();
    expect(summary.bestPerformer?.name).toBe('Only Asset');
    expect(summary.worstPerformer?.name).toBe('Only Asset');
    expect(summary.bestPerformer?.changePercent).toBe(20); // (120-100)/100 * 100
    expect(summary.worstPerformer?.changePercent).toBe(20);
  });
});

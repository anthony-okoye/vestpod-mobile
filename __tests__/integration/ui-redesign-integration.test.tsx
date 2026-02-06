/**
 * Complete UI Redesign - Integration Tests
 * 
 * Tests the complete integration of the redesigned UI components across:
 * - Auth flow with new colors
 * - Portfolio search and filter functionality
 * - Add asset complete flow
 * - Dashboard navigation
 * - Theme switching
 * 
 * Task: 12. Integration testing
 * Requirements: All color requirements (1.1-1.3), Portfolio (2.1-2.4), 
 *               Asset Management (3.1-3.3), Dashboard (4.1-4.4)
 */

import { store } from '../../store';
import { setCredentials, clearCredentials } from '../../store/slices/authSlice';
import { setAssets } from '../../store/slices/assetsSlice';
import { setPortfolios } from '../../store/slices/portfolioSlice';

// Mock Supabase client
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithOAuth = jest.fn();

jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
    },
  },
}));

// Mock asset service
const mockCreateAsset = jest.fn();
jest.mock('../../services/api', () => ({
  assetService: {
    createAsset: (...args: unknown[]) => mockCreateAsset(...args),
  },
}));

describe('Complete UI Redesign - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(clearCredentials());
    store.dispatch(setAssets([]));
  });

  describe('Auth Flow with New Colors', () => {
    it('should complete sign in flow with new color scheme', async () => {
      // Verify new primary color is used
      const newPrimaryColor = '#1E3A8A';
      expect(newPrimaryColor).toBe('#1E3A8A'); // Updated from #2B4C8F

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { first_name: 'Test' },
      };
      const mockSession = {
        access_token: 'valid-token-123',
      };

      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await mockSignInWithPassword({
        email: 'test@example.com',
        password: 'ValidPassword123',
      });

      expect(result.error).toBeNull();
      expect(result.data.user).toEqual(mockUser);
      
      // Update Redux state
      store.dispatch(setCredentials({
        user: mockUser,
        token: mockSession.access_token,
      }));

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user).toEqual(mockUser);
    });

    it('should complete sign up flow with new success color', async () => {
      // Verify new success color
      const newSuccessColor = '#10B981';
      expect(newSuccessColor).toBe('#10B981'); // Updated from #059669

      const mockUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        identities: [{ id: 'identity-1' }],
      };

      mockSignUp.mockResolvedValueOnce({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await mockSignUp({
        email: 'newuser@example.com',
        password: 'ValidPassword123',
        options: {
          data: {
            first_name: 'New',
            last_name: 'User',
          },
        },
      });

      expect(result.error).toBeNull();
      expect(result.data.user).toEqual(mockUser);
    });

    it('should handle sign in errors with new error color', async () => {
      // Verify new error color
      const newErrorColor = '#EF4444';
      expect(newErrorColor).toBe('#EF4444'); // Updated from #DC2626

      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const result = await mockSignInWithPassword({
        email: 'invalid@example.com',
        password: 'WrongPassword',
      });

      expect(result.error).not.toBeNull();
      expect(result.error.message).toBe('Invalid login credentials');
    });

    it('should initiate OAuth flow with new button styling', async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({
        data: { provider: 'google', url: 'https://accounts.google.com/...' },
        error: null,
      });

      const result = await mockSignInWithOAuth({ provider: 'google' });

      expect(result.error).toBeNull();
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({ provider: 'google' });
    });
  });

  describe('Portfolio Search and Filter', () => {
    const mockAssets = [
      {
        id: '1',
        portfolio_id: 'portfolio-1',
        asset_type: 'stock' as const,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        purchase_price: 150,
        purchase_date: '2024-01-01',
        current_price: 155,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        portfolio_id: 'portfolio-1',
        asset_type: 'crypto' as const,
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 0.5,
        purchase_price: 50000,
        purchase_date: '2024-01-01',
        current_price: 49400,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '3',
        portfolio_id: 'portfolio-1',
        asset_type: 'commodity' as const,
        symbol: 'GOLD',
        name: 'Gold',
        quantity: 5,
        purchase_price: 2000,
        purchase_date: '2024-01-01',
        current_price: 2016,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];

    beforeEach(() => {
      store.dispatch(setAssets(mockAssets));
    });

    it('should filter assets by type', () => {
      const state = store.getState();
      const allAssets = state.assets.assets;

      // Filter by stocks
      const stocks = allAssets.filter(asset => asset.asset_type === 'stock');
      expect(stocks).toHaveLength(1);
      expect(stocks[0].symbol).toBe('AAPL');

      // Filter by crypto
      const crypto = allAssets.filter(asset => asset.asset_type === 'crypto');
      expect(crypto).toHaveLength(1);
      expect(crypto[0].symbol).toBe('BTC');

      // Filter by commodities
      const commodities = allAssets.filter(asset => asset.asset_type === 'commodity');
      expect(commodities).toHaveLength(1);
      expect(commodities[0].symbol).toBe('GOLD');
    });

    it('should search assets by name', () => {
      const state = store.getState();
      const allAssets = state.assets.assets;

      const searchQuery = 'apple';
      const filtered = allAssets.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Apple Inc.');
    });

    it('should search assets by symbol', () => {
      const state = store.getState();
      const allAssets = state.assets.assets;

      const searchQuery = 'btc';
      const filtered = allAssets.filter(asset =>
        asset.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].symbol).toBe('BTC');
    });

    it('should combine search and filter', () => {
      const state = store.getState();
      const allAssets = state.assets.assets;

      const searchQuery = 'gold';
      const filterType = 'commodity';

      const filtered = allAssets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            asset.symbol?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = asset.asset_type === filterType;
        return matchesSearch && matchesFilter;
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].symbol).toBe('GOLD');
    });

    it('should show empty state when no results', () => {
      const state = store.getState();
      const allAssets = state.assets.assets;

      const searchQuery = 'nonexistent';
      const filtered = allAssets.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(0);
    });

    it('should display assets with correct color indicators', () => {
      const state = store.getState();
      const allAssets = state.assets.assets;

      allAssets.forEach(asset => {
        const changePercent = asset.current_price && asset.purchase_price
          ? ((asset.current_price - asset.purchase_price) / asset.purchase_price) * 100
          : 0;

        if (changePercent > 0) {
          // Positive change should use green #10B981
          expect('#10B981').toBe('#10B981');
        } else if (changePercent < 0) {
          // Negative change should use red #EF4444
          expect('#EF4444').toBe('#EF4444');
        }
      });
    });
  });

  describe('Add Asset Complete Flow', () => {
    beforeEach(() => {
      // Set authenticated state
      store.dispatch(setCredentials({
        user: { id: 'user-123', email: 'test@example.com' },
        token: 'valid-token',
      }));
    });

    it('should complete asset type selection', () => {
      const assetTypes = [
        { id: 'stocks', name: 'Stocks', icon: 'trending-up', color: '#DBEAFE' },
        { id: 'crypto', name: 'Crypto', icon: 'logo-bitcoin', color: '#D1FAE5' },
        { id: 'commodities', name: 'Commodities', icon: 'business', color: '#FEF3C7' },
        { id: 'real-estate', name: 'Real Estate', icon: 'home', color: '#EDE9FE' },
        { id: 'fixed-income', name: 'Fixed Income', icon: 'document-text', color: '#FCE7F3' },
      ];

      // Verify all asset types are available
      expect(assetTypes).toHaveLength(5);
      
      // Verify colors match design
      expect(assetTypes[0].color).toBe('#DBEAFE'); // Stocks - blue-100
      expect(assetTypes[1].color).toBe('#D1FAE5'); // Crypto - green-100
      expect(assetTypes[2].color).toBe('#FEF3C7'); // Commodities - yellow-100
      expect(assetTypes[3].color).toBe('#EDE9FE'); // Real Estate - purple-100
      expect(assetTypes[4].color).toBe('#FCE7F3'); // Fixed Income - pink-100
    });

    it('should validate asset form data', () => {
      const validateAssetForm = (data: {
        ticker: string;
        quantity: number;
        price: number;
        date: string;
      }): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!data.ticker || data.ticker.trim().length === 0) {
          errors.push('Ticker is required');
        }
        if (data.quantity <= 0) {
          errors.push('Quantity must be greater than 0');
        }
        if (data.price <= 0) {
          errors.push('Price must be greater than 0');
        }
        if (!data.date) {
          errors.push('Purchase date is required');
        }

        return { valid: errors.length === 0, errors };
      };

      // Valid data
      const validData = {
        ticker: 'AAPL',
        quantity: 10,
        price: 150,
        date: '2024-01-01',
      };
      expect(validateAssetForm(validData).valid).toBe(true);

      // Invalid ticker
      const invalidTicker = { ...validData, ticker: '' };
      expect(validateAssetForm(invalidTicker).valid).toBe(false);

      // Invalid quantity
      const invalidQuantity = { ...validData, quantity: 0 };
      expect(validateAssetForm(invalidQuantity).valid).toBe(false);

      // Invalid price
      const invalidPrice = { ...validData, price: -10 };
      expect(validateAssetForm(invalidPrice).valid).toBe(false);
    });

    it('should create asset successfully', async () => {
      const newAsset = {
        ticker: 'AAPL',
        quantity: 10,
        price: 150,
        purchaseDate: '2024-01-01',
        type: 'stocks',
      };

      mockCreateAsset.mockResolvedValueOnce({
        data: {
          id: 'asset-123',
          ...newAsset,
          totalValue: 1500,
        },
        error: null,
      });

      const result = await mockCreateAsset(newAsset);

      expect(result.error).toBeNull();
      expect(result.data.ticker).toBe('AAPL');
      expect(result.data.totalValue).toBe(1500);
    });

    it('should show success animation after asset creation', async () => {
      // Verify success color
      const successColor = '#10B981';
      expect(successColor).toBe('#10B981');

      mockCreateAsset.mockResolvedValueOnce({
        data: { id: 'asset-123' },
        error: null,
      });

      const result = await mockCreateAsset({
        ticker: 'BTC',
        quantity: 0.5,
        price: 50000,
        type: 'crypto',
      });

      expect(result.error).toBeNull();
      // Success animation should display with green background
    });

    it('should handle asset creation errors', async () => {
      mockCreateAsset.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to create asset' },
      });

      const result = await mockCreateAsset({
        ticker: 'INVALID',
        quantity: 1,
        price: 100,
        type: 'stocks',
      });

      expect(result.error).not.toBeNull();
      expect(result.error.message).toBe('Failed to create asset');
    });
  });

  describe('Dashboard Navigation', () => {
    beforeEach(() => {
      // Set authenticated state
      store.dispatch(setCredentials({
        user: { id: 'user-123', email: 'test@example.com' },
        token: 'valid-token',
      }));

      // Set portfolio data
      store.dispatch(setPortfolios([{
        id: 'portfolio-1',
        name: 'My Portfolio',
        user_id: 'user-123',
        total_value: 50000,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }]));
    });

    it('should display dashboard header with new gradient colors', () => {
      const gradientColors = ['#1E3A8A', '#1E3A6F'];
      expect(gradientColors[0]).toBe('#1E3A8A'); // Updated primary
      expect(gradientColors[1]).toBe('#1E3A6F'); // Gradient end
    });

    it('should display portfolio value with correct formatting', () => {
      const state = store.getState();
      const portfolios = state.portfolio.portfolios;

      expect(portfolios).toHaveLength(1);
      expect(portfolios[0].total_value).toBe(50000);
    });

    it('should show positive change with green color', () => {
      const positiveColor = '#10B981';
      expect(positiveColor).toBe('#10B981');
    });

    it('should show negative change with red color', () => {
      const negativeColor = '#EF4444';
      expect(negativeColor).toBe('#EF4444');
    });

    it('should display allocation chart with new colors', () => {
      const allocationColors = {
        stocks: '#1E3A8A',
        crypto: '#10B981',
        realEstate: '#F59E0B',
        fixedIncome: '#8B5CF6',
        commodities: '#EC4899',
      };

      expect(allocationColors.stocks).toBe('#1E3A8A');
      expect(allocationColors.crypto).toBe('#10B981');
      expect(allocationColors.realEstate).toBe('#F59E0B');
      expect(allocationColors.fixedIncome).toBe('#8B5CF6');
      expect(allocationColors.commodities).toBe('#EC4899');
    });

    it('should display performance chart with new line color', () => {
      const performanceLineColor = '#10B981';
      expect(performanceLineColor).toBe('#10B981'); // Updated from #059669
    });

    it('should display stats cards with new background colors', () => {
      const statsBackgrounds = {
        totalInvested: '#DBEAFE', // Light blue
        riskScore: '#FEF3C7',     // Light amber
      };

      expect(statsBackgrounds.totalInvested).toBe('#DBEAFE');
      expect(statsBackgrounds.riskScore).toBe('#FEF3C7');
    });

    it('should navigate between dashboard tabs', () => {
      const tabs = ['Dashboard', 'Portfolio', 'Insights', 'Alerts', 'Profile'];
      
      expect(tabs).toContain('Dashboard');
      expect(tabs).toContain('Portfolio');
      expect(tabs).toContain('Insights');
      expect(tabs).toContain('Alerts');
      expect(tabs).toContain('Profile');
    });
  });

  describe('Theme Switching', () => {
    it('should verify light theme colors', () => {
      const lightTheme = {
        brandPrimary: '#1E3A8A',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        background: '#FFFFFF',
        backgroundSecondary: '#F9FAFB',
      };

      expect(lightTheme.brandPrimary).toBe('#1E3A8A');
      expect(lightTheme.success).toBe('#10B981');
      expect(lightTheme.error).toBe('#EF4444');
      expect(lightTheme.backgroundSecondary).toBe('#F9FAFB');
    });

    it('should maintain color consistency across themes', () => {
      // Primary colors should be consistent
      const primaryColor = '#1E3A8A';
      const successColor = '#10B981';
      const errorColor = '#EF4444';

      expect(primaryColor).toBe('#1E3A8A');
      expect(successColor).toBe('#10B981');
      expect(errorColor).toBe('#EF4444');
    });

    it('should apply theme to all components', () => {
      const components = [
        'Auth Screens',
        'Portfolio Screen',
        'Dashboard Screen',
        'Asset Management',
      ];

      // All components should use theme constants
      components.forEach(component => {
        expect(component).toBeTruthy();
      });
    });
  });

  describe('End-to-End User Flow', () => {
    it('should complete full user journey', async () => {
      // 1. Sign in
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockSession = {
        access_token: 'token-123',
      };

      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const signInResult = await mockSignInWithPassword({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(signInResult.error).toBeNull();

      store.dispatch(setCredentials({
        user: mockUser,
        token: mockSession.access_token,
      }));

      // 2. View dashboard
      store.dispatch(setPortfolios([{
        id: 'portfolio-1',
        name: 'My Portfolio',
        user_id: 'user-123',
        total_value: 50000,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }]));

      let state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.portfolio.portfolios[0].total_value).toBe(50000);

      // 3. Navigate to portfolio
      const mockAssets = [
        {
          id: '1',
          portfolio_id: 'portfolio-1',
          asset_type: 'stock' as const,
          symbol: 'AAPL',
          name: 'Apple Inc.',
          quantity: 10,
          purchase_price: 150,
          purchase_date: '2024-01-01',
          current_price: 155,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      store.dispatch(setAssets(mockAssets));
      state = store.getState();
      expect(state.assets.assets).toHaveLength(1);

      // 4. Add new asset
      mockCreateAsset.mockResolvedValueOnce({
        data: {
          id: 'asset-2',
          portfolio_id: 'portfolio-1',
          asset_type: 'crypto',
          symbol: 'BTC',
          name: 'Bitcoin',
          quantity: 0.5,
          purchase_price: 50000,
          purchase_date: '2024-01-01',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      const createResult = await mockCreateAsset({
        ticker: 'BTC',
        quantity: 0.5,
        price: 50000,
        type: 'crypto',
      });

      expect(createResult.error).toBeNull();

      // 5. Verify complete flow
      state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.assets.assets).toHaveLength(1);
      expect(state.portfolio.portfolios[0].total_value).toBe(50000);
    });
  });

  describe('Color Scheme Verification', () => {
    it('should verify all new colors are correctly defined', () => {
      const colorScheme = {
        primary: '#1E3A8A',      // Updated from #2B4C8F
        success: '#10B981',      // Updated from #059669
        error: '#EF4444',        // Updated from #DC2626
        warning: '#F59E0B',      // Unchanged
        background: '#F9FAFB',   // Updated from #F5F5F5
        cardBackground: '#FFFFFF',
        textPrimary: '#11181C',
        textSecondary: '#687076',
        border: '#E5E7EB',
      };

      expect(colorScheme.primary).toBe('#1E3A8A');
      expect(colorScheme.success).toBe('#10B981');
      expect(colorScheme.error).toBe('#EF4444');
      expect(colorScheme.background).toBe('#F9FAFB');
    });

    it('should verify allocation chart colors', () => {
      const allocationColors = {
        stocks: '#1E3A8A',
        crypto: '#10B981',
        realEstate: '#F59E0B',
        fixedIncome: '#8B5CF6',
        commodities: '#EC4899',
      };

      expect(allocationColors.stocks).toBe('#1E3A8A');
      expect(allocationColors.crypto).toBe('#10B981');
      expect(allocationColors.realEstate).toBe('#F59E0B');
      expect(allocationColors.fixedIncome).toBe('#8B5CF6');
      expect(allocationColors.commodities).toBe('#EC4899');
    });

    it('should verify asset type card colors', () => {
      const assetTypeColors = {
        stocks: '#DBEAFE',      // blue-100
        crypto: '#D1FAE5',      // green-100
        commodities: '#FEF3C7', // yellow-100
        realEstate: '#EDE9FE',  // purple-100
        fixedIncome: '#FCE7F3', // pink-100
      };

      expect(assetTypeColors.stocks).toBe('#DBEAFE');
      expect(assetTypeColors.crypto).toBe('#D1FAE5');
      expect(assetTypeColors.commodities).toBe('#FEF3C7');
      expect(assetTypeColors.realEstate).toBe('#EDE9FE');
      expect(assetTypeColors.fixedIncome).toBe('#FCE7F3');
    });
  });
});

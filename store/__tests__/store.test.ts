import { store } from '../index';
import { setCredentials, clearCredentials } from '../slices/authSlice';
import { setPortfolios, selectPortfolio } from '../slices/portfolioSlice';
import { setAssets, updateAssetPrice } from '../slices/assetsSlice';

describe('Redux Store', () => {
  it('should have initial state', () => {
    const state = store.getState();
    
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
    expect(state.portfolio.portfolios).toEqual([]);
    expect(state.assets.assets).toEqual([]);
  });

  it('should handle auth actions', () => {
    const user = { id: '1', email: 'test@example.com' };
    const token = 'test-token';
    
    store.dispatch(setCredentials({ user, token }));
    let state = store.getState();
    
    expect(state.auth.isAuthenticated).toBe(true);
    expect(state.auth.user).toEqual(user);
    expect(state.auth.token).toBe(token);
    
    store.dispatch(clearCredentials());
    state = store.getState();
    
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
  });

  it('should handle portfolio actions', () => {
    const portfolios = [
      { id: '1', name: 'Portfolio 1', user_id: '1', total_value: 10000, created_at: '', updated_at: '' },
      { id: '2', name: 'Portfolio 2', user_id: '1', total_value: 20000, created_at: '', updated_at: '' },
    ];
    
    store.dispatch(setPortfolios(portfolios));
    let state = store.getState();
    
    expect(state.portfolio.portfolios).toEqual(portfolios);
    
    store.dispatch(selectPortfolio('1'));
    state = store.getState();
    
    expect(state.portfolio.selectedPortfolioId).toBe('1');
  });

  it('should handle asset actions', () => {
    const assets = [
      {
        id: '1',
        portfolio_id: '1',
        asset_type: 'stock' as const,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 10,
        purchase_price: 150,
        purchase_date: '2024-01-01',
        current_price: 180,
        created_at: '',
        updated_at: '',
      },
    ];
    
    store.dispatch(setAssets(assets));
    let state = store.getState();
    
    expect(state.assets.assets).toEqual(assets);
    
    store.dispatch(updateAssetPrice({ id: '1', price: 190 }));
    state = store.getState();
    
    expect(state.assets.assets[0].current_price).toBe(190);
  });
});

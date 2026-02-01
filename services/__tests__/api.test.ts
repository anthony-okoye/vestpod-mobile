import api from '../api';

describe('API Service Layer', () => {
  it('should export all service modules', () => {
    expect(api.auth).toBeDefined();
    expect(api.portfolio).toBeDefined();
    expect(api.asset).toBeDefined();
    expect(api.priceHistory).toBeDefined();
    expect(api.alert).toBeDefined();
    expect(api.insights).toBeDefined();
    expect(api.chat).toBeDefined();
    expect(api.profile).toBeDefined();
    expect(api.subscription).toBeDefined();
    expect(api.realtime).toBeDefined();
  });

  describe('Auth Service', () => {
    it('should have all auth methods', () => {
      expect(api.auth.signUp).toBeDefined();
      expect(api.auth.signIn).toBeDefined();
      expect(api.auth.signOut).toBeDefined();
      expect(api.auth.resetPassword).toBeDefined();
      expect(api.auth.getSession).toBeDefined();
      expect(api.auth.getUser).toBeDefined();
      expect(api.auth.onAuthStateChange).toBeDefined();
    });
  });

  describe('Portfolio Service', () => {
    it('should have all portfolio methods', () => {
      expect(api.portfolio.getPortfolios).toBeDefined();
      expect(api.portfolio.getPortfolio).toBeDefined();
      expect(api.portfolio.createPortfolio).toBeDefined();
      expect(api.portfolio.updatePortfolio).toBeDefined();
      expect(api.portfolio.deletePortfolio).toBeDefined();
    });
  });

  describe('Asset Service', () => {
    it('should have all asset methods', () => {
      expect(api.asset.getAssets).toBeDefined();
      expect(api.asset.getAsset).toBeDefined();
      expect(api.asset.createAsset).toBeDefined();
      expect(api.asset.updateAsset).toBeDefined();
      expect(api.asset.deleteAsset).toBeDefined();
    });
  });

  describe('Price History Service', () => {
    it('should have price history methods', () => {
      expect(api.priceHistory.getPriceHistory).toBeDefined();
    });
  });

  describe('Alert Service', () => {
    it('should have all alert methods', () => {
      expect(api.alert.getAlerts).toBeDefined();
      expect(api.alert.createAlert).toBeDefined();
      expect(api.alert.updateAlert).toBeDefined();
      expect(api.alert.deleteAlert).toBeDefined();
    });
  });

  describe('Insights Service', () => {
    it('should have insights methods', () => {
      expect(api.insights.getLatestInsights).toBeDefined();
      expect(api.insights.getInsightsHistory).toBeDefined();
    });
  });

  describe('Chat Service', () => {
    it('should have chat methods', () => {
      expect(api.chat.getChatHistory).toBeDefined();
      expect(api.chat.sendMessage).toBeDefined();
    });
  });

  describe('Profile Service', () => {
    it('should have profile methods', () => {
      expect(api.profile.getProfile).toBeDefined();
      expect(api.profile.updateProfile).toBeDefined();
      expect(api.profile.uploadAvatar).toBeDefined();
    });
  });

  describe('Subscription Service', () => {
    it('should have subscription methods', () => {
      expect(api.subscription.getSubscriptionStatus).toBeDefined();
      expect(api.subscription.isPremium).toBeDefined();
    });
  });

  describe('Realtime Service', () => {
    it('should have realtime methods', () => {
      expect(api.realtime.subscribeToPriceUpdates).toBeDefined();
      expect(api.realtime.unsubscribe).toBeDefined();
    });
  });
});

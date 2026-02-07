// mobile/App.tsx
/**
 * Main App Component
 * 
 * Entry point for the Investment Portfolio Tracker mobile app
 * Sets up Redux store, navigation, theme, auto-login, and push notifications
 */

import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer, DarkTheme, DefaultTheme, NavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './navigation/RootNavigator';
import { store } from './store';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setCredentials, clearCredentials, setLoading } from './store/slices/authSlice';
import { setPortfolios, selectPortfolio } from './store/slices/portfolioSlice';
import { supabase } from './services/supabase';
import { secureStorage } from './services/secureStorage';
import { portfolioService } from './services/api';
import { configureNotifications, notificationService } from './services/notifications';
import { useNotifications } from './hooks/useNotifications';
import { purchasesService } from './services/purchases';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './hooks/useTheme';
import type { RootStackParamList } from './navigation/types';

function AppContent() {
  const { isDarkMode } = useTheme();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Initialize notifications hook with navigation ref for use outside NavigationContainer
  const { setup: setupNotifications } = useNotifications({
    autoSetup: false,
    autoNavigate: true,
    navigationRef,
  });

  // Configure notifications and initialize RevenueCat on app start
  useEffect(() => {
    configureNotifications();
    notificationService.configureAndroidChannel();
    
    // Initialize RevenueCat early (anonymous - will login after auth)
    const initRevenueCat = async () => {
      try {
        // Initialize without user ID first (anonymous)
        await purchasesService.initialize();
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      }
    };
    
    initRevenueCat();
  }, []);

  // Setup push notifications after user signs in
  useEffect(() => {
    if (isAuthenticated) {
      setupNotifications();
    }
  }, [isAuthenticated, setupNotifications]);

  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize portfolios when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      initializePortfolios();
    }
  }, [isAuthenticated, isLoading]);

  const initializeAuth = async () => {
    dispatch(setLoading(true));

    try {
      // Check for existing session in Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        await secureStorage.clearSession();
        dispatch(clearCredentials());
        return;
      }

      if (session) {
        // Store tokens securely
        await secureStorage.storeSession(
          session.access_token,
          session.refresh_token || '',
          {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.first_name || '',
          }
        );

        dispatch(setCredentials({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.first_name || '',
          },
          token: session.access_token,
        }));

        // Login to RevenueCat with user ID
        const loginToRevenueCat = async () => {
          // Wait for initialization to complete
          let attempts = 0;
          while (!purchasesService.isInitialized() && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
          }
          
          if (purchasesService.isInitialized()) {
            try {
              await purchasesService.login(session.user.id);
            } catch (error) {
              console.error('Failed to login to RevenueCat:', error);
            }
          } else {
            console.error('RevenueCat initialization timeout');
          }
        };
        
        loginToRevenueCat();
      } else {
        // No active session, clear any stored data
        await secureStorage.clearSession();
        dispatch(clearCredentials());
      }
    } catch (error) {
      await secureStorage.clearSession();
      dispatch(clearCredentials());
    }
  };

  const initializePortfolios = async () => {
    try {
      // Fetch existing portfolios
      const portfolios = await portfolioService.getPortfolios();
      
      if (!portfolios || portfolios.length === 0) {
        // No portfolios exist, create default "My Portfolio"
        const defaultPortfolio = await portfolioService.createPortfolio('My Portfolio');
        
        // Update Redux store with the new portfolio
        dispatch(setPortfolios([defaultPortfolio]));
        dispatch(selectPortfolio(defaultPortfolio.id));
      } else {
        // Portfolios exist, load them into Redux
        dispatch(setPortfolios(portfolios));
        
        // Select first portfolio if none is currently selected
        const currentSelectedId = store.getState().portfolio.selectedPortfolioId;
        if (!currentSelectedId) {
          dispatch(selectPortfolio(portfolios[0].id));
        }
      }
    } catch (error) {
      console.error('Failed to initialize portfolios:', error);
      // Don't throw - allow app to continue even if portfolio initialization fails
      // User can manually create portfolios later
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await secureStorage.storeSession(
            session.access_token,
            session.refresh_token || '',
            {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.first_name || '',
            }
          );

          dispatch(setCredentials({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.first_name || '',
            },
            token: session.access_token,
          }));

          // Login to RevenueCat with user ID
          const loginToRevenueCat = async () => {
            // Wait for initialization to complete
            let attempts = 0;
            while (!purchasesService.isInitialized() && attempts < 20) {
              await new Promise(resolve => setTimeout(resolve, 200));
              attempts++;
            }
            
            if (purchasesService.isInitialized()) {
              try {
                await purchasesService.login(session.user.id);
              } catch (error) {
                console.error('Failed to login to RevenueCat:', error);
              }
            } else {
              console.error('RevenueCat initialization timeout');
            }
          };
          
          loginToRevenueCat();
        } else if (event === 'SIGNED_OUT') {
          await secureStorage.clearSession();
          dispatch(clearCredentials());

          // Logout from RevenueCat
          try {
            await purchasesService.logout();
          } catch (error) {
            console.error('Failed to logout from RevenueCat:', error);
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          await secureStorage.setAccessToken(session.access_token);
          if (session.refresh_token) {
            await secureStorage.setRefreshToken(session.refresh_token);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  if (isLoading) {
    return null; // Or a splash screen component
  }

  return (
    <>
      <NavigationContainer ref={navigationRef} theme={isDarkMode ? DarkTheme : DefaultTheme}>
        <RootNavigator isAuthenticated={isAuthenticated} />
      </NavigationContainer>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

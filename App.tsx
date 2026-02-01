// mobile/App.tsx
/**
 * Main App Component
 * 
 * Entry point for the Investment Portfolio Tracker mobile app
 * Sets up Redux store, navigation, theme, and auto-login
 */

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from './hooks/use-color-scheme';
import RootNavigator from './navigation/RootNavigator';
import { store } from './store';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setCredentials, clearCredentials, setLoading } from './store/slices/authSlice';
import { supabase } from './services/supabase';
import { secureStorage } from './services/secureStorage';

function AppContent() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    initializeAuth();
  }, []);

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
        } else if (event === 'SIGNED_OUT') {
          await secureStorage.clearSession();
          dispatch(clearCredentials());
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
      <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator isAuthenticated={isAuthenticated} />
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

import { DarkTheme, DefaultTheme, ThemeProvider, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import RootNavigator from '@/navigation/RootNavigator';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // TODO: Replace with actual authentication state from Supabase (Task 35-38)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NavigationContainer>
        <RootNavigator isAuthenticated={isAuthenticated} />
      </NavigationContainer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

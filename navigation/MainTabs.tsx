/**
 * Main Tab Navigator
 * 
 * Handles main app screens with bottom tab navigation:
 * - Home (Dashboard)
 * - Portfolio
 * - FAB (center, elevated)
 * - Insights
 * - Profile
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.1, 7.2, 7.3, 7.4, 7.5
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from './types';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FABButton } from '@/components/navigation/FABButton';

// Screens
import DashboardScreen from '@/screens/main/DashboardScreen';
import PortfolioScreen from '@/screens/main/PortfolioScreen';
import InsightsScreen from '@/screens/main/InsightsScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

type RootNavProp = StackNavigationProp<RootStackParamList>;

/**
 * Custom Tab Bar Component with FAB
 * 
 * Renders a custom tab bar with the FAB button positioned in the center,
 * elevated above the tab bar.
 * 
 * Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5
 */
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const rootNavigation = useNavigation<RootNavProp>();

  const handleFABPress = () => {
    // Navigate to Add Asset flow with a default portfolio
    // The actual portfolioId will be selected in the AssetTypeSelection screen
    rootNavigation.navigate('AddAsset', {
      screen: 'AssetTypeSelection',
      params: { portfolioId: 'default' },
    });
  };

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: colors.tabBarBackground }]}>
      {/* Top border */}
      <View style={[styles.tabBarBorder, { backgroundColor: colors.tabBarBorder }]} />
      
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Insert FAB placeholder after Portfolio (index 1)
          const showFABBefore = index === 2;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconColor = isFocused ? colors.tabBarActive : colors.tabBarInactive;
          const iconName = getIconName(route.name as keyof MainTabParamList, isFocused);

          return (
            <React.Fragment key={route.key}>
              {showFABBefore && (
                <View style={styles.fabContainer}>
                  <FABButton
                    onPress={handleFABPress}
                    style={styles.fab}
                    testID="fab-add-asset"
                  />
                </View>
              )}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel || route.name}
                testID={`tab-${route.name.toLowerCase()}`}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabItem}
              >
                <Ionicons name={iconName} size={24} color={iconColor} />
                <View
                  style={[
                    styles.tabLabel,
                    { backgroundColor: isFocused ? iconColor : 'transparent' },
                  ]}
                />
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Get icon name for each tab
 * Requirements: 6.5, 6.6, 6.7, 6.8
 */
function getIconName(routeName: keyof MainTabParamList, isFocused: boolean): keyof typeof Ionicons.glyphMap {
  switch (routeName) {
    case 'Dashboard':
      return isFocused ? 'home' : 'home-outline';
    case 'Portfolio':
      return isFocused ? 'briefcase' : 'briefcase-outline';
    case 'Insights':
      return isFocused ? 'bulb' : 'bulb-outline';
    case 'Profile':
      return isFocused ? 'person' : 'person-outline';
    default:
      return 'ellipse-outline';
  }
}

export default function MainTabs() {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          tabBarAccessibilityLabel: 'Portfolio tab',
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarAccessibilityLabel: 'Insights tab',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tab.Navigator>
  );
}

const TAB_BAR_HEIGHT = 60;
const FAB_SIZE = 56;

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'relative',
  },
  tabBarBorder: {
    height: 1,
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 10,
  },
});

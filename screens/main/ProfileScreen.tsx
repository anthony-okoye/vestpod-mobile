/**
 * Profile Screen
 * 
 * Displays user profile information, subscription status, and settings
 * Requirements: Task 62, 64, 65, 66
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainTabScreenProps } from '@/navigation/types';
import { profileService, authService } from '@/services/api';
import { usePurchases } from '@/hooks/usePurchases';
import {
  CurrencySelectionModal,
  LanguageSelectionModal,
  NotificationToggle,
  DarkModeToggle,
  ChartViewSelector,
  loadNotificationPreference,
  loadDarkModePreference,
  loadChartViewPreference,
} from '@/screens/settings/SettingsModals';
import { DataExportModal } from '@/screens/settings/DataExportModal';
import AccountDeletionModal from '@/screens/settings/AccountDeletionModal';

type Props = MainTabScreenProps<'Profile'>;

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email?: string;
  avatar_url: string | null;
  currency_preference: string | null;
  language_preference: string | null;
}

interface SettingsRow {
  label: string;
  value?: string;
  onPress: () => void;
  isDanger?: boolean;
}

interface SettingsSection {
  title: string;
  rows: SettingsRow[];
}

export default function ProfileScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Modal visibility states
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [chartView, setChartView] = useState('line');

  const { isPremium, isLoading: isPurchasesLoading } = usePurchases();

  const loadProfileData = useCallback(async () => {
    try {
      setError(null);

      // Fetch user profile
      const profileData = await profileService.getProfile();
      setProfile(profileData);

      // Fetch user email from auth
      const user = await authService.getUser();
      setUserEmail(user?.email || null);

      // Load local settings
      const [notifications, darkMode, chart] = await Promise.all([
        loadNotificationPreference(),
        loadDarkModePreference(),
        loadChartViewPreference(),
      ]);
      setNotificationsEnabled(notifications);
      setDarkModeEnabled(darkMode);
      setChartView(chart);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Reload profile when returning from EditProfile screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!isLoading) {
        loadProfileData();
      }
    });
    return unsubscribe;
  }, [navigation, loadProfileData, isLoading]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProfileData();
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
            } catch (err) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Settings handlers
  const handleCurrency = () => setShowCurrencyModal(true);
  const handleLanguage = () => setShowLanguageModal(true);
  const handleExportData = () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Data export is available for premium subscribers only.',
        [{ text: 'OK' }]
      );
      return;
    }
    setShowExportModal(true);
  };
  const handleClearCache = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('Success', 'Cache cleared successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to clear cache.');
    }
  };
  const handleDeleteAccount = () => setShowDeleteModal(true);
  const handleHelpCenter = () => Alert.alert('Help Center', 'Visit our help center at help.vestpod.com');
  const handleContactUs = () => Alert.alert('Contact Us', 'Contact support at support@vestpod.com');
  const handlePrivacyPolicy = () => Alert.alert('Privacy Policy', 'View our privacy policy at vestpod.com/privacy');
  const handleTermsOfService = () => Alert.alert('Terms of Service', 'View our terms at vestpod.com/terms');

  const handleCurrencyChange = (currency: string) => {
    setProfile(prev => prev ? { ...prev, currency_preference: currency } : null);
  };

  const handleLanguageChange = (language: string) => {
    setProfile(prev => prev ? { ...prev, language_preference: language } : null);
  };

  const handleAccountDeleted = () => {
    setShowDeleteModal(false);
    // Auth state change will handle navigation to sign-in
  };

  const getLanguageName = (code: string): string => {
    const languages: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      pt: 'Portuguese',
      zh: 'Chinese',
      ja: 'Japanese',
    };
    return languages[code] || 'English';
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Preferences',
      rows: [
        { label: 'Currency', value: profile?.currency_preference || 'USD', onPress: handleCurrency },
        { label: 'Language', value: getLanguageName(profile?.language_preference || 'en'), onPress: handleLanguage },
      ],
    },
    {
      title: 'Data',
      rows: [
        { label: 'Export Data', onPress: handleExportData },
        { label: 'Clear Cache', onPress: handleClearCache },
      ],
    },
    {
      title: 'Support',
      rows: [
        { label: 'Help Center', onPress: handleHelpCenter },
        { label: 'Contact Us', onPress: handleContactUs },
      ],
    },
    {
      title: 'Legal',
      rows: [
        { label: 'Privacy Policy', onPress: handlePrivacyPolicy },
        { label: 'Terms of Service', onPress: handleTermsOfService },
      ],
    },
    {
      title: 'Account',
      rows: [
        { label: 'Delete Account', onPress: handleDeleteAccount, isDanger: true },
      ],
    },
  ];

  const getDisplayName = (): string => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return 'User';
  };

  const getInitials = (): string => {
    const name = getDisplayName();
    if (name === 'User') return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (isLoading || isPurchasesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfileData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.profileCard}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials()}</Text>
            </View>
          )}
        </View>

        {/* Name and Email */}
        <Text style={styles.userName}>{getDisplayName()}</Text>
        <Text style={styles.userEmail}>{userEmail || 'No email'}</Text>

        {/* Subscription Badge */}
        <View style={[styles.subscriptionBadge, isPremium ? styles.premiumBadge : styles.freeBadge]}>
          <Text style={[styles.subscriptionText, isPremium ? styles.premiumText : styles.freeText]}>
            {isPremium ? 'Premium' : 'Free'}
          </Text>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Notification and Dark Mode Toggles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.togglesContainer}>
          <NotificationToggle
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <View style={styles.toggleSpacer} />
          <DarkModeToggle
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
          <View style={styles.toggleSpacer} />
          <ChartViewSelector
            value={chartView}
            onValueChange={setChartView}
          />
        </View>
      </View>

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.rows.map((row, index) => (
              <TouchableOpacity
                key={row.label}
                style={[
                  styles.settingsRow,
                  index < section.rows.length - 1 && styles.settingsRowBorder,
                ]}
                onPress={row.onPress}
              >
                <Text style={[styles.settingsLabel, row.isDanger && styles.dangerLabel]}>
                  {row.label}
                </Text>
                <View style={styles.settingsRight}>
                  {row.value && <Text style={styles.settingsValue}>{row.value}</Text>}
                  <Text style={styles.chevron}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <Text style={styles.versionText}>Version 1.0.0</Text>

      {/* Modals */}
      <CurrencySelectionModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        currentCurrency={profile?.currency_preference || 'USD'}
        onCurrencyChange={handleCurrencyChange}
      />

      <LanguageSelectionModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        currentLanguage={profile?.language_preference || 'en'}
        onLanguageChange={handleLanguageChange}
      />

      <DataExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      <AccountDeletionModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleted={handleAccountDeleted}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#687076',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#687076',
    marginBottom: 12,
  },
  subscriptionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  premiumBadge: {
    backgroundColor: '#8B5CF6',
  },
  freeBadge: {
    backgroundColor: '#E5E7EB',
  },
  subscriptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  premiumText: {
    color: '#FFFFFF',
  },
  freeText: {
    color: '#687076',
  },
  editButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687076',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsLabel: {
    fontSize: 16,
    color: '#11181C',
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsValue: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  signOutButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  togglesContainer: {
    gap: 12,
  },
  toggleSpacer: {
    height: 8,
  },
  dangerLabel: {
    color: '#DC2626',
  },
});

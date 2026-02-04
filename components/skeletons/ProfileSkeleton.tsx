/**
 * ProfileSkeleton Component
 * 
 * Skeleton screen for the Profile screen
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ShimmerEffect } from '../ShimmerEffect';

export function ProfileSkeleton(): React.ReactElement {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        {/* Avatar */}
        <ShimmerEffect width={80} height={80} borderRadius={40} style={styles.avatar} />
        
        {/* Name and Email */}
        <ShimmerEffect width={140} height={22} borderRadius={4} style={styles.userName} />
        <ShimmerEffect width={180} height={14} borderRadius={4} style={styles.userEmail} />
        
        {/* Subscription Badge */}
        <ShimmerEffect width={80} height={28} borderRadius={16} style={styles.subscriptionBadge} />
        
        {/* Edit Profile Button */}
        <ShimmerEffect width={120} height={36} borderRadius={8} style={styles.editButton} />
      </View>

      {/* App Settings Section */}
      <View style={styles.section}>
        <ShimmerEffect width={100} height={14} borderRadius={4} style={styles.sectionTitle} />
        <View style={styles.togglesContainer}>
          {[0, 1, 2].map((index) => (
            <View key={index} style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <ShimmerEffect width={24} height={24} borderRadius={4} />
                <ShimmerEffect width={120} height={16} borderRadius={4} style={styles.toggleLabel} />
              </View>
              <ShimmerEffect width={50} height={28} borderRadius={14} />
            </View>
          ))}
        </View>
      </View>

      {/* Settings Sections */}
      {['Preferences', 'Data', 'Support', 'Legal', 'Account'].map((section, sectionIndex) => (
        <View key={section} style={styles.section}>
          <ShimmerEffect width={80 + sectionIndex * 10} height={14} borderRadius={4} style={styles.sectionTitle} />
          <View style={styles.sectionContent}>
            {Array.from({ length: sectionIndex === 4 ? 1 : 2 }).map((_, rowIndex) => (
              <View
                key={rowIndex}
                style={[
                  styles.settingsRow,
                  rowIndex < (sectionIndex === 4 ? 0 : 1) && styles.settingsRowBorder,
                ]}
              >
                <ShimmerEffect width={100 + rowIndex * 20} height={16} borderRadius={4} />
                <View style={styles.settingsRight}>
                  {sectionIndex < 2 && (
                    <ShimmerEffect width={60} height={14} borderRadius={4} style={styles.settingsValue} />
                  )}
                  <ShimmerEffect width={12} height={20} borderRadius={4} />
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Sign Out Button */}
      <ShimmerEffect width="100%" height={48} borderRadius={12} style={styles.signOutButton} />

      {/* Version Info */}
      <ShimmerEffect width={80} height={12} borderRadius={4} style={styles.versionText} />
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
  avatar: {
    marginBottom: 16,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    marginBottom: 12,
  },
  subscriptionBadge: {
    marginBottom: 16,
  },
  editButton: {
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  togglesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    marginLeft: 12,
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
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsValue: {
    marginRight: 8,
  },
  signOutButton: {
    marginBottom: 16,
  },
  versionText: {
    alignSelf: 'center',
  },
});

export default ProfileSkeleton;

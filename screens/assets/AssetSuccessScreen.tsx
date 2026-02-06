/**
 * AssetSuccessScreen
 * 
 * Success screen displayed after successfully adding an asset.
 * Shows success animation and provides navigation options.
 * 
 * Requirements: 3.3
 */

import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { AddAssetStackScreenProps } from '@/navigation/types';
import { SuccessAnimation } from '@/components/assets/SuccessAnimation';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = AddAssetStackScreenProps<'AssetSuccess'>;

export default function AssetSuccessScreen({ navigation, route }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleViewPortfolio = () => {
    navigation.getParent()?.navigate('MainTabs', { screen: 'Portfolio' });
  };

  const handleAddAnother = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'AssetTypeSelection', params: route.params }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <SuccessAnimation
          title="Asset Added!"
          message="Your asset has been successfully added to your portfolio"
          testID="asset-success-animation"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.buttonPrimary }]}
            onPress={handleViewPortfolio}
            testID="view-portfolio-button"
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>View Portfolio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                borderColor: colors.buttonPrimary,
                backgroundColor: colors.background,
              },
            ]}
            onPress={handleAddAnother}
            testID="add-another-button"
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.buttonPrimary }]}>
              Add Another Asset
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  buttonContainer: {
    marginTop: Spacing['2xl'],
    gap: Spacing.md,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
  secondaryButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
  },
});

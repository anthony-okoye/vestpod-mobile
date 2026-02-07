/**
 * Premium Paywall Component
 * 
 * Modal component displaying premium subscription options
 * Requirements: 10 - Premium Features & Monetization
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type SubscriptionPlan = 'monthly' | 'annual';

export interface PremiumPaywallProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: (plan: SubscriptionPlan) => void;
  onRestorePurchases: () => void;
  feature?: string;
  isLoading?: boolean;
  error?: string | null;
}

interface PremiumFeature {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    icon: 'analytics',
    title: 'AI-Powered Portfolio Insights',
    description: 'Get personalized analysis and recommendations',
  },
  {
    icon: 'chatbubbles',
    title: 'Conversational AI Assistant',
    description: 'Ask questions about your portfolio in natural language',
  },
  {
    icon: 'notifications',
    title: 'Unlimited Price Alerts',
    description: 'Set as many alerts as you need',
  },
  {
    icon: 'download',
    title: 'Data Export (CSV, JSON, PDF)',
    description: 'Export your portfolio data in multiple formats',
  },
  {
    icon: 'flash',
    title: 'Real-Time Price Updates',
    description: '5-minute updates vs 15-minute for free users',
  },
  {
    icon: 'headset',
    title: 'Priority Support',
    description: 'Get faster responses from our support team',
  },
];

const MONTHLY_PRICE = 9.99;
const ANNUAL_PRICE = 89.99;
const ANNUAL_MONTHLY_EQUIVALENT = ANNUAL_PRICE / 12;
const SAVINGS_PERCENTAGE = Math.round((1 - ANNUAL_PRICE / (MONTHLY_PRICE * 12)) * 100);

export function PremiumPaywall({
  visible,
  onClose,
  onSubscribe,
  onRestorePurchases,
  feature,
  isLoading = false,
  error = null,
}: PremiumPaywallProps): React.ReactElement {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('annual');

  const handleStartTrial = () => {
    onSubscribe(selectedPlan);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.headerGradient}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close paywall"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.crownContainer}>
              <Ionicons name="diamond" size={48} color="#FFD700" />
            </View>
            <Text style={styles.headerTitle}>Upgrade to Premium</Text>
            <Text style={styles.headerSubtitle}>
              Unlock the full potential of your portfolio
            </Text>
          </View>
        </View>

        {feature && (
          <View style={styles.featureHighlight}>
            <Ionicons name="lock-closed" size={16} color="#0a7ea4" />
            <Text style={styles.featureHighlightText}>
              {feature} is a premium feature
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            {PREMIUM_FEATURES.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={item.icon} size={20} color="#0a7ea4" />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDescription}>{item.description}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
            ))}
          </View>

          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>

            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'annual' && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('annual')}
              accessibilityLabel="Annual plan, $89.99 per year, save 25%"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedPlan === 'annual' }}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <View style={styles.planHeader}>
                <View style={styles.planRadio}>
                  {selectedPlan === 'annual' && (
                    <View style={styles.planRadioSelected} />
                  )}
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>Annual</Text>
                  <Text style={styles.planSavings}>Save {SAVINGS_PERCENTAGE}%</Text>
                </View>
                <View style={styles.planPricing}>
                  <Text style={styles.planPrice}>${ANNUAL_PRICE.toFixed(2)}</Text>
                  <Text style={styles.planPeriod}>/year</Text>
                </View>
              </View>
              <Text style={styles.planEquivalent}>
                ${ANNUAL_MONTHLY_EQUIVALENT.toFixed(2)}/month billed annually
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('monthly')}
              accessibilityLabel="Monthly plan, $9.99 per month"
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedPlan === 'monthly' }}
            >
              <View style={styles.planHeader}>
                <View style={styles.planRadio}>
                  {selectedPlan === 'monthly' && (
                    <View style={styles.planRadioSelected} />
                  )}
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>Monthly</Text>
                </View>
                <View style={styles.planPricing}>
                  <Text style={styles.planPrice}>${MONTHLY_PRICE.toFixed(2)}</Text>
                  <Text style={styles.planPeriod}>/month</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.trialButton, isLoading && styles.trialButtonDisabled]}
            onPress={handleStartTrial}
            disabled={isLoading}
            accessibilityLabel="Start 7-day free trial"
            accessibilityRole="button"
          >
            <View style={styles.trialButtonGradient}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.trialButtonText}>Start 7-Day Free Trial</Text>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.trialDisclaimer}>
            Cancel anytime. You won't be charged until the trial ends.
          </Text>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={onRestorePurchases}
            disabled={isLoading}
            accessibilityLabel="Restore purchases"
            accessibilityRole="button"
          >
            <Text style={[styles.restoreButtonText, isLoading && styles.restoreButtonTextDisabled]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: '#1a1a2e',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  featureHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  featureHighlightText: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#687076',
  },
  plansSection: {
    marginBottom: 16,
  },
  planCard: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  planCardSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#F0F9FF',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planRadioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0a7ea4',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#11181C',
  },
  planSavings: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 2,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#11181C',
  },
  planPeriod: {
    fontSize: 13,
    color: '#687076',
  },
  planEquivalent: {
    fontSize: 12,
    color: '#687076',
    marginTop: 8,
    marginLeft: 34,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
  },
  trialButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  trialButtonDisabled: {
    opacity: 0.6,
  },
  trialButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
  },
  trialButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trialDisclaimer: {
    fontSize: 12,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 12,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  restoreButtonTextDisabled: {
    opacity: 0.5,
  },
});

export default PremiumPaywall;

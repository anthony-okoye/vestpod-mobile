/**
 * ScreenErrorBoundary Component
 * 
 * Specialized error boundary for individual screens.
 * Provides screen-specific error UI with navigation back option.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ScreenErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Screen name for error context */
  screenName?: string;
  /** Navigation object for back navigation */
  navigation?: {
    goBack: () => void;
    canGoBack: () => boolean;
  };
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Custom fallback component */
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
}

interface ScreenErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ScreenErrorBoundary extends Component<ScreenErrorBoundaryProps, ScreenErrorBoundaryState> {
  constructor(props: ScreenErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ScreenErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { screenName, onError } = this.props;
    
    // Log error with screen context
    console.error(`[ScreenErrorBoundary] Error in ${screenName || 'Unknown Screen'}:`, error);
    console.error('[ScreenErrorBoundary] Component stack:', errorInfo.componentStack);

    // Call optional error callback
    onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleGoBack = (): void => {
    const { navigation } = this.props;
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, screenName, navigation, fallback } = this.props;

    if (hasError && error) {
      // Custom fallback
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.resetError);
        }
        return fallback;
      }

      const canGoBack = navigation?.canGoBack?.() ?? false;

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={56} color="#DC2626" />
            </View>
            
            <Text style={styles.title}>Screen Error</Text>
            
            <Text style={styles.message}>
              {screenName 
                ? `Something went wrong on the ${screenName} screen.`
                : 'Something went wrong on this screen.'}
            </Text>
            
            <Text style={styles.subMessage}>
              Please try again or go back to the previous screen.
            </Text>

            {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText} numberOfLines={3}>
                  {error.message}
                </Text>
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.primaryButton} 
                onPress={this.resetError}
              >
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
              
              {canGoBack && (
                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={this.handleGoBack}
                >
                  <Ionicons name="arrow-back" size={18} color="#0a7ea4" />
                  <Text style={styles.secondaryButtonText}>Go Back</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
    maxWidth: 300,
  },
  subMessage: {
    fontSize: 14,
    color: '#9BA1A6',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  debugContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: 300,
    width: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 11,
    color: '#92400E',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScreenErrorBoundary;

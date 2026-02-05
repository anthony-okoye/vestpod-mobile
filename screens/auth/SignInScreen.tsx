// mobile/screens/auth/SignInScreen.tsx
/**
 * Sign In Screen
 * 
 * User authentication with email/password and OAuth options
 * Integrates with Supabase Auth
 * Requirements: 1
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { AuthStackScreenProps } from '@/navigation/types';
import { supabase } from '@/services/supabase';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { GradientBackground } from '@/components/auth/GradientBackground';
import { BrandHeader } from '@/components/auth/BrandHeader';
import { FormCard } from '@/components/auth/FormCard';
import { OAuthButton } from '@/components/auth/OAuthButton';

type Props = AuthStackScreenProps<'SignIn'>;

interface FormErrors {
  email?: string;
  password?: string;
}

export default function SignInScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setApiError(error.message);
        return;
      }

      if (data.user && data.session) {
        dispatch(setCredentials({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.first_name || '',
          },
          token: data.session.access_token,
        }));
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setApiError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) {
        setApiError(error.message);
      }
    } catch (error) {
      setApiError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setApiError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
      });

      if (error) {
        setApiError(error.message);
      }
    } catch (error) {
      setApiError('Apple sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };

  const navigateToPasswordReset = () => {
    navigation.navigate('PasswordReset');
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <BrandHeader tagline="Welcome back! Sign in to continue" />

          <FormCard>
            <View style={styles.header}>
              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.subtitle}>Enter your credentials to access your portfolio</Text>
            </View>

            {apiError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠</Text>
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="john.doe@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  accessible={true}
                  accessibilityLabel="Email address"
                  accessibilityHint="Enter your email address"
                  accessibilityState={{ disabled: isLoading }}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Enter password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  accessible={true}
                  accessibilityLabel="Password"
                  accessibilityHint="Enter your password"
                  accessibilityState={{ disabled: isLoading }}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={navigateToPasswordReset}
                disabled={isLoading}
                style={styles.forgotPassword}
                accessible={true}
                accessibilityLabel="Forgot password"
                accessibilityRole="button"
                accessibilityHint="Navigate to password reset screen"
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={isLoading}
                accessible={true}
                accessibilityLabel={isLoading ? "Signing in, please wait" : "Sign in"}
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading, busy: isLoading }}
                accessibilityHint="Sign in to your account"
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.buttonLoadingText}>Signing in...</Text>
                  </>
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.oauthButtons}>
                <OAuthButton
                  provider="google"
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                />
                <OAuthButton
                  provider="apple"
                  onPress={handleAppleSignIn}
                  disabled={isLoading}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity 
                onPress={navigateToSignUp} 
                disabled={isLoading}
                accessible={true}
                accessibilityLabel="Sign up"
                accessibilityRole="button"
                accessibilityHint="Navigate to sign up screen"
                style={styles.footerLink}
              >
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </FormCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#687076',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#DC2626',
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#11181C',
    borderWidth: 0,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    minHeight: 44, // WCAG minimum touch target
    justifyContent: 'center',
  },
  forgotPasswordText: {
    color: '#2B4C8F',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2B4C8F',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Slightly larger for primary action
    flexDirection: 'row',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonLoadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#687076',
    fontSize: 12,
    fontWeight: '500',
  },
  oauthButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    color: '#687076',
    fontSize: 14,
  },
  footerLink: {
    minHeight: 44, // WCAG minimum touch target
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  linkText: {
    color: '#2B4C8F',
    fontSize: 14,
    fontWeight: '600',
  },
});

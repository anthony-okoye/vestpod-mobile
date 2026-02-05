/**
 * Sign Up Screen
 * 
 * User registration with email, password, and name fields
 * Integrates with Supabase Auth via backend auth-handler
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
import { GradientBackground, BrandHeader, FormCard, OAuthButton } from '@/components/auth';

type Props = AuthStackScreenProps<'SignUp'>;

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validatePassword = (value: string): { valid: boolean; message?: string } => {
    if (value.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(value)) {
      return { valid: false, message: 'Password must contain an uppercase letter' };
    }
    if (!/[a-z]/.test(value)) {
      return { valid: false, message: 'Password must contain a lowercase letter' };
    }
    if (!/[0-9]/.test(value)) {
      return { valid: false, message: 'Password must contain a number' };
    }
    return { valid: true };
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    setApiError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (error) {
        setApiError(error.message);
        return;
      }

      if (data.user && !data.user.identities?.length) {
        setApiError('An account with this email already exists. Please sign in.');
        return;
      }

      setSuccessMessage('Verification email sent. Please check your inbox to complete registration.');
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignIn = () => {
    navigation.navigate('SignIn');
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) {
        setApiError(error.message);
      }
    } catch (error) {
      setApiError('Failed to sign up with Google. Please try again.');
    }
  };

  const handleAppleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
      });
      if (error) {
        setApiError(error.message);
      }
    } catch (error) {
      setApiError('Failed to sign up with Apple. Please try again.');
    }
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
          <BrandHeader tagline="Start tracking your investments today" />

          <FormCard>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to start building your portfolio</Text>
            </View>

            {apiError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠</Text>
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            )}

            {successMessage && (
              <View style={styles.successBanner}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successBannerText}>{successMessage}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    placeholder="John"
                    placeholderTextColor="#9CA3AF"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isLoading}
                    accessible={true}
                    accessibilityLabel="First name"
                    accessibilityHint="Enter your first name"
                    accessibilityState={{ disabled: isLoading }}
                  />
                  {errors.firstName && (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  )}
                </View>

                <View style={styles.nameField}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    placeholder="Doe"
                    placeholderTextColor="#9CA3AF"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isLoading}
                    accessible={true}
                    accessibilityLabel="Last name"
                    accessibilityHint="Enter your last name"
                    accessibilityState={{ disabled: isLoading }}
                  />
                  {errors.lastName && (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  )}
                </View>
              </View>

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
                  accessibilityHint="Enter a password with at least 8 characters, including uppercase, lowercase, and number"
                  accessibilityState={{ disabled: isLoading }}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
                <Text style={styles.hint}>
                  Min 8 characters with uppercase, lowercase, and number
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword && styles.inputError]}
                  placeholder="Confirm password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  accessible={true}
                  accessibilityLabel="Confirm password"
                  accessibilityHint="Re-enter your password to confirm"
                  accessibilityState={{ disabled: isLoading }}
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}
                accessible={true}
                accessibilityLabel={isLoading ? "Creating account, please wait" : "Create account"}
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading, busy: isLoading }}
                accessibilityHint="Create your Vest Pod account"
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.buttonLoadingText}>Creating account...</Text>
                  </>
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.oauthContainer}>
              <OAuthButton
                provider="google"
                onPress={handleGoogleSignUp}
                disabled={isLoading}
              />
              <OAuthButton
                provider="apple"
                onPress={handleAppleSignUp}
                disabled={isLoading}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity 
                onPress={navigateToSignIn} 
                disabled={isLoading}
                accessible={true}
                accessibilityLabel="Sign in"
                accessibilityRole="button"
                accessibilityHint="Navigate to sign in screen"
                style={styles.footerLink}
              >
                <Text style={styles.linkText}>Sign In</Text>
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
  successBanner: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#059669',
  },
  successBannerText: {
    color: '#059669',
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameField: {
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
  hint: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#2B4C8F',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
  dividerContainer: {
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
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  oauthContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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

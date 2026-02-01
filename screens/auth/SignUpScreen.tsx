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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start tracking your investments</Text>
        </View>

        {apiError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{apiError}</Text>
          </View>
        )}

        {successMessage && (
          <View style={styles.successBanner}>
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
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
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
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
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
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
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
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
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
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={navigateToSignIn} disabled={isLoading}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 40,
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
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successBannerText: {
    color: '#059669',
    fontSize: 14,
    textAlign: 'center',
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#11181C',
    backgroundColor: '#FAFAFA',
  },
  inputError: {
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
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  linkText: {
    color: '#0a7ea4',
    fontSize: 14,
    fontWeight: '600',
  },
});

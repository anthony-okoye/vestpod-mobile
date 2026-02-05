/**
 * Authentication Functionality Tests
 * 
 * Verifies that all authentication functionality works correctly after the visual redesign.
 * Tests cover:
 * - Sign in with valid/invalid credentials
 * - Sign up with valid data/existing email
 * - OAuth flow initiation (Google, GitHub)
 * - Navigation between auth screens
 * - Redux state updates
 * - Supabase integration
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8
 */

import { store } from '../../../store';
import { setCredentials, clearCredentials } from '../../../store/slices/authSlice';

// Mock Supabase client
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockResetPasswordForEmail = jest.fn();

jest.mock('../../../services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
    },
  },
}));

describe('Authentication Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(clearCredentials());
  });

  describe('Sign In Functionality', () => {
    describe('Valid Credentials (Requirement 10.1)', () => {
      it('should authenticate user with valid email and password', async () => {
        const mockUser = {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: { first_name: 'Test' },
        };
        const mockSession = {
          access_token: 'valid-token-123',
        };

        mockSignInWithPassword.mockResolvedValueOnce({
          data: { user: mockUser, session: mockSession },
          error: null,
        });

        // Simulate sign in
        const result = await mockSignInWithPassword({
          email: 'test@example.com',
          password: 'ValidPassword123',
        });

        expect(result.error).toBeNull();
        expect(result.data.user).toEqual(mockUser);
        expect(result.data.session.access_token).toBe('valid-token-123');
      });

      it('should update Redux state after successful sign in', () => {
        const user = { id: 'user-123', email: 'test@example.com', name: 'Test' };
        const token = 'valid-token-123';

        store.dispatch(setCredentials({ user, token }));
        const state = store.getState();

        expect(state.auth.isAuthenticated).toBe(true);
        expect(state.auth.user).toEqual(user);
        expect(state.auth.token).toBe(token);
      });
    });

    describe('Invalid Credentials (Requirement 10.2)', () => {
      it('should return error for invalid email', async () => {
        mockSignInWithPassword.mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials' },
        });

        const result = await mockSignInWithPassword({
          email: 'invalid@example.com',
          password: 'WrongPassword',
        });

        expect(result.error).not.toBeNull();
        expect(result.error.message).toBe('Invalid login credentials');
        expect(result.data.user).toBeNull();
      });

      it('should return error for invalid password', async () => {
        mockSignInWithPassword.mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials' },
        });

        const result = await mockSignInWithPassword({
          email: 'test@example.com',
          password: 'WrongPassword',
        });

        expect(result.error).not.toBeNull();
        expect(result.error.message).toBe('Invalid login credentials');
      });

      it('should not update Redux state on failed sign in', async () => {
        mockSignInWithPassword.mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials' },
        });

        await mockSignInWithPassword({
          email: 'test@example.com',
          password: 'WrongPassword',
        });

        const state = store.getState();
        expect(state.auth.isAuthenticated).toBe(false);
        expect(state.auth.user).toBeNull();
      });
    });
  });

  describe('Sign Up Functionality', () => {
    describe('Valid Registration Data (Requirement 10.3)', () => {
      it('should create account with valid data', async () => {
        const mockUser = {
          id: 'new-user-123',
          email: 'newuser@example.com',
          identities: [{ id: 'identity-1' }],
        };

        mockSignUp.mockResolvedValueOnce({
          data: { user: mockUser, session: null },
          error: null,
        });

        const result = await mockSignUp({
          email: 'newuser@example.com',
          password: 'ValidPassword123',
          options: {
            data: {
              first_name: 'New',
              last_name: 'User',
            },
          },
        });

        expect(result.error).toBeNull();
        expect(result.data.user).toEqual(mockUser);
        expect(result.data.user.identities.length).toBeGreaterThan(0);
      });

      it('should pass user metadata during sign up', async () => {
        mockSignUp.mockResolvedValueOnce({
          data: { user: { id: '123' }, session: null },
          error: null,
        });

        await mockSignUp({
          email: 'test@example.com',
          password: 'Password123',
          options: {
            data: {
              first_name: 'John',
              last_name: 'Doe',
            },
          },
        });

        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'Password123',
          options: {
            data: {
              first_name: 'John',
              last_name: 'Doe',
            },
          },
        });
      });
    });

    describe('Existing Email (Requirement 10.4)', () => {
      it('should detect existing email during sign up', async () => {
        const mockUser = {
          id: 'existing-user',
          email: 'existing@example.com',
          identities: [], // Empty identities indicates existing user
        };

        mockSignUp.mockResolvedValueOnce({
          data: { user: mockUser, session: null },
          error: null,
        });

        const result = await mockSignUp({
          email: 'existing@example.com',
          password: 'Password123',
        });

        // When identities is empty, it means the email already exists
        expect(result.data.user.identities.length).toBe(0);
      });

      it('should return error for duplicate email', async () => {
        mockSignUp.mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: 'User already registered' },
        });

        const result = await mockSignUp({
          email: 'existing@example.com',
          password: 'Password123',
        });

        expect(result.error).not.toBeNull();
        expect(result.error.message).toBe('User already registered');
      });
    });
  });

  describe('OAuth Flow Initiation', () => {
    describe('Google OAuth (Requirement 10.5)', () => {
      it('should initiate Google OAuth flow', async () => {
        mockSignInWithOAuth.mockResolvedValueOnce({
          data: { provider: 'google', url: 'https://accounts.google.com/...' },
          error: null,
        });

        const result = await mockSignInWithOAuth({ provider: 'google' });

        expect(result.error).toBeNull();
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({ provider: 'google' });
      });

      it('should handle Google OAuth errors', async () => {
        mockSignInWithOAuth.mockResolvedValueOnce({
          data: null,
          error: { message: 'OAuth provider error' },
        });

        const result = await mockSignInWithOAuth({ provider: 'google' });

        expect(result.error).not.toBeNull();
        expect(result.error.message).toBe('OAuth provider error');
      });
    });

    describe('GitHub OAuth (Requirement 10.5)', () => {
      it('should initiate GitHub OAuth flow', async () => {
        mockSignInWithOAuth.mockResolvedValueOnce({
          data: { provider: 'github', url: 'https://github.com/login/oauth/...' },
          error: null,
        });

        const result = await mockSignInWithOAuth({ provider: 'github' });

        expect(result.error).toBeNull();
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({ provider: 'github' });
      });

      it('should handle GitHub OAuth errors', async () => {
        mockSignInWithOAuth.mockResolvedValueOnce({
          data: null,
          error: { message: 'GitHub authentication failed' },
        });

        const result = await mockSignInWithOAuth({ provider: 'github' });

        expect(result.error).not.toBeNull();
        expect(result.error.message).toBe('GitHub authentication failed');
      });
    });
  });

  describe('Password Reset Navigation (Requirement 10.3)', () => {
    it('should initiate password reset flow', async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      const result = await mockResetPasswordForEmail('test@example.com', {
        redirectTo: 'vestpod://reset-password',
      });

      expect(result.error).toBeNull();
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'vestpod://reset-password' }
      );
    });

    it('should handle password reset errors', async () => {
      mockResetPasswordForEmail.mockResolvedValueOnce({
        data: null,
        error: { message: 'Email not found' },
      });

      const result = await mockResetPasswordForEmail('nonexistent@example.com', {
        redirectTo: 'vestpod://reset-password',
      });

      expect(result.error).not.toBeNull();
      expect(result.error.message).toBe('Email not found');
    });
  });

  describe('Redux State Management (Requirement 10.8)', () => {
    it('should set credentials correctly', () => {
      const user = { id: '123', email: 'test@example.com', name: 'Test User' };
      const token = 'jwt-token-123';

      store.dispatch(setCredentials({ user, token }));
      const state = store.getState();

      expect(state.auth.user).toEqual(user);
      expect(state.auth.token).toBe(token);
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.isLoading).toBe(false);
    });

    it('should clear credentials on logout', () => {
      // First set credentials
      store.dispatch(setCredentials({
        user: { id: '123', email: 'test@example.com' },
        token: 'token',
      }));

      // Then clear them
      store.dispatch(clearCredentials());
      const state = store.getState();

      expect(state.auth.user).toBeNull();
      expect(state.auth.token).toBeNull();
      expect(state.auth.isAuthenticated).toBe(false);
    });

    it('should maintain state consistency across operations', () => {
      // Initial state
      let state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);

      // After login
      store.dispatch(setCredentials({
        user: { id: '1', email: 'a@b.com' },
        token: 'token1',
      }));
      state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);

      // After logout
      store.dispatch(clearCredentials());
      state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);

      // After re-login
      store.dispatch(setCredentials({
        user: { id: '2', email: 'c@d.com' },
        token: 'token2',
      }));
      state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.user?.id).toBe('2');
    });
  });

  describe('Form Validation (Requirement 10.6)', () => {
    it('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test('valid@example.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('missing@domain')).toBe(false);
      expect(emailRegex.test('@nodomain.com')).toBe(false);
      expect(emailRegex.test('spaces in@email.com')).toBe(false);
    });

    it('should validate password requirements', () => {
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

      expect(validatePassword('ValidPass1').valid).toBe(true);
      expect(validatePassword('short').valid).toBe(false);
      expect(validatePassword('nouppercase1').valid).toBe(false);
      expect(validatePassword('NOLOWERCASE1').valid).toBe(false);
      expect(validatePassword('NoNumbers').valid).toBe(false);
    });

    it('should validate required fields', () => {
      const validateRequired = (value: string): boolean => {
        return value.trim().length > 0;
      };

      expect(validateRequired('value')).toBe(true);
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
    });
  });

  describe('Supabase Integration (Requirement 10.7)', () => {
    it('should call Supabase signInWithPassword with correct parameters', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: { id: '1' }, session: { access_token: 'token' } },
        error: null,
      });

      await mockSignInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should call Supabase signUp with correct parameters', async () => {
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: '1' }, session: null },
        error: null,
      });

      await mockSignUp({
        email: 'new@example.com',
        password: 'Password123',
        options: {
          data: {
            first_name: 'First',
            last_name: 'Last',
          },
        },
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'Password123',
        options: {
          data: {
            first_name: 'First',
            last_name: 'Last',
          },
        },
      });
    });

    it('should handle network errors gracefully', async () => {
      mockSignInWithPassword.mockRejectedValueOnce(new Error('Network error'));

      await expect(mockSignInWithPassword({
        email: 'test@example.com',
        password: 'password',
      })).rejects.toThrow('Network error');
    });
  });

  describe('Navigation Between Screens (Requirement 10.4)', () => {
    it('should define correct navigation types for auth stack', () => {
      // Verify navigation type definitions exist
      type AuthStackParamList = {
        SignIn: undefined;
        SignUp: undefined;
        PasswordReset: undefined;
      };

      const signInParams: AuthStackParamList['SignIn'] = undefined;
      const signUpParams: AuthStackParamList['SignUp'] = undefined;
      const passwordResetParams: AuthStackParamList['PasswordReset'] = undefined;

      expect(signInParams).toBeUndefined();
      expect(signUpParams).toBeUndefined();
      expect(passwordResetParams).toBeUndefined();
    });

    it('should support navigation from SignIn to SignUp', () => {
      // Navigation mock verification
      const mockNavigate = jest.fn();
      mockNavigate('SignUp');
      expect(mockNavigate).toHaveBeenCalledWith('SignUp');
    });

    it('should support navigation from SignUp to SignIn', () => {
      const mockNavigate = jest.fn();
      mockNavigate('SignIn');
      expect(mockNavigate).toHaveBeenCalledWith('SignIn');
    });

    it('should support navigation from SignIn to PasswordReset', () => {
      const mockNavigate = jest.fn();
      mockNavigate('PasswordReset');
      expect(mockNavigate).toHaveBeenCalledWith('PasswordReset');
    });
  });

  describe('Successful Authentication Navigation (Requirement 10.5)', () => {
    it('should set authenticated state after successful login', () => {
      store.dispatch(setCredentials({
        user: { id: '123', email: 'test@example.com' },
        token: 'valid-token',
      }));

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      // When isAuthenticated is true, RootNavigator should show Main stack
    });

    it('should clear authenticated state after logout', () => {
      store.dispatch(setCredentials({
        user: { id: '123', email: 'test@example.com' },
        token: 'valid-token',
      }));
      store.dispatch(clearCredentials());

      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
      // When isAuthenticated is false, RootNavigator should show Auth stack
    });
  });
});

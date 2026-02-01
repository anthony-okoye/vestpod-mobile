# Navigation Structure

This directory contains the React Navigation setup for the Investment Portfolio Tracker mobile app.

## Navigation Hierarchy

```
RootNavigator (Stack)
├── Auth Stack (when not authenticated)
│   ├── SignIn
│   ├── SignUp
│   └── PasswordReset
└── Main Tabs (when authenticated)
    ├── Dashboard
    ├── Portfolio
    ├── Assets
    ├── Alerts
    ├── Insights (Premium)
    └── Profile
```

## Files

- **types.ts**: TypeScript type definitions for all navigation stacks and screens
- **RootNavigator.tsx**: Top-level navigator that switches between Auth and Main based on authentication state
- **AuthStack.tsx**: Stack navigator for authentication flow (Sign In, Sign Up, Password Reset)
- **MainTabs.tsx**: Bottom tab navigator for main app screens
- **index.ts**: Central export point for navigation modules

## Usage

The navigation is automatically set up in `App.tsx`. The `RootNavigator` component receives an `isAuthenticated` prop that determines which stack to display.

### Navigation Types

All navigation types are properly typed for TypeScript. Use the screen props types in your components:

```typescript
import { AuthStackScreenProps } from '@/navigation/types';

type Props = AuthStackScreenProps<'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  // navigation is fully typed
  navigation.navigate('SignUp');
}
```

## Testing Navigation

To test navigation between screens:

1. Start the development server: `npm start`
2. Press `i` for iOS simulator or `a` for Android emulator
3. The app will start on the Auth stack (SignIn screen) since `isAuthenticated` is false by default
4. Once authentication is implemented (Tasks 35-38), the app will automatically switch to Main tabs

## Future Tasks

- Task 35-38: Implement authentication screens
- Task 40-67: Implement main app screens
- Task 38: Connect authentication state to Supabase

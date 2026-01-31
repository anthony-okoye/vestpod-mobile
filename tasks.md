# Implementation Plan: Investment Portfolio Tracker

## Overview

This implementation plan breaks down the development into Mobile (React Native) and Backend (Supabase Edge Functions) tasks. Tasks are organized to enable parallel development by separate teams while maintaining clear integration points.

**Development Approach:**
- Mobile and Backend teams can work in parallel
- Integration points are clearly marked
- Checkpoints ensure synchronization between teams
- MVP focuses on core features first, premium features second

---

## PART 1: BACKEND TASKS (Supabase Edge Functions + Database)

### Backend Phase 1: Foundation & Database Setup

- [x] 1. Setup Supabase Project and Database Schema
  - Create Supabase project
  - Define database schema (8 tables: user_profiles, portfolios, assets, price_history, alerts, ai_insights, subscriptions, ai_chat_history)
  - Implement Row Level Security (RLS) policies for all tables
  - Create database indexes for performance
  - Setup database migrations
  - _Requirements: 1, 2, 14_

- [x] 2. Implement Authentication System
  - Configure Supabase Auth (email/password)
  - Setup OAuth providers (Google, Apple)
  - Implement password reset flow
  - Create user profile on signup
  - Test authentication endpoints
  - _Requirements: 1_

- [x] 3. Implement Portfolio CRUD Operations
  - Create Edge Function for portfolio creation
  - Create Edge Function for portfolio read/update/delete
  - Implement default portfolio creation on signup
  - Add portfolio validation logic
  - Test portfolio operations
  - _Requirements: 2_

- [x] 4. Checkpoint - Backend Foundation Complete
  - Ensure all database tables created
  - Ensure RLS policies working
  - Ensure authentication working
  - Ensure portfolio CRUD working
  - Ask user if questions arise

---

### Backend Phase 2: Financial API Integration

- [x] 5. Implement Stock Price API Integration (Massive.com)
  - Create Massive.com API client
  - Implement stock quote fetching
  - Implement historical data fetching
  - Add error handling and retry logic
  - Test with multiple stock symbols
  - _Requirements: 3, 5_

- [x] 6. Implement Backup Stock API (Alpha Vantage)
  - Create Alpha Vantage API client
  - Implement fallback logic when Massive.com fails
  - Add rate limit tracking
  - Test fallback mechanism
  - _Requirements: 3, 5_

- [x] 7. Implement Cryptocurrency API Integration (CoinGecko)
  - Create CoinGecko API client
  - Implement crypto price fetching
  - Implement symbol-to-ID mapping
  - Add batch price fetching
  - Test with multiple cryptocurrencies
  - _Requirements: 3, 5_

- [x] 8. Implement Commodities API Integration (Metals-API)
  - Create Metals-API client
  - Implement commodity price fetching (Gold, Silver, Platinum, Palladium)
  - Add rate limit management (50 calls/month)
  - Test commodity price updates
  - _Requirements: 3, 5_

- [x] 9. Implement Forex API Integration (ExchangeRate-API)
  - Create ExchangeRate-API client
  - Implement currency rate fetching
  - Implement currency conversion logic
  - Test with multiple currencies
  - _Requirements: 5, 12_

- [x] 10. Checkpoint - Financial APIs Integrated
  - Ensure all APIs working
  - Ensure fallback logic working
  - Ensure rate limits respected
  - Ask user if questions arise

---

### Backend Phase 3: Asset Management & Price Updates

- [x] 11. Implement Asset CRUD Operations
  - Create Edge Function for asset creation (listed and non-listed)
  - Create Edge Function for asset read/update/delete
  - Implement asset validation logic
  - Add support for asset metadata (JSONB)
  - Test asset operations
  - _Requirements: 3, 4_

- [x] 12. Implement Automated Price Update Job
  - Create Edge Function for scheduled price updates
  - Implement batch price fetching for all user assets
  - Add premium vs free user update frequency logic (5 min vs 15 min)
  - Store price history for charts
  - Setup cron trigger (every 5 minutes)
  - Test price update job
  - _Requirements: 5, 15_

- [x] 13. Implement Real-time Price Broadcasting
  - Setup Supabase Realtime channels
  - Broadcast price updates to connected clients
  - Test real-time updates with mobile app
  - _Requirements: 5_

- [x] 14. Checkpoint - Asset Management Complete
  - Ensure asset CRUD working
  - Ensure price updates running
  - Ensure real-time updates working
  - Ask user if questions arise

---

### Backend Phase 4: Alerts & Notifications

- [x] 15. Implement Alert System
  - Create Edge Function for alert CRUD operations
  - Implement alert condition checking logic (price target, percentage change, maturity reminder)
  - Add free user alert limit (3 alerts)
  - Test alert creation and updates
  - _Requirements: 7_

- [x] 16. Implement Alert Checker Job
  - Create Edge Function for scheduled alert checking
  - Implement condition evaluation for all alert types
  - Add push notification sending
  - Setup cron trigger (every 5 minutes)
  - Test alert triggering
  - _Requirements: 7_

- [x] 17. Checkpoint - Alerts Complete
  - Ensure alert CRUD working
  - Ensure alert checking working
  - Ensure notifications sending
  - Ask user if questions arise

---

### Backend Phase 5: AI Integration (Gemini 3)

- [x] 18. Implement Gemini 3 API Client
  - Setup Gemini 3 Pro API client
  - Implement authentication
  - Create helper functions for API calls
  - Test basic API connectivity
  - _Requirements: 8, 9_

- [x] 19. Implement AI Portfolio Analysis
  - Create Edge Function for portfolio analysis
  - Implement risk score calculation
  - Implement geographic exposure analysis
  - Implement sector exposure analysis
  - Generate AI recommendations
  - Test with sample portfolios
  - _Requirements: 8_

- [x] 20. Implement Daily AI Insights Job
  - Create Edge Function for daily insight generation
  - Fetch all premium users
  - Generate insights for each user
  - Store insights in database
  - Send push notifications for critical insights
  - Setup cron trigger (daily at 6 AM)
  - Test insight generation
  - _Requirements: 8_

- [x] 21. Implement AI Conversational Assistant
  - Create Edge Function for chat message handling
  - Implement conversation context management
  - Add portfolio context to prompts
  - Generate contextual responses
  - Store chat history
  - Test conversation flow
  - _Requirements: 9_

- [x] 22. Checkpoint - AI Features Complete
  - Ensure portfolio analysis working
  - Ensure daily insights generating
  - Ensure chat assistant working
  - Ask user if questions arise

---

### Backend Phase 6: Subscription & Premium Features

- [x] 23. Implement RevenueCat Webhook Handler
  - Create Edge Function for RevenueCat webhooks
  - Implement webhook signature verification
  - Handle subscription events (purchase, renewal, cancellation, expiration)
  - Update subscription status in database
  - Test webhook handling
  - _Requirements: 10_

- [x] 24. Implement Subscription Status Checker
  - Create helper function to check premium status
  - Implement feature access control logic
  - Add subscription expiration handling
  - Test premium feature gating
  - _Requirements: 10_

- [x] 25. Implement Data Export
  - Create Edge Function for data export
  - Implement CSV export generation
  - Implement JSON export generation
  - Implement PDF export generation
  - Store exports in Supabase Storage
  - Test export generation
  - _Requirements: 11_

- [x] 26. Checkpoint - Subscription Features Complete
  - Ensure webhook handling working
  - Ensure premium status checking working
  - Ensure data export working
  - Ask user if questions arise

---

### Backend Phase 7: User Profile & Settings

- [x] 27. Implement User Profile Management
  - Create Edge Function for profile updates
  - Implement avatar upload to Supabase Storage
  - Add currency preference handling
  - Add language preference handling
  - Test profile updates
  - _Requirements: 12_

- [x] 28. Implement Account Deletion
  - Create Edge Function for account deletion
  - Implement cascade deletion of all user data
  - Add confirmation logic
  - Test account deletion
  - _Requirements: 12, 14_

- [x] 29. Final Backend Checkpoint
  - Ensure all Edge Functions deployed
  - Ensure all cron jobs running
  - Ensure all APIs integrated
  - Run end-to-end backend tests
  - Ask user if questions arise

---

## PART 2: MOBILE TASKS (React Native - iOS + Android)

### Mobile Phase 1: Project Setup & Navigation

- [x] 30. Setup React Native Project insided folder called mobile on the same level as  backend folder.
  - Initialize React Native project with TypeScript
  - Setup folder structure (screens, components, services, utils)
  - Configure ESLint and Prettier
  - Setup environment variables (.env)
  - Configure iOS and Android builds
  - _Requirements: All_

- [ ] 31. Setup Navigation
  - Install React Navigation 6
  - Configure stack navigator for authentication flow
  - Configure tab navigator for main app
  - Setup navigation types (TypeScript)
  - Test navigation between screens
  - _Requirements: All_

- [ ] 32. Setup State Management
  - Install Redux Toolkit
  - Configure Redux store
  - Setup RTK Query for API calls
  - Create slices for auth, portfolio, assets
  - Test state management
  - _Requirements: All_

- [ ] 33. Setup Supabase Client
  - Install @supabase/supabase-js
  - Configure Supabase client with API keys
  - Create API service layer
  - Test Supabase connectivity
  - _Requirements: All_

- [ ] 34. Checkpoint - Mobile Foundation Complete
  - Ensure project builds on iOS and Android
  - Ensure navigation working
  - Ensure state management working
  - Ensure Supabase client working
  - Ask user if questions arise

---

### Mobile Phase 2: Authentication Screens

- [ ] 35. Implement Sign Up Screen
  - Create sign up UI (email, password, confirm password)
  - Add form validation
  - Integrate with Supabase Auth
  - Add error handling
  - Test sign up flow
  - _Requirements: 1_

- [ ] 36. Implement Sign In Screen
  - Create sign in UI (email, password)
  - Add "Forgot Password" link
  - Integrate with Supabase Auth
  - Add OAuth buttons (Google, Apple)
  - Test sign in flow
  - _Requirements: 1_

- [ ] 37. Implement Password Reset Screen
  - Create password reset UI
  - Integrate with Supabase Auth
  - Add success/error messages
  - Test password reset flow
  - _Requirements: 1_

- [ ] 38. Implement Secure Token Storage
  - Setup secure storage (react-native-keychain or expo-secure-store)
  - Store authentication tokens securely
  - Implement auto-login on app launch
  - Test token persistence
  - _Requirements: 1, 14_

- [ ] 39. Checkpoint - Authentication Complete
  - Ensure sign up working
  - Ensure sign in working
  - Ensure password reset working
  - Ensure tokens stored securely
  - Ask user if questions arise

---

### Mobile Phase 3: Dashboard & Portfolio Screens

- [ ] 40. Implement Dashboard Screen
  - Create dashboard UI layout
  - Display total portfolio value
  - Display today's change (value and percentage)
  - Add time period selector (1D, 1W, 1M, 3M, 1Y, ALL)
  - Integrate with backend API
  - Test dashboard data loading
  - _Requirements: 6_

- [ ] 41. Implement Portfolio Value Chart
  - Install charting library (react-native-chart-kit or Victory Native)
  - Create interactive line chart component
  - Fetch price history from backend
  - Add touch interactions (show value on tap)
  - Test chart rendering and interactions
  - _Requirements: 6_

- [ ] 42. Implement Asset Allocation Chart
  - Create donut/pie chart component
  - Calculate asset allocation by type
  - Add legend with percentages
  - Test chart rendering
  - _Requirements: 6_

- [ ] 43. Implement Quick Stats Cards
  - Create horizontal scrollable card list
  - Display best performer card
  - Display worst performer card
  - Display upcoming maturity card
  - Display risk score card (premium badge)
  - Test card interactions
  - _Requirements: 6_

- [ ] 44. Implement Portfolio List Screen
  - Create portfolio list UI
  - Display all user portfolios
  - Add create portfolio button
  - Add edit/delete portfolio actions
  - Integrate with backend API
  - Test portfolio CRUD operations
  - _Requirements: 2_

- [ ] 45. Checkpoint - Dashboard Complete
  - Ensure dashboard displaying correctly
  - Ensure charts rendering
  - Ensure portfolio list working
  - Ask user if questions arise

---

### Mobile Phase 4: Asset Management Screens

- [ ] 46. Implement Asset List Screen
  - Create asset list UI with search and filters
  - Display all assets in selected portfolio
  - Add asset type filter chips
  - Add sort options (value, performance, name)
  - Show asset cards with current price and performance
  - Test asset list rendering
  - _Requirements: 3, 4_

- [ ] 47. Implement Add Asset Flow (Listed Assets)
  - Create asset type selection screen
  - Create ticker symbol search screen
  - Implement auto-complete for symbols
  - Create asset details form (quantity, purchase price, date)
  - Integrate with backend API
  - Test asset addition
  - _Requirements: 3_

- [ ] 48. Implement Add Asset Flow (Non-Listed Assets)
  - Create manual asset entry form
  - Add fields for name, value, purchase date
  - Add conditional fields (maturity date for fixed income, address for real estate)
  - Integrate with backend API
  - Test non-listed asset addition
  - _Requirements: 4_

- [ ] 49. Implement Asset Detail Screen
  - Create asset detail UI
  - Display current price, total value, gain/loss
  - Add performance chart
  - Add key metrics section
  - Add edit/delete actions
  - Test asset detail display
  - _Requirements: 3, 4_

- [ ] 50. Implement Real-time Price Updates
  - Setup Supabase Realtime subscription
  - Subscribe to price updates for user assets
  - Update UI when prices change
  - Add "Last updated" timestamp
  - Test real-time updates
  - _Requirements: 5_

- [ ] 51. Checkpoint - Asset Management Complete
  - Ensure asset list working
  - Ensure add asset flow working
  - Ensure asset details working
  - Ensure real-time updates working
  - Ask user if questions arise

---

### Mobile Phase 5: Alerts & Notifications

- [ ] 52. Implement Alerts Screen
  - Create alerts list UI
  - Display all active alerts
  - Add create alert button
  - Add edit/delete alert actions
  - Test alerts list
  - _Requirements: 7_

- [ ] 53. Implement Create Alert Flow
  - Create alert type selection screen
  - Create alert condition form (price target, percentage, maturity)
  - Add asset selection
  - Integrate with backend API
  - Test alert creation
  - _Requirements: 7_

- [ ] 54. Setup Push Notifications
  - Install push notification library (react-native-push-notification or Expo Notifications)
  - Configure iOS and Android push notification setup
  - Request notification permissions
  - Handle notification taps
  - Test push notifications
  - _Requirements: 7_

- [ ] 55. Checkpoint - Alerts Complete
  - Ensure alerts list working
  - Ensure alert creation working
  - Ensure push notifications working
  - Ask user if questions arise

---

### Mobile Phase 6: Premium Features (AI Insights & Chat)

- [ ] 56. Implement Premium Paywall
  - Create paywall modal component
  - Display premium features list
  - Add subscription options (monthly, annual)
  - Add "Start Free Trial" button
  - Test paywall display
  - _Requirements: 10_

- [ ] 57. Implement RevenueCat Integration
  - Install react-native-purchases
  - Configure RevenueCat with API keys
  - Implement purchase flow
  - Implement restore purchases
  - Test subscription purchase
  - _Requirements: 10_

- [ ] 58. Implement Insights Screen (Premium)
  - Create insights screen UI
  - Display portfolio health score with gauge
  - Display risk analysis section
  - Display geographic exposure chart
  - Display sector exposure chart
  - Display AI recommendation cards
  - Add paywall for free users
  - Test insights display
  - _Requirements: 8_

- [ ] 59. Implement AI Chat Screen (Premium)
  - Create chat UI with message bubbles
  - Add text input and send button
  - Add voice input button (optional)
  - Display suggested questions
  - Integrate with backend chat API
  - Add paywall for free users
  - Test chat functionality
  - _Requirements: 9_

- [ ] 60. Implement Feature Gating
  - Create helper function to check premium status
  - Gate AI insights screen
  - Gate AI chat screen
  - Gate unlimited alerts
  - Gate data export
  - Test feature gating
  - _Requirements: 10_

- [ ] 61. Checkpoint - Premium Features Complete
  - Ensure paywall working
  - Ensure RevenueCat integration working
  - Ensure insights screen working
  - Ensure chat screen working
  - Ensure feature gating working
  - Ask user if questions arise

---

### Mobile Phase 7: Profile & Settings

- [ ] 62. Implement Profile Screen
  - Create profile UI with avatar, name, email
  - Display subscription status
  - Add edit profile button
  - Add settings sections (preferences, data, support, legal)
  - Test profile display
  - _Requirements: 12_

- [ ] 63. Implement Edit Profile Screen
  - Create edit profile form
  - Add avatar upload
  - Add name and phone fields
  - Integrate with backend API
  - Test profile updates
  - _Requirements: 12_

- [ ] 64. Implement Settings Screens
  - Create currency selection modal
  - Create language selection modal
  - Add notification toggle
  - Add dark mode toggle
  - Add default chart view selector
  - Test settings updates
  - _Requirements: 12_

- [ ] 65. Implement Data Export
  - Create export modal with format selection
  - Integrate with backend export API
  - Handle file download/sharing
  - Test data export
  - _Requirements: 11_

- [ ] 66. Implement Account Deletion
  - Create account deletion confirmation modal
  - Add "DELETE" text confirmation
  - Integrate with backend API
  - Test account deletion
  - _Requirements: 12_

- [ ] 67. Checkpoint - Profile Complete
  - Ensure profile screen working
  - Ensure settings working
  - Ensure data export working
  - Ensure account deletion working
  - Ask user if questions arise

---

### Mobile Phase 8: Offline Mode & Polish

- [ ] 68. Implement Offline Mode
  - Setup local data caching (AsyncStorage or MMKV)
  - Cache portfolio data
  - Detect offline status
  - Display "Last updated" timestamp when offline
  - Queue changes for sync when online
  - Test offline functionality
  - _Requirements: 13_

- [ ] 69. Implement Data Sync
  - Implement sync logic on reconnection
  - Handle conflict resolution
  - Add sync status indicator
  - Test data synchronization
  - _Requirements: 13_

- [ ] 70. Implement Loading States
  - Add skeleton screens for all data loading
  - Add shimmer effects
  - Add pull-to-refresh on lists
  - Test loading states
  - _Requirements: 15_

- [ ] 71. Implement Error Handling
  - Add error boundaries
  - Create error display components
  - Add retry buttons
  - Add user-friendly error messages
  - Test error scenarios
  - _Requirements: All_

- [ ] 72. Implement Dark Mode
  - Create theme system
  - Add light and dark color schemes
  - Implement theme switching
  - Test dark mode on all screens
  - _Requirements: 12_

- [ ] 73. Final Mobile Checkpoint
  - Ensure all screens working
  - Ensure offline mode working
  - Ensure error handling working
  - Run end-to-end mobile tests
  - Ask user if questions arise

---

## PART 3: INTEGRATION & TESTING

### Integration Phase

- [ ] 74. End-to-End Integration Testing
  - Test complete user flows (sign up → add assets → view insights)
  - Test mobile ↔ backend communication
  - Test real-time updates
  - Test push notifications
  - Test subscription flow
  - Fix any integration issues
  - _Requirements: All_

- [ ] 75. Performance Testing
  - Test app performance with 1000 assets
  - Test price update job performance
  - Test AI insight generation performance
  - Optimize slow queries
  - Test on low-end devices
  - _Requirements: 15_

- [ ] 76. Security Testing
  - Test authentication security
  - Test RLS policies
  - Test API key protection
  - Test data encryption
  - Fix security vulnerabilities
  - _Requirements: 14_

- [ ] 77. Final Checkpoint - Ready for Submission
  - Ensure all features working
  - Ensure both iOS and Android builds working
  - Ensure backend deployed and stable
  - Create demo video
  - Prepare written proposal
  - Submit to hackathons

---

## Notes

**Task Organization:**
- **Backend Tasks:** 1-29 (Supabase Edge Functions, Database, APIs)
- **Mobile Tasks:** 30-73 (React Native, UI/UX, Client Logic)
- **Integration Tasks:** 74-77 (End-to-End Testing)

**Parallel Development:**
- Backend and Mobile teams can work simultaneously
- Integration points are clearly marked
- Checkpoints ensure synchronization

**MVP Priority:**
- Core features (Tasks 1-51): Authentication, Portfolio, Assets, Dashboard
- Premium features (Tasks 52-67): Alerts, AI, Subscriptions, Profile
- Polish (Tasks 68-77): Offline, Testing, Integration

**Estimated Timeline:**
- Week 1: Backend Phase 1-3, Mobile Phase 1-2 (Foundation)
- Week 2: Backend Phase 4-5, Mobile Phase 3-4 (Core Features)
- Week 3: Backend Phase 6-7, Mobile Phase 5-6 (Premium Features)
- Week 4: Mobile Phase 7-8, Integration & Testing (Polish & Submit)

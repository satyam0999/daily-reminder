# Implementation Plan: Personal Goal Tracker

## Overview

This implementation plan breaks down the Personal Goal Tracker into incremental coding tasks. Each task builds on previous work, starting with project setup and authentication, then progressing through core features. The tech stack is React with Vite, Tailwind CSS, Supabase, and SendGrid.

## Tasks

- [x] 1. Project Setup and Configuration
  - [x] 1.1 Initialize React project with Vite and install dependencies
    - Create Vite React project
    - Install: @supabase/supabase-js, react-router-dom, tailwindcss, postcss, autoprefixer
    - Configure Tailwind CSS with tailwind.config.js and postcss.config.js
    - Add Tailwind directives to index.css
    - _Requirements: 9.3_

  - [x] 1.2 Create Supabase client utility
    - Create src/utils/supabaseClient.js
    - Initialize Supabase client with environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
    - Export configured client
    - _Requirements: 8.1, 8.2_

  - [x] 1.3 Set up project file structure
    - Create directories: src/components, src/pages, src/context, src/utils
    - Create placeholder files for all components and pages
    - _Requirements: 9.1_

- [x] 2. Authentication System
  - [x] 2.1 Create AuthContext for state management
    - Create src/context/AuthContext.jsx
    - Implement AuthProvider with user, session, and loading state
    - Add signIn, signOut methods using Supabase Auth
    - Set up onAuthStateChange listener
    - Export useAuth hook
    - _Requirements: 1.2, 1.4_

  - [x] 2.2 Build Login page
    - Create src/pages/Login.jsx
    - Add email and password input fields with controlled state
    - Implement form submission calling signInWithPassword
    - Display error messages for invalid credentials
    - Redirect to dashboard on successful login
    - _Requirements: 1.2, 1.3_

  - [x] 2.3 Create ProtectedRoute component
    - Create src/components/ProtectedRoute.jsx
    - Check authentication status from AuthContext
    - Redirect to /login if not authenticated
    - Render children if authenticated
    - Show loading state while checking auth
    - _Requirements: 1.1, 1.5_

  - [x] 2.4 Set up routing in App.jsx
    - Configure React Router with BrowserRouter
    - Define routes: /, /goals, /history, /settings, /login
    - Wrap protected routes with ProtectedRoute component
    - Wrap app with AuthProvider
    - _Requirements: 9.1, 9.2_

  - [ ]* 2.5 Write property test for authentication state consistency
    - **Property 1: Authentication State Consistency**
    - Test that authenticated users can access protected routes
    - Test that unauthenticated users are redirected to login
    - **Validates: Requirements 1.1, 1.4, 1.5**

- [x] 3. Navigation and Layout
  - [x] 3.1 Build Navbar component
    - Create src/components/Navbar.jsx
    - Add navigation links: Dashboard, Goals, History, Settings
    - Add Logout button calling signOut from AuthContext
    - Style with Tailwind (gray background, white text)
    - _Requirements: 9.1, 9.2, 1.4_

- [x] 4. Checkpoint - Authentication Complete
  - Ensure login/logout works correctly
  - Verify protected routes redirect properly
  - Ask user if questions arise

- [x] 5. Goal Management Feature
  - [x] 5.1 Implement goal creation form
    - Create src/pages/GoalManagement.jsx
    - Add text input for goal description
    - Add radio buttons for type (daily, weekly, monthly)
    - Implement submit handler to insert goal into Supabase
    - Clear form after successful submission
    - _Requirements: 2.1_

  - [x] 5.2 Build GoalList component
    - Create src/components/GoalList.jsx
    - Fetch active goals from Supabase on mount
    - Display each goal with text and type badge
    - Style badges: blue for daily, green for weekly, purple for monthly
    - _Requirements: 2.2, 2.6_

  - [x] 5.3 Add edit functionality to goals
    - Add edit button to each goal in GoalList
    - Implement inline editing with text input
    - Save edited goal_text to Supabase on confirm
    - Cancel editing on escape or cancel button
    - _Requirements: 2.3, 2.4_

  - [x] 5.4 Add delete functionality to goals
    - Add delete button to each goal in GoalList
    - Implement soft delete (set is_active = false)
    - Remove goal from displayed list after deletion
    - _Requirements: 2.5_

  - [ ]* 5.5 Write property test for goal creation persistence
    - **Property 2: Goal Creation Persistence**
    - Generate random goal text and valid types
    - Verify created goals appear in active goals list
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 5.6 Write property test for soft delete preservation
    - **Property 3: Soft Delete Preservation**
    - Delete goals and verify they remain in database with is_active=false
    - Verify deleted goals don't appear in active goals list
    - **Validates: Requirements 2.5**

  - [ ]* 5.7 Write property test for active goals filtering
    - **Property 10: Active Goals Filtering**
    - Generate mix of active and inactive goals
    - Verify query results only include is_active=true goals
    - **Validates: Requirements 2.2, 2.5**

  - [ ]* 5.8 Write property test for goal type badge color mapping
    - **Property 12: Goal Type Badge Color Mapping**
    - Generate goals with all three types
    - Verify color mapping: daily→blue, weekly→green, monthly→purple
    - **Validates: Requirements 2.6**

- [x] 6. Checkpoint - Goal Management Complete
  - Ensure goals can be created, edited, and deleted
  - Verify badge colors display correctly
  - Ask user if questions arise

- [x] 7. Dashboard and Daily Tracking
  - [x] 7.1 Build GoalCheckbox component
    - Create src/components/GoalCheckbox.jsx
    - Accept props: goal, isChecked, onToggle
    - Render checkbox with goal text label
    - Display type badge with correct color
    - Call onToggle when checkbox clicked
    - _Requirements: 3.1, 2.6_

  - [x] 7.2 Implement Dashboard page structure
    - Create src/pages/Dashboard.jsx
    - Display current date prominently
    - Create three sections for daily, weekly, monthly goals
    - Fetch active goals and filter by type
    - Style with Tailwind white cards on gray background
    - _Requirements: 9.4, 9.5, 3.1_

  - [x] 7.3 Implement check-in loading and saving
    - Fetch today's check_in record on Dashboard mount
    - Initialize completedGoalIds state from check_in data
    - Implement toggleGoalCompletion function
    - Upsert check_in record when goal toggled
    - Create new check_in if none exists for today
    - _Requirements: 3.2, 3.3, 3.5_

  - [x] 7.4 Add completion statistics display
    - Calculate completed goals count vs total goals
    - Display "You completed X/Y goals today" message
    - Update stats when goals are toggled
    - _Requirements: 3.4_

  - [ ]* 7.5 Write property test for check-in upsert idempotence
    - **Property 4: Check-in Upsert Idempotence**
    - Upsert same check-in data multiple times
    - Verify only one record exists per date
    - **Validates: Requirements 3.2, 3.5**

  - [ ]* 7.6 Write property test for goal completion toggle consistency
    - **Property 5: Goal Completion Toggle Consistency**
    - Toggle goals multiple times
    - Verify set semantics (no duplicates in completed_goal_ids)
    - **Validates: Requirements 3.2**

  - [ ]* 7.7 Write property test for completion percentage accuracy
    - **Property 8: Completion Percentage Accuracy**
    - Generate random completed/total counts
    - Verify formula: (completed / total) × 100
    - **Validates: Requirements 3.4, 5.3**

- [x] 8. Journal Entry Feature
  - [x] 8.1 Build JournalEntry component
    - Create src/components/JournalEntry.jsx
    - Add textarea with controlled state
    - Add "Save Journal" button
    - Accept initialValue and onSave props
    - _Requirements: 4.1_

  - [x] 8.2 Integrate journal with Dashboard
    - Add JournalEntry component to Dashboard
    - Load existing journal_entry from today's check_in
    - Implement save handler to upsert check_in with journal text
    - Create check_in record if none exists
    - _Requirements: 4.2, 4.3, 4.4_

  - [ ]* 8.3 Write property test for journal entry persistence
    - **Property 6: Journal Entry Persistence**
    - Save journal entries and reload
    - Verify text is retrievable for the same date
    - **Validates: Requirements 4.2, 4.3**

- [x] 9. Checkpoint - Dashboard Complete
  - Ensure goal checkboxes work and persist
  - Verify journal saves correctly
  - Verify completion stats update
  - Ask user if questions arise

- [x] 10. History Feature
  - [x] 10.1 Build History page with date picker
    - Create src/pages/History.jsx
    - Add date input for selecting past dates
    - Initialize with today's date
    - Style with Tailwind
    - _Requirements: 5.1_

  - [x] 10.2 Implement historical data display
    - Fetch check_in for selected date
    - Display list of completed goals
    - Display journal entry from that date
    - Show "No data" message if no check_in exists
    - _Requirements: 5.1, 5.2, 5.4_

  - [x] 10.3 Add completion percentage to History
    - Calculate percentage: (completed / total active goals) × 100
    - Display percentage for selected date
    - Handle edge case of zero goals
    - _Requirements: 5.3_

  - [ ]* 10.4 Write property test for historical data integrity
    - **Property 7: Historical Data Integrity**
    - Save check-in data, then retrieve for same date
    - Verify completed goals and journal match exactly
    - **Validates: Requirements 5.1, 5.2**

- [x] 11. Settings Feature
  - [x] 11.1 Build Settings page
    - Create src/pages/Settings.jsx
    - Add time input for email_time preference
    - Add save button
    - Display current settings on load
    - _Requirements: 6.1_

  - [x] 11.2 Implement settings persistence
    - Fetch user_settings on mount
    - Upsert settings when save clicked
    - Display success confirmation after save
    - _Requirements: 6.2, 6.3_

  - [ ]* 11.3 Write property test for email time configuration persistence
    - **Property 9: Email Time Configuration Persistence**
    - Save various valid time strings
    - Verify they are retrievable from user_settings
    - **Validates: Requirements 6.2, 6.3**

- [x] 12. Checkpoint - Core Features Complete
  - Ensure all pages work correctly
  - Verify data persists across sessions
  - Ask user if questions arise

- [x] 13. Email System (Supabase Edge Function)
  - [x] 13.1 Create edge function structure
    - Create supabase/functions/send-daily-email/index.ts
    - Set up Deno imports for Supabase client and SendGrid
    - Configure environment variables access
    - _Requirements: 7.1_

  - [x] 13.2 Implement email function logic
    - Query user_settings for email preferences
    - Fetch all active goals from database
    - Group goals by type (daily, weekly, monthly)
    - _Requirements: 7.2, 7.3_

  - [x] 13.3 Build email HTML template
    - Create greeting with current date
    - List daily goals section
    - List weekly goals section
    - List monthly goals section
    - Add direct link to dashboard
    - _Requirements: 7.3, 7.5, 7.6_

  - [x] 13.4 Integrate SendGrid API
    - Configure SendGrid client with API key
    - Send formatted email to user's email address
    - Handle success and error responses
    - _Requirements: 7.4_

  - [ ]* 13.5 Write property test for email content completeness
    - **Property 13: Email Content Completeness**
    - Generate various goal configurations
    - Verify email contains all required sections
    - **Validates: Requirements 7.3, 7.5**

- [x] 14. Database Setup Scripts
  - [x] 14.1 Create SQL migration scripts
    - Create goals table with all fields and constraints
    - Create check_ins table with unique constraint on (user_id, check_in_date)
    - Create user_settings table
    - Add RLS policies for all tables
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 14.2 Write property test for check-in date uniqueness
    - **Property 15: Check-in Date Uniqueness**
    - Attempt to create multiple check-ins for same date
    - Verify constraint prevents duplicates
    - **Validates: Requirements 8.1, 8.2**

- [x] 15. Final Integration and Polish
  - [x] 15.1 Add error handling throughout
    - Add try-catch blocks to all Supabase operations
    - Log errors to console
    - Display user-friendly error messages
    - _Requirements: 8.3_

  - [x] 15.2 Implement timezone handling
    - Store dates in UTC format
    - Convert to user timezone for display
    - Handle timezone in email function
    - _Requirements: 8.4, 8.5_

  - [ ]* 15.3 Write property test for date storage UTC consistency
    - **Property 11: Date Storage UTC Consistency**
    - Store dates and verify UTC format in database
    - Verify display conversion preserves underlying value
    - **Validates: Requirements 8.4, 8.5**

  - [ ]* 15.4 Write property test for navigation link accessibility
    - **Property 14: Navigation Link Accessibility**
    - Verify all navigation links are present for authenticated users
    - Verify each link navigates to correct route
    - **Validates: Requirements 9.1, 9.2**

- [x] 16. Final Checkpoint
  - Run all tests and ensure they pass
  - Verify complete user flow works end-to-end
  - Ask user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation uses JavaScript/JSX for React components and TypeScript for the Supabase Edge Function

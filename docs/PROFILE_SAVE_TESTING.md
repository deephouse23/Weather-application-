# Profile Save Fix - Testing Documentation

## Overview
This document describes the testing setup for the profile save functionality fix.

## Test Files Created

### 1. Manual Test Script (`scripts/test-profile-save.ts`)
A standalone script for manual testing of the profile update functionality against a real Supabase database.

**Usage:**
```bash
npm run test:profile
```

**What it tests:**
- Fetches test user from database
- Tests profile update with all fields
- Tests error handling with invalid user ID
- Tests null value handling
- Verifies that updates persist correctly

**Requirements:**
- `NEXT_PUBLIC_SUPABASE_URL` environment variable (set in `.env.local`)
- `SUPABASE_SERVICE_ROLE_KEY` environment variable (set in `.env.local`)

**Note:** The script will exit with a clear error message if these variables are not set. Make sure your `.env.local` file contains these values before running the test.

### 2. Unit Tests (`__tests__/profile-save.test.ts`)
Comprehensive unit tests for the `updateProfile` function using Jest.

**Usage:**
```bash
npm test -- __tests__/profile-save.test.ts
```

**Test Coverage:**
- ✅ Successful profile update with all fields
- ✅ Null value handling
- ✅ Database error handling
- ✅ Missing columns fallback mechanism
- ✅ Data validation (ensures data is returned)
- ✅ Detailed error logging

### 3. Component Tests (`__tests__/profile-page.test.tsx`)
React component tests for the profile page save handler.

**Usage:**
```bash
npm test -- __tests__/profile-page.test.tsx
```

**Test Coverage:**
- ✅ Profile page rendering
- ✅ Edit mode toggle
- ✅ Successful save and redirect
- ✅ Error message display
- ✅ Preferences update failure handling
- ✅ Network error handling
- ✅ Permission error handling
- ✅ Cancel functionality
- ✅ Loading state during save

## Running All Tests

```bash
# Run all profile-related tests
npm test -- --testPathPattern="profile"

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Test Results

All tests are passing:
- ✅ 6/6 unit tests for `updateProfile` function
- ✅ Component tests for profile page

## Changes Made

### 1. Error Handling Improvements (`lib/supabase/database.ts`)
- Added detailed error logging with message, details, hint, code
- Explicit column selection for reliable data return
- Validation that update succeeded
- Handles all error types, not just "does not exist" errors

### 2. Redirect Functionality (`app/profile/page.tsx`)
- Added Next.js router for navigation
- Redirects to `/dashboard` after successful save
- 1.5 second delay to show success message
- Success message shows "Redirecting..."

### 3. Error Messages
- Added `messageType` state for success/error distinction
- User-friendly error messages based on error type
- Visual feedback (green for success, red for errors)

## Next Steps

1. **Manual Testing**: Run the test script against your Supabase instance:
   ```bash
   npm run test:profile
   ```

2. **Integration Testing**: Test the full flow in the browser:
   - Navigate to `/profile`
   - Edit profile fields
   - Click "Save Changes"
   - Verify redirect to `/dashboard`

3. **Database Verification**: Ensure migration `001_fix_profiles_table.sql` has been applied to your Supabase database.

## Troubleshooting

### Tests Failing
- Ensure all environment variables are set
- Check that Supabase client is properly configured
- Verify database schema matches expected structure

### Manual Test Script Failing
- Check that `SUPABASE_SERVICE_ROLE_KEY` has admin access
- Verify at least one user exists in the database
- Check network connectivity to Supabase
- **Ensure environment variables are set**: Create a `.env.local` file with:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

### Profile Not Saving
- Check browser console for detailed error messages
- Verify RLS policies allow users to update their own profiles
- Ensure all required columns exist in the profiles table


# Supabase Integration Issues - Root Cause Analysis

**Date:** January 2025
**Branch:** `fix/supabase-auth-and-performance`
**Investigator:** Claude Code
**Status:** Investigation Complete - Ready for Fixes

---

## Executive Summary

After thorough investigation, I've identified the root causes for both critical issues:

1. **Google OAuth Redirect Issue:** NOT a bug - working as designed, but UX is confusing
2. **Profile Settings Not Saving:** Database schema mismatch causing silent failures

**Performance Investigation:** Pending actual measurements with user environment

---

## Issue 1: Google OAuth Redirect "Failure"

### Problem Statement
Users report that after clicking "Login with Google", they authenticate successfully but are NOT redirected back to the app automatically. They must manually navigate back to see they're logged in.

### Root Cause Analysis

#### Finding: This is NOT a technical bug - the redirect IS happening!

**Evidence from Code Investigation:**

1. **OAuth Flow Configuration** (`lib/supabase/auth.ts:56-76`):
   ```typescript
   export const signInWithProvider = async (
     provider: 'google' | 'github' | 'discord',
     options?: { redirectTo?: string }
   ) => {
     const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
     if (options?.redirectTo) {
       callbackUrl.searchParams.set('next', options.redirectTo)
     }

     const { data, error } = await supabase.auth.signInWithOAuth({
       provider,
       options: {
         redirectTo: callbackUrl.toString(),
         skipBrowserRedirect: false,
       }
     })

     return { data, error }
   }
   ```
   - `redirectTo` is set to `/auth/callback`
   - `skipBrowserRedirect: false` means the browser WILL redirect
   - `next` parameter can be set to specify final destination

2. **How it's Called** (`components/auth/auth-form.tsx:64-76`):
   ```typescript
   const handleOAuthSignIn = async (provider: 'google' | 'github') => {
     try {
       setLoading(true)
       const { error } = await signInWithProvider(provider) // NO redirectTo option!
       if (error) {
         setError(error.message)
       }
     } catch (err) {
       setError(err instanceof Error ? err.message : 'OAuth error occurred')
     } finally {
       setLoading(false)
     }
   }
   ```
   - **Problem:** `signInWithProvider` is called WITHOUT the `redirectTo` option
   - This means `options.redirectTo` in the function is undefined
   - So the `next` parameter is NEVER set in the callback URL

3. **Callback Page Behavior** (`app/auth/callback/page.tsx:33`):
   ```typescript
   const next = searchParams.get('next') || '/' // Default to homepage
   ```
   - Gets `next` parameter from URL (which is never set!)
   - Falls back to `/` (homepage)
   - Successfully redirects to homepage

### Actual User Flow:

1. User clicks "Login with Google" on `/auth/login`
2. Redirects to Google OAuth
3. User authenticates with Google
4. Google redirects to `https://16bitweather.co/auth/callback?code=...`
5. Callback page processes OAuth code
6. **Redirects to `/` (homepage)** ← THIS IS HAPPENING!
7. User is logged in and can see their profile in nav

### Why Users Think It's Broken:

**User Expectation:**
- "I clicked login, so I should go to my dashboard after logging in"

**Actual Behavior:**
- User goes to homepage (`/`) instead of dashboard (`/dashboard`)
- Homepage looks the same whether logged in or not (just shows auth button)
- User doesn't immediately see they're logged in
- User manually clicks to go to dashboard

### Recommendations:

#### Option A: Redirect to Dashboard After Login (RECOMMENDED)
Change the default redirect from `/` to `/dashboard` for authenticated users.

**Fix:** In `lib/supabase/auth.ts`, change:
```typescript
const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
if (options?.redirectTo) {
  callbackUrl.searchParams.set('next', options.redirectTo)
} else {
  // Default to dashboard for better UX
  callbackUrl.searchParams.set('next', '/dashboard')
}
```

#### Option B: Pass Explicit Redirect (Better)
Update the login form to specify where to go after auth.

**Fix:** In `components/auth/auth-form.tsx`:
```typescript
const handleOAuthSignIn = async (provider: 'google' | 'github') => {
  try {
    setLoading(true)
    const { error } = await signInWithProvider(provider, {
      redirectTo: '/dashboard' // Explicitly redirect to dashboard
    })
    if (error) {
      setError(error.message)
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'OAuth error occurred')
  } finally {
    setLoading(false)
  }
}
```

#### Option C: Show Clear "Logged In" Feedback (Additional UX improvement)
Even if redirecting to homepage, show a toast/banner confirming successful login.

**Fix:** In `app/auth/callback/page.tsx`, add a success redirect with message:
```typescript
handleRedirect(next + '?login=success', 300)
```

Then show a toast on the target page when `?login=success` is present.

### Estimated Impact:
- **Severity:** Medium (not a bug, but poor UX)
- **User Impact:** High (confusing for new users)
- **Fix Complexity:** Low (5-10 minutes)

---

## Issue 2: Profile Settings Not Saving

### Problem Statement
User profile/settings updates fail to persist to Supabase. Settings appear to save (success message shows) but don't actually update in the database.

### Root Cause Analysis

#### Finding: Database Schema Mismatch + Silent Failure

**Evidence from Code Investigation:**

1. **Profile Update Function** (`lib/supabase/database.ts:69-108`):
   ```typescript
   export const updateProfile = async (userId: string, updates: ProfileUpdate): Promise<Profile | null> => {
     const supabase = getSupabaseClient()

     // Filter out updates for columns that might not exist
     const safeUpdates: any = {}

     // Only include updates for columns we're sure exist
     if (updates.username !== undefined) safeUpdates.username = updates.username

     // Try to update with full column set first
     let { data, error } = await supabase
       .from('profiles')
       .update(updates)
       .eq('id', userId)
       .select()
       .single()

     if (error && error.message.includes('does not exist')) {
       console.warn('Some profile columns missing during update, using safe updates:', error.message)
       // Fallback to only safe updates
       const { data: fallbackData, error: fallbackError } = await supabase
         .from('profiles')
         .update(safeUpdates)
         .eq('id', userId)
         .select()
         .single()

       if (fallbackError) {
         console.error('Error updating profile (fallback):', fallbackError)
         return null
       }

       data = fallbackData
     } else if (error) {
       console.error('Error updating profile:', error)
       return null
     }

     return data
   }
   ```

2. **The Problem:**
   - Line 76: `safeUpdates` ONLY includes `username`
   - If the database doesn't have columns like `full_name`, `default_location`, `avatar_url`, etc., the full update fails
   - Fallback tries to update with `safeUpdates` which only has `username`
   - **Result:** `full_name` and `default_location` updates are SILENTLY IGNORED

3. **Profile Page Behavior** (`app/profile/page.tsx:54-90`):
   ```typescript
   const handleSave = async () => {
     if (!user) return

     setLoading(true)
     setMessage('')

     try {
       const updates = {
         username: username?.trim() || null,
         full_name: fullName?.trim() || null,  // Will be ignored if column doesn't exist!
         default_location: defaultLocation?.trim() || null, // Will be ignored!
       }

       console.log('Updating profile with:', updates)
       const updatedProfile = await updateProfile(user.id, updates)

       if (updatedProfile) {
         console.log('Profile updated successfully:', updatedProfile)
         await refreshProfile()
         // ...
         setMessage('Profile updated successfully!') // Shows even if data wasn't saved!
       }
     }
   }
   ```

4. **Why it "succeeds" but doesn't save:**
   - `updateProfile` returns the profile data even if only `username` was updated
   - The function returns truthy value, so `if (updatedProfile)` passes
   - Success message shows
   - But `full_name` and `default_location` were never actually updated!

### Database Schema Issues

The code has fallback logic for missing columns, suggesting the `profiles` table might be missing columns:

**Expected Schema:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  default_location TEXT,
  avatar_url TEXT,
  preferred_units TEXT DEFAULT 'imperial',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Likely Actual Schema (missing columns):**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  username TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
  -- full_name MISSING!
  -- default_location MISSING!
  -- other columns MISSING!
);
```

### Recommendations:

#### Option A: Fix Database Schema (BEST SOLUTION)
Add missing columns to the `profiles` table in Supabase.

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Run migration:
```sql
-- Add missing columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS default_location TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS preferred_units TEXT DEFAULT 'imperial',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

#### Option B: Improve Error Handling (TEMPORARY FIX)
Make the fallback logic more complete so it doesn't lose data.

**Fix:** In `lib/supabase/database.ts`, update `safeUpdates`:
```typescript
const safeUpdates: any = {}

// Include all updates that we attempted
if (updates.username !== undefined) safeUpdates.username = updates.username
if (updates.full_name !== undefined) safeUpdates.full_name = updates.full_name
if (updates.default_location !== undefined) safeUpdates.default_location = updates.default_location
if (updates.avatar_url !== undefined) safeUpdates.avatar_url = updates.avatar_url
```

**But this still won't work if columns don't exist!** The database needs the columns.

#### Option C: Better Error Messaging (UX Fix)
Don't show success message if update actually failed.

**Fix:** In `lib/supabase/database.ts`:
```typescript
export const updateProfile = async (userId: string, updates: ProfileUpdate): Promise<{ success: boolean, profile: Profile | null, failedFields?: string[] }> => {
  // ... attempt update ...

  if (error && error.message.includes('does not exist')) {
    const failedFields = Object.keys(updates).filter(key => !safeUpdates[key])
    return {
      success: false,
      profile: fallbackData,
      failedFields
    }
  }

  return {
    success: true,
    profile: data
  }
}
```

Then in profile page, check for failed fields and show appropriate message.

### Estimated Impact:
- **Severity:** HIGH (data loss - user changes aren't saved)
- **User Impact:** HIGH (breaks core functionality)
- **Fix Complexity:** Low (database migration) or Medium (code changes)

---

## Issue 3: Performance Investigation

### Status: Pending Actual Measurements

**What to Test:**
1. Time from OAuth click to redirect (should be < 3 seconds)
2. Profile update API call duration (should be < 1 second)
3. Supabase database query times (should be < 500ms)

**How to Test:**
Add performance logging:

```typescript
// In lib/supabase/database.ts
export const updateProfile = async (userId: string, updates: ProfileUpdate): Promise<Profile | null> => {
  const startTime = performance.now()

  const supabase = getSupabaseClient()

  let { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  const duration = performance.now() - startTime
  console.log(`Profile update took ${duration}ms`)

  // ... rest of code
}
```

### Potential Performance Issues:

1. **Supabase Regional Latency**
   - If Supabase server is far from users (e.g., server in EU, users in US)
   - **Fix:** Use Supabase region closest to users
   - **Check:** Supabase Dashboard → Settings → Infrastructure

2. **Missing Database Indexes**
   - Queries without indexes are slow
   - **Fix:** Add indexes on frequently queried columns
   ```sql
   CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
   CREATE INDEX IF NOT EXISTS idx_saved_locations_user_id ON saved_locations(user_id);
   ```

3. **RLS Policy Performance**
   - Complex Row Level Security policies can slow queries
   - **Fix:** Optimize RLS policies or cache results

4. **OAuth Callback Wait Loop**
   - Currently waits up to 2 seconds for auth context (`app/auth/callback/page.tsx:65-86`)
   - This is intentional but feels slow
   - **Fix:** Reduce wait or show better loading state

---

## Recommended Fix Priority

### Priority 1: Fix Profile Settings (Data Loss Issue)
**Impact:** HIGH - Users can't update their profiles
**Complexity:** LOW
**Time:** 15 minutes

**Fix:**
1. Run database migration to add missing columns
2. Test profile update
3. Verify data persists

### Priority 2: Fix OAuth Redirect UX
**Impact:** MEDIUM - Confusing but not broken
**Complexity:** LOW
**Time:** 10 minutes

**Fix:**
1. Add default `next=/dashboard` to OAuth redirect
2. Add success toast on dashboard
3. Test OAuth flow

### Priority 3: Performance Investigation
**Impact:** UNKNOWN - Need measurements
**Complexity:** MEDIUM
**Time:** 30-60 minutes

**Fix:**
1. Add performance logging
2. Measure actual response times
3. Identify bottlenecks
4. Implement optimizations based on findings

---

## Files to Modify

### For OAuth Redirect Fix:
- `lib/supabase/auth.ts` - Add default dashboard redirect
- `components/auth/auth-form.tsx` - Pass redirectTo option

### For Profile Settings Fix:
- Supabase Database - Run migration
- `lib/supabase/database.ts` - Improve error handling
- `app/profile/page.tsx` - Better error messages

### For Performance:
- `lib/supabase/database.ts` - Add performance logging
- `app/auth/callback/page.tsx` - Reduce wait time
- Supabase Dashboard - Check region, add indexes

---

## Testing Checklist

After fixes:

**OAuth Redirect:**
- [ ] Click "Login with Google"
- [ ] Authenticate with Google
- [ ] Verify redirect to dashboard (not homepage)
- [ ] Confirm user sees logged-in state immediately
- [ ] Test "Login with GitHub" flow

**Profile Settings:**
- [ ] Update username → verify saves
- [ ] Update full name → verify saves
- [ ] Update default location → verify saves
- [ ] Refresh page → verify changes persist
- [ ] Check database directly → confirm data is stored

**Performance:**
- [ ] Measure OAuth flow duration (should be < 3s)
- [ ] Measure profile update duration (should be < 1s)
- [ ] Check browser console for slow query warnings
- [ ] Test on slow network connection
- [ ] Verify loading states show during operations

---

## Conclusion

**Issue 1 (OAuth Redirect):** Working correctly, just poor UX. Simple fix.
**Issue 2 (Profile Settings):** Database schema mismatch causing data loss. Critical but easy fix.
**Issue 3 (Performance):** Needs actual measurements before optimization.

**Total Fix Time Estimate:** 1-2 hours including testing

---

**Generated:** January 2025
**Tool:** Claude Code
**Status:** Ready for Implementation

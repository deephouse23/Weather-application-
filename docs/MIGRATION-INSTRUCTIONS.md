# Database Migration Instructions

## Critical: Run This Migration Before Testing Profile Settings

The profile settings fix requires database schema changes. Follow these steps to apply the migration.

---

## Step 1: Access Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your **16-Bit Weather** project
4. Navigate to **SQL Editor** in the left sidebar

---

## Step 2: Run the Migration

1. Click **New Query** in the SQL Editor
2. Copy the entire contents of `supabase-migrations/001_fix_profiles_table.sql`
3. Paste into the SQL Editor
4. Click **Run** to execute the migration

The migration will:
- Add missing columns to the `profiles` table (`full_name`, `email`, `default_location`, `avatar_url`, `preferred_units`, `timezone`)
- Add `updated_at` column with automatic timestamp updates
- Create a trigger function to update `updated_at` on profile changes
- Add helpful column comments for documentation

---

## Step 3: Verify Migration Success

After running the migration, verify it worked:

1. In Supabase, go to **Table Editor** > **profiles**
2. Check that you see these new columns:
   - `full_name`
   - `email`
   - `default_location`
   - `avatar_url`
   - `preferred_units`
   - `timezone`
   - `updated_at`

---

## Step 4: Test the Fixes

### Test 1: OAuth Redirect (No migration required)

1. Sign out of your account
2. Click **Sign In**
3. Choose **Continue with Google**
4. Complete Google authentication
5. **Expected Result**: You should land on `/dashboard` instead of `/`

### Test 2: Profile Settings Persistence (Requires migration)

1. Navigate to `/profile`
2. Click **Edit Profile**
3. Update your:
   - Full Name
   - Username
   - Default Location
   - Auto-Detect Location setting
   - Temperature Units
4. Click **Save Changes**
5. **Expected Result**: Success message appears and auto-clears after 3 seconds
6. Refresh the page
7. **Expected Result**: Your changes should persist (still visible after refresh)

### Test 3: Error Handling

1. Try saving profile with invalid data (if applicable)
2. **Expected Result**: Clear error messages appear explaining what went wrong
3. If preferences fail to save separately, you should see: "Profile updated, but preferences failed to save. Please try again."

---

## Troubleshooting

### Migration Fails

**Error**: "Column already exists"
- **Solution**: Some columns may already exist. This is fine - the migration uses `ADD COLUMN IF NOT EXISTS`

**Error**: "Trigger already exists"
- **Solution**: The migration drops the trigger before creating it - this should not happen

**Error**: Permission denied
- **Solution**: Make sure you're signed in as the project owner or have admin access

### Profile Settings Still Not Saving

1. Check browser console for errors (F12 > Console tab)
2. Check that the migration ran successfully
3. Verify Row Level Security (RLS) policies allow updates:
   - Go to **Table Editor** > **profiles** > **RLS Policies**
   - Ensure there's a policy allowing users to update their own profile

### OAuth Redirect Still Goes to Homepage

1. Clear browser cache and cookies
2. Sign out completely
3. Try OAuth flow again
4. Check browser console for redirect errors

---

## Rollback (If Needed)

If you need to undo the migration:

```sql
-- Remove added columns (WARNING: This will delete data)
ALTER TABLE profiles
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS default_location,
DROP COLUMN IF EXISTS avatar_url,
DROP COLUMN IF EXISTS preferred_units,
DROP COLUMN IF EXISTS timezone,
DROP COLUMN IF EXISTS updated_at;

-- Remove trigger and function
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS update_updated_at_column();
```

**Note**: Only use this if absolutely necessary - you will lose profile data.

---

## Next Steps After Testing

Once you've verified both fixes work:

1. Create a Pull Request for this branch
2. Include test results in the PR description
3. Merge to `main`
4. Deploy to production
5. Test in production environment

---

## Support

If you encounter any issues:
- Check `SUPABASE-ISSUES-ROOT-CAUSE-ANALYSIS.md` for detailed technical background
- Review console logs for specific error messages
- Verify environment variables are set correctly

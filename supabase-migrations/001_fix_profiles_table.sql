-- Migration: Fix Profiles Table Schema
-- Date: January 2025
-- Issue: Profile settings not saving due to missing columns
--
-- This migration adds missing columns to the profiles table to support
-- full user profile functionality.

-- Add missing columns to profiles table (if they don't exist)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS default_location TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS preferred_units TEXT DEFAULT 'imperial',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Ensure updated_at column exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create or replace trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists (to avoid duplicate trigger error)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Create trigger to automatically update updated_at on profile changes
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table for documentation
COMMENT ON TABLE profiles IS 'User profile information - enhanced with full schema';

-- Add comments to columns
COMMENT ON COLUMN profiles.full_name IS 'User full name (optional)';
COMMENT ON COLUMN profiles.email IS 'User email (synced from auth.users)';
COMMENT ON COLUMN profiles.default_location IS 'User default weather location';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN profiles.preferred_units IS 'imperial or metric - weather unit preference';
COMMENT ON COLUMN profiles.timezone IS 'User timezone for weather data';

-- Verify the changes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

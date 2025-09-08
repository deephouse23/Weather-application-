-- Migration to fix saved_locations table schema
-- This aligns the database with the TypeScript types

-- First, let's rename existing columns to match the expected schema
ALTER TABLE saved_locations 
  RENAME COLUMN city_name TO location_name;

ALTER TABLE saved_locations 
  RENAME COLUMN nickname TO custom_name;

-- Add missing columns
ALTER TABLE saved_locations 
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE saved_locations 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Drop columns that shouldn't be there
ALTER TABLE saved_locations 
  DROP COLUMN IF EXISTS emoji;

ALTER TABLE saved_locations 
  DROP COLUMN IF EXISTS is_default;

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and create it
DROP TRIGGER IF EXISTS update_saved_locations_updated_at ON saved_locations;
CREATE TRIGGER update_saved_locations_updated_at
  BEFORE UPDATE ON saved_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies if not exists
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own locations
CREATE POLICY IF NOT EXISTS "Users can view own locations" 
  ON saved_locations FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own locations
CREATE POLICY IF NOT EXISTS "Users can insert own locations" 
  ON saved_locations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own locations
CREATE POLICY IF NOT EXISTS "Users can update own locations" 
  ON saved_locations FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for users to delete their own locations
CREATE POLICY IF NOT EXISTS "Users can delete own locations" 
  ON saved_locations FOR DELETE 
  USING (auth.uid() = user_id);
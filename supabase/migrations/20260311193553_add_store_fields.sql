-- Add extended fields to stores table for better onboarding

-- Add new columns (nullable for existing stores)
ALTER TABLE stores ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS operating_hours TEXT;

-- Ensure is_active is set to true for new stores (default)
ALTER TABLE stores ALTER COLUMN is_active SET DEFAULT true;

-- Add RLS policies for the new fields
-- Allow users to read their own store's extended fields
DROP POLICY IF EXISTS "Users can view their own store" ON stores;
CREATE POLICY "Users can view their own store"
ON stores
FOR SELECT
USING (auth.uid() = owner_id);

-- Allow users to update their own store
DROP POLICY IF EXISTS "Users can update their own store" ON stores;
CREATE POLICY "Users can update their own store"
ON stores
FOR UPDATE
USING (auth.uid() = owner_id);

-- Note: INSERT policy should already exist from initial schema

-- Add social media and announcement columns to stores table

ALTER TABLE stores ADD COLUMN IF NOT EXISTS instagram_username TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS tiktok_username TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS announcement TEXT;

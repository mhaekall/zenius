ALTER TABLE stores ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
UPDATE stores SET onboarding_completed = true WHERE created_at < NOW();
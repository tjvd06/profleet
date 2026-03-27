-- ============================================================
-- Extend profiles table with address, contact & business fields
-- Run this in Supabase SQL Editor
-- ============================================================

-- Contact
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Address
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Business
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vat_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Dealer-specific (only relevant for role = 'anbieter')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dealer_type TEXT
  CHECK (dealer_type IN ('vertragshaendler', 'leasingfirma', 'bank', 'freier_haendler') OR dealer_type IS NULL);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brands TEXT[];  -- array of brand names

-- Track profile completeness
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

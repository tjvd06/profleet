-- Add subscription tier fields to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'starter'
    CHECK (subscription_tier IN ('starter', 'pro', 'premium')),
  ADD COLUMN IF NOT EXISTS subscription_since TIMESTAMPTZ;

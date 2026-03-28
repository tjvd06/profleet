-- ============================================================
-- RLS Policies for profiles table
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read basic public profile info (company_name, city, zip, role, dealer_type, created_at)
-- But sensitive fields (email_public, phone, first_name, last_name, subscription_tier, etc.)
-- are controlled at the application layer based on contact status.
-- RLS here ensures: authenticated users can read all profiles (needed for platform functionality),
-- but unauthenticated users cannot.

-- Authenticated users can read all profiles
CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (registration)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Block all access for anonymous users
CREATE POLICY "No anonymous access"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (false);

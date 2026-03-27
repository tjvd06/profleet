-- Backfill email_public from auth.users for all profiles where it's NULL
-- email_public mirrors the auth email so other users can see it via profiles
UPDATE profiles
SET email_public = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id
  AND (profiles.email_public IS NULL OR profiles.email_public = '');

-- Update the handle_new_user trigger function to set email_public = auth email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name, company_name, email_public)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'role', 'nachfrager'),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'company_name',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

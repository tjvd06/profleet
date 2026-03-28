-- Add config_file_path to offers table for dealer configuration uploads
ALTER TABLE public.offers
  ADD COLUMN IF NOT EXISTS config_file_path TEXT;

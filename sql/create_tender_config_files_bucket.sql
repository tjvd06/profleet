-- 1) Add config_file_path column to tender_vehicles
ALTER TABLE tender_vehicles ADD COLUMN IF NOT EXISTS config_file_path TEXT;

-- 2) Create storage bucket for tender configuration files
INSERT INTO storage.buckets (id, name, public)
VALUES ('tender-config-files', 'tender-config-files', false)
ON CONFLICT (id) DO NOTHING;

-- 3) Policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload own config files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tender-config-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4) Policy: Authenticated users can read their own files
CREATE POLICY "Users can read own config files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'tender-config-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5) Policy: Authenticated users can delete their own files
CREATE POLICY "Users can delete own config files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tender-config-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6) Policy: Dealers can read config files of active tenders they have access to
CREATE POLICY "Dealers can read config files of active tenders"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'tender-config-files'
  AND EXISTS (
    SELECT 1
    FROM tender_vehicles tv
    JOIN tenders t ON t.id = tv.tender_id
    WHERE tv.config_file_path = name
      AND t.status = 'active'
  )
);

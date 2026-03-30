-- Add config_documents column to instant_offers
-- Stores array of objects: [{ "path": "userId/uuid.pdf", "name": "Original Filename.pdf" }]
ALTER TABLE public.instant_offers
ADD COLUMN config_documents jsonb DEFAULT '[]';

-- Create storage bucket for config documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('instant-offer-config-docs', 'instant-offer-config-docs', true);

-- Policy: Anyone can download/view config documents
CREATE POLICY "Public read access for config docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'instant-offer-config-docs');

-- Policy: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload own config docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'instant-offer-config-docs'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own config docs
CREATE POLICY "Users can update own config docs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'instant-offer-config-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own config docs
CREATE POLICY "Users can delete own config docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'instant-offer-config-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
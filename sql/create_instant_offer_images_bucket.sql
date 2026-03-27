-- ============================================================
-- Supabase Storage: instant-offer-images bucket
-- ============================================================

-- Create the bucket (public readable for image URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('instant-offer-images', 'instant-offer-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can read images (public bucket)
CREATE POLICY "instant_offer_images_select_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'instant-offer-images');

-- Policy: Authenticated dealers can upload into their own folder (dealer_id/*)
CREATE POLICY "instant_offer_images_insert_dealer"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'instant-offer-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Dealers can update their own files
CREATE POLICY "instant_offer_images_update_dealer"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'instant-offer-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Dealers can delete their own files
CREATE POLICY "instant_offer_images_delete_dealer"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'instant-offer-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

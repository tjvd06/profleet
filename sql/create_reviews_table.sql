-- ============================================================
-- reviews table — Bewertungen nach Ausschreibungsende
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tender_id       UUID NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  contact_id      UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  from_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('positive', 'neutral', 'negative')),
  contract_concluded BOOLEAN NOT NULL DEFAULT FALSE,
  comment         TEXT,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_tender     ON public.reviews(tender_id);
CREATE INDEX IF NOT EXISTS idx_reviews_from_user  ON public.reviews(from_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_to_user    ON public.reviews(to_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_contact    ON public.reviews(contact_id);

-- Unique constraint: one review per user per contact
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_per_contact
  ON public.reviews(contact_id, from_user_id);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read all reviews (public transparency)
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Users can insert reviews where they are the from_user
CREATE POLICY "Users can create own reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Users can update their own reviews (e.g. edit comment)
CREATE POLICY "Users can update own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = from_user_id)
  WITH CHECK (auth.uid() = from_user_id);

-- ============================================================
-- Add contract_concluded_buyer / contract_concluded_dealer
-- to contacts table for independent confirmation
-- ============================================================

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS contract_concluded_buyer  BOOLEAN,
  ADD COLUMN IF NOT EXISTS contract_concluded_dealer BOOLEAN;

-- ============================================================
-- bookmarks table (user bookmarks for instant offers)
-- ============================================================

CREATE TABLE IF NOT EXISTS bookmarks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instant_offer_id  UUID NOT NULL REFERENCES instant_offers(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, instant_offer_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user      ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_offer     ON bookmarks(instant_offer_id);

-- RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can read only their own bookmarks
CREATE POLICY "bookmarks_select_own"
  ON bookmarks FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own bookmarks
CREATE POLICY "bookmarks_insert_own"
  ON bookmarks FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own bookmarks
CREATE POLICY "bookmarks_delete_own"
  ON bookmarks FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- offers table: Dealer offers on tender vehicles
-- Run this in Supabase SQL Editor
-- ============================================================

-- 0) Drop existing offers table (old schema without all columns)
DROP TABLE IF EXISTS offers CASCADE;

-- 1) Create the offers table
CREATE TABLE offers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id        UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  tender_vehicle_id UUID REFERENCES tender_vehicles(id) ON DELETE CASCADE,
  dealer_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  status           TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('draft', 'active')),

  -- Pricing (all net values in EUR)
  purchase_price   NUMERIC(12,2) NOT NULL DEFAULT 0,
  lease_rate       NUMERIC(12,2),
  lease_duration   INT4,
  lease_km         INT4,
  lease_deposit    NUMERIC(12,2),
  finance_rate     NUMERIC(12,2),
  finance_duration INT4,
  finance_deposit  NUMERIC(12,2),
  finance_residual NUMERIC(12,2),
  transfer_cost    NUMERIC(12,2) DEFAULT 0,
  registration_cost NUMERIC(12,2) DEFAULT 0,
  total_price      NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Quantity
  offered_quantity INTEGER NOT NULL DEFAULT 1,

  -- Delivery
  delivery_plz     TEXT,
  delivery_city    TEXT,
  delivery_date    DATE,

  -- Deviation from requested config
  deviation_type   TEXT CHECK (deviation_type IN ('alternative') OR deviation_type IS NULL),
  deviation_details JSONB,

  -- Full form snapshot (all fields from the offer form)
  offer_details    JSONB,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Indexes
CREATE INDEX idx_offers_tender_id ON offers(tender_id);
CREATE INDEX idx_offers_dealer_id ON offers(dealer_id);
CREATE INDEX idx_offers_tender_vehicle_id ON offers(tender_vehicle_id);
CREATE INDEX idx_offers_status ON offers(status);

-- 3) Unique constraint: one offer per dealer per vehicle per tender
CREATE UNIQUE INDEX idx_offers_unique_dealer_vehicle
  ON offers(tender_id, tender_vehicle_id, dealer_id);

-- 4) Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- 5) RLS Policies

-- Dealer can INSERT their own offers
CREATE POLICY "Dealers can create own offers"
  ON offers FOR INSERT
  TO authenticated
  WITH CHECK (dealer_id = auth.uid());

-- Dealer can SELECT their own offers
CREATE POLICY "Dealers can view own offers"
  ON offers FOR SELECT
  TO authenticated
  USING (dealer_id = auth.uid());

-- Dealer can UPDATE their own offers (e.g. draft -> active)
CREATE POLICY "Dealers can update own offers"
  ON offers FOR UPDATE
  TO authenticated
  USING (dealer_id = auth.uid())
  WITH CHECK (dealer_id = auth.uid());

-- Buyer can SELECT offers on their own tenders
CREATE POLICY "Buyers can view offers on own tenders"
  ON offers FOR SELECT
  TO authenticated
  USING (
    tender_id IN (
      SELECT id FROM tenders WHERE buyer_id = auth.uid()
    )
  );

-- 6) RPC function: aggregated offer stats per tender (for dealer inbox)
--    Excludes the calling dealer so only competitor offers are counted.
--    SECURITY DEFINER bypasses RLS so all active offers are visible.
DROP FUNCTION IF EXISTS get_tender_offer_stats(uuid[]);
CREATE OR REPLACE FUNCTION get_tender_offer_stats(tender_ids UUID[])
RETURNS TABLE (
  tender_id UUID,
  offer_count BIGINT,
  best_price_net NUMERIC(12,2),
  best_total_gross NUMERIC(12,2)
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    o.tender_id,
    COUNT(DISTINCT o.dealer_id) AS offer_count,
    MIN(o.purchase_price) FILTER (WHERE o.purchase_price > 0) AS best_price_net,
    MIN(o.total_price) FILTER (WHERE o.total_price > 0) AS best_total_gross
  FROM offers o
  WHERE o.tender_id = ANY(tender_ids)
    AND o.status = 'active'
    AND o.dealer_id != auth.uid()
  GROUP BY o.tender_id;
$$;

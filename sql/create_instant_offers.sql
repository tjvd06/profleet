-- ============================================================
-- instant_offers table
-- ============================================================

CREATE TABLE IF NOT EXISTS instant_offers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','expired','archived')),

  -- Vehicle core (same columns as tender_vehicles)
  vehicle_type  TEXT NOT NULL DEFAULT 'PKW' CHECK (vehicle_type IN ('PKW','NFZ')),
  brand         TEXT NOT NULL,
  model_name    TEXT NOT NULL,
  body_type     TEXT,
  fuel_type     TEXT,
  transmission  TEXT,
  power_kw      INT,
  power_ps      INT,
  awd           BOOLEAN DEFAULT FALSE,
  color         TEXT,
  metallic      BOOLEAN DEFAULT FALSE,
  doors         INT,
  list_price_net    NUMERIC(12,2),
  list_price_gross  NUMERIC(12,2),

  -- Extended equipment (same JSONB structure as tender_vehicles.equipment)
  equipment     JSONB,

  -- Images (storage paths in instant-offer-images bucket)
  images        TEXT[] DEFAULT '{}',

  -- Quantity
  quantity      INT NOT NULL DEFAULT 1,

  -- Delivery
  delivery_plz  TEXT,
  delivery_city TEXT,
  delivery_radius INT,  -- km

  -- Pricing
  purchase_price_net  NUMERIC(12,2),
  discount_percent    NUMERIC(5,2),

  -- Leasing
  leasing_enabled     BOOLEAN DEFAULT FALSE,
  leasing_rate_net    NUMERIC(10,2),
  leasing_duration    INT,          -- months
  leasing_mileage     INT,          -- km per year
  leasing_conditions  TEXT,

  -- Financing
  financing_enabled     BOOLEAN DEFAULT FALSE,
  financing_rate_net    NUMERIC(10,2),
  financing_duration    INT,          -- months
  financing_downpayment NUMERIC(12,2),
  financing_conditions  TEXT,

  -- Additional costs
  transfer_cost       NUMERIC(10,2),
  registration_cost   NUMERIC(10,2),
  total_price         NUMERIC(12,2),

  -- Visibility duration
  duration_days   INT NOT NULL DEFAULT 14 CHECK (duration_days IN (7,14,30)),
  published_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_instant_offers_dealer   ON instant_offers(dealer_id);
CREATE INDEX IF NOT EXISTS idx_instant_offers_status   ON instant_offers(status);
CREATE INDEX IF NOT EXISTS idx_instant_offers_brand    ON instant_offers(brand);
CREATE INDEX IF NOT EXISTS idx_instant_offers_expires  ON instant_offers(expires_at);

-- RLS
ALTER TABLE instant_offers ENABLE ROW LEVEL SECURITY;

-- Everyone can read active offers
CREATE POLICY "instant_offers_select_all"
  ON instant_offers FOR SELECT
  USING (true);

-- Dealer can insert own offers
CREATE POLICY "instant_offers_insert_dealer"
  ON instant_offers FOR INSERT
  WITH CHECK (dealer_id = auth.uid());

-- Dealer can update own offers
CREATE POLICY "instant_offers_update_dealer"
  ON instant_offers FOR UPDATE
  USING (dealer_id = auth.uid())
  WITH CHECK (dealer_id = auth.uid());

-- Dealer can delete own offers
CREATE POLICY "instant_offers_delete_dealer"
  ON instant_offers FOR DELETE
  USING (dealer_id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_instant_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_instant_offers_updated_at
  BEFORE UPDATE ON instant_offers
  FOR EACH ROW EXECUTE FUNCTION update_instant_offers_updated_at();

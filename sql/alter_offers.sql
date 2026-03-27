-- Add per-vehicle offer support
ALTER TABLE offers ADD COLUMN IF NOT EXISTS tender_vehicle_id UUID REFERENCES tender_vehicles(id);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offered_quantity INTEGER;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS delivery_zip TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS delivery_city TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offer_details JSONB;

-- Index for looking up offers by vehicle
CREATE INDEX IF NOT EXISTS idx_offers_tender_vehicle_id ON offers(tender_vehicle_id);

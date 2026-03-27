-- ============================================================
-- tender_vehicles: Spalten-Anpassungen fuer neuen Konfigurator
-- Ausfuehren im Supabase SQL Editor NACH vehicle_models.sql
-- ============================================================

-- FK zu vehicle_catalog entfernen (Tabelle wurde gedroppt)
ALTER TABLE tender_vehicles DROP CONSTRAINT IF EXISTS tender_vehicles_catalog_entry_id_fkey;

-- Bestehende Spalten bleiben (vehicle_type, brand, model_name, body_type,
-- fuel_type, transmission, power_kw, power_ps, awd, color, metallic,
-- doors, list_price_net, list_price_gross, quantity, config_method, etc.)

-- Equipment JSONB fuer alle erweiterten Konfigurator-Felder
ALTER TABLE tender_vehicles
  ADD COLUMN IF NOT EXISTS equipment JSONB DEFAULT '{}'::jsonb;

-- ============================================================
-- vehicle_catalog: Fahrzeugkatalog fuer kaskadierende Dropdowns
-- Ausfuehren im Supabase SQL Editor
-- ============================================================

-- 1. Tabelle anlegen
CREATE TABLE IF NOT EXISTS vehicle_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('PKW', 'NFZ')),
  brand TEXT NOT NULL,
  model_series TEXT NOT NULL,
  model_name TEXT NOT NULL,
  trim_levels TEXT[],
  body_type TEXT NOT NULL,
  doors INT NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  power_kw INT NOT NULL,
  power_ps INT NOT NULL,
  awd BOOLEAN NOT NULL DEFAULT FALSE,
  list_price_net NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indizes fuer performante Kaskaden-Queries
CREATE INDEX IF NOT EXISTS idx_vc_type_brand ON vehicle_catalog(vehicle_type, brand);
CREATE INDEX IF NOT EXISTS idx_vc_brand_series ON vehicle_catalog(brand, model_series);
CREATE INDEX IF NOT EXISTS idx_vc_brand_series_body ON vehicle_catalog(brand, model_series, body_type);

-- 3. Row Level Security
ALTER TABLE vehicle_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read catalog" ON vehicle_catalog FOR SELECT USING (true);

-- 4. Seed-Daten
-- Format: (vehicle_type, brand, model_series, model_name, trim_levels, body_type, doors, fuel_type, transmission, power_kw, power_ps, awd, list_price_net)

INSERT INTO vehicle_catalog (vehicle_type, brand, model_series, model_name, trim_levels, body_type, doors, fuel_type, transmission, power_kw, power_ps, awd, list_price_net) VALUES
-- ========================
-- AUDI
-- ========================
-- A1
('PKW', 'Audi', 'A1', 'A1 Sportback 25 TFSI', '{"Attraction","Advanced","S line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 70, 95, false, 22100.84),
('PKW', 'Audi', 'A1', 'A1 Sportback 30 TFSI', '{"Attraction","Advanced","S line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 81, 110, false, 24285.71),
('PKW', 'Audi', 'A1', 'A1 Sportback 30 TFSI S tronic', '{"Advanced","S line"}', 'Hatchback', 5, 'Benzin', 'Automatik', 81, 110, false, 26050.42),
('PKW', 'Audi', 'A1', 'A1 Sportback 35 TFSI S tronic', '{"S line","Edition One"}', 'Hatchback', 5, 'Benzin', 'Automatik', 110, 150, false, 28571.43),
-- A3
('PKW', 'Audi', 'A3', 'A3 Sportback 30 TFSI', '{"Attraction","Advanced","S line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 81, 110, false, 26890.76),
('PKW', 'Audi', 'A3', 'A3 Sportback 35 TFSI', '{"Advanced","S line","Edition One"}', 'Hatchback', 5, 'Benzin', 'Automatik', 110, 150, false, 30252.10),
('PKW', 'Audi', 'A3', 'A3 Sportback 35 TDI', '{"Advanced","S line"}', 'Hatchback', 5, 'Diesel', 'Automatik', 110, 150, false, 32436.97),
('PKW', 'Audi', 'A3', 'A3 Limousine 35 TFSI', '{"Advanced","S line"}', 'Limousine', 4, 'Benzin', 'Automatik', 110, 150, false, 31092.44),
('PKW', 'Audi', 'A3', 'A3 Limousine 35 TDI', '{"Advanced","S line"}', 'Limousine', 4, 'Diesel', 'Automatik', 110, 150, false, 33277.31),
-- A4
('PKW', 'Audi', 'A4', 'A4 Limousine 35 TFSI', '{"Attraction","Advanced","S line"}', 'Limousine', 4, 'Benzin', 'Automatik', 110, 150, false, 35714.29),
('PKW', 'Audi', 'A4', 'A4 Limousine 40 TFSI', '{"Advanced","S line","Edition One"}', 'Limousine', 4, 'Benzin', 'Automatik', 150, 204, false, 39915.97),
('PKW', 'Audi', 'A4', 'A4 Limousine 35 TDI', '{"Attraction","Advanced","S line"}', 'Limousine', 4, 'Diesel', 'Automatik', 120, 163, false, 37815.13),
('PKW', 'Audi', 'A4', 'A4 Limousine 40 TDI quattro', '{"S line","Edition One"}', 'Limousine', 4, 'Diesel', 'Automatik', 150, 204, true, 43697.48),
('PKW', 'Audi', 'A4', 'A4 Avant 35 TFSI', '{"Attraction","Advanced","S line"}', 'Kombi', 5, 'Benzin', 'Automatik', 110, 150, false, 37394.96),
('PKW', 'Audi', 'A4', 'A4 Avant 40 TFSI', '{"Advanced","S line"}', 'Kombi', 5, 'Benzin', 'Automatik', 150, 204, false, 41596.64),
('PKW', 'Audi', 'A4', 'A4 Avant 35 TDI', '{"Attraction","Advanced","S line"}', 'Kombi', 5, 'Diesel', 'Automatik', 120, 163, false, 39495.80),
('PKW', 'Audi', 'A4', 'A4 Avant 40 TDI quattro', '{"S line","Edition One"}', 'Kombi', 5, 'Diesel', 'Automatik', 150, 204, true, 45378.15),
-- A5
('PKW', 'Audi', 'A5', 'A5 Sportback 35 TFSI', '{"Advanced","S line"}', 'Sportback', 5, 'Benzin', 'Automatik', 110, 150, false, 38655.46),
('PKW', 'Audi', 'A5', 'A5 Sportback 40 TFSI', '{"S line","Edition One"}', 'Sportback', 5, 'Benzin', 'Automatik', 150, 204, false, 42857.14),
('PKW', 'Audi', 'A5', 'A5 Sportback 40 TDI quattro', '{"S line"}', 'Sportback', 5, 'Diesel', 'Automatik', 150, 204, true, 46218.49),
('PKW', 'Audi', 'A5', 'A5 Coupe 40 TFSI', '{"S line","Edition One"}', 'Coupe', 2, 'Benzin', 'Automatik', 150, 204, false, 43697.48),
('PKW', 'Audi', 'A5', 'A5 Coupe 45 TFSI quattro', '{"S line"}', 'Coupe', 2, 'Benzin', 'Automatik', 195, 265, true, 49579.83),
-- A6
('PKW', 'Audi', 'A6', 'A6 Limousine 40 TFSI', '{"Sport","S line","Design"}', 'Limousine', 4, 'Benzin', 'Automatik', 150, 204, false, 46218.49),
('PKW', 'Audi', 'A6', 'A6 Limousine 45 TFSI quattro', '{"S line","Design"}', 'Limousine', 4, 'Benzin', 'Automatik', 195, 265, true, 52100.84),
('PKW', 'Audi', 'A6', 'A6 Limousine 40 TDI', '{"Sport","S line"}', 'Limousine', 4, 'Diesel', 'Automatik', 150, 204, false, 48319.33),
('PKW', 'Audi', 'A6', 'A6 Avant 40 TFSI', '{"Sport","S line","Design"}', 'Kombi', 5, 'Benzin', 'Automatik', 150, 204, false, 48319.33),
('PKW', 'Audi', 'A6', 'A6 Avant 45 TFSI quattro', '{"S line","Design"}', 'Kombi', 5, 'Benzin', 'Automatik', 195, 265, true, 54201.68),
('PKW', 'Audi', 'A6', 'A6 Avant 40 TDI', '{"Sport","S line"}', 'Kombi', 5, 'Diesel', 'Automatik', 150, 204, false, 50420.17),
-- Q2
('PKW', 'Audi', 'Q2', 'Q2 30 TFSI', '{"Attraction","Advanced","S line"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 81, 110, false, 27731.09),
('PKW', 'Audi', 'Q2', 'Q2 35 TFSI S tronic', '{"Advanced","S line"}', 'SUV', 5, 'Benzin', 'Automatik', 110, 150, false, 31092.44),
-- Q3
('PKW', 'Audi', 'Q3', 'Q3 35 TFSI', '{"Attraction","Advanced","S line"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 110, 150, false, 33613.45),
('PKW', 'Audi', 'Q3', 'Q3 40 TFSI quattro', '{"Advanced","S line"}', 'SUV', 5, 'Benzin', 'Automatik', 140, 190, true, 38655.46),
('PKW', 'Audi', 'Q3', 'Q3 35 TDI S tronic', '{"Advanced","S line"}', 'SUV', 5, 'Diesel', 'Automatik', 110, 150, false, 36554.62),
-- Q5
('PKW', 'Audi', 'Q5', 'Q5 40 TFSI quattro', '{"Advanced","S line","Design"}', 'SUV', 5, 'Benzin', 'Automatik', 150, 204, true, 46218.49),
('PKW', 'Audi', 'Q5', 'Q5 45 TFSI quattro', '{"S line","Design"}', 'SUV', 5, 'Benzin', 'Automatik', 195, 265, true, 50420.17),
('PKW', 'Audi', 'Q5', 'Q5 40 TDI quattro', '{"Advanced","S line","Design"}', 'SUV', 5, 'Diesel', 'Automatik', 150, 204, true, 48319.33),
-- Q7
('PKW', 'Audi', 'Q7', 'Q7 45 TFSI quattro', '{"S line","Design"}', 'SUV', 5, 'Benzin', 'Automatik', 195, 265, true, 60924.37),
('PKW', 'Audi', 'Q7', 'Q7 50 TDI quattro', '{"S line","Design"}', 'SUV', 5, 'Diesel', 'Automatik', 210, 286, true, 66806.72),
-- Q8
('PKW', 'Audi', 'Q8', 'Q8 55 TFSI quattro', '{"S line","Design"}', 'SUV', 5, 'Benzin', 'Automatik', 250, 340, true, 72689.08),
('PKW', 'Audi', 'Q8', 'Q8 50 TDI quattro', '{"S line","Design"}', 'SUV', 5, 'Diesel', 'Automatik', 210, 286, true, 70588.24),
-- e-tron
('PKW', 'Audi', 'e-tron', 'Q8 e-tron 50 quattro', '{"Advanced","S line"}', 'SUV', 5, 'Elektro', 'Automatik', 250, 340, true, 58823.53),
('PKW', 'Audi', 'e-tron', 'Q8 e-tron 55 quattro', '{"S line","Design"}', 'SUV', 5, 'Elektro', 'Automatik', 300, 408, true, 67226.89),

-- ========================
-- BMW
-- ========================
-- 1er
('PKW', 'BMW', '1er', '116i', '{"Advantage","Sport Line","M Sport"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 90, 122, false, 27310.92),
('PKW', 'BMW', '1er', '118i', '{"Sport Line","M Sport"}', 'Hatchback', 5, 'Benzin', 'Automatik', 115, 156, false, 30252.10),
('PKW', 'BMW', '1er', '120i', '{"M Sport","M Sport Pro"}', 'Hatchback', 5, 'Benzin', 'Automatik', 131, 178, false, 33193.28),
('PKW', 'BMW', '1er', '118d', '{"Advantage","Sport Line","M Sport"}', 'Hatchback', 5, 'Diesel', 'Automatik', 110, 150, false, 31512.61),
-- 2er
('PKW', 'BMW', '2er', '218i Active Tourer', '{"Advantage","Sport Line","M Sport"}', 'Van', 5, 'Benzin', 'Automatik', 100, 136, false, 31092.44),
('PKW', 'BMW', '2er', '220i Active Tourer', '{"Sport Line","M Sport"}', 'Van', 5, 'Benzin', 'Automatik', 125, 170, false, 34033.61),
('PKW', 'BMW', '2er', '218d Active Tourer', '{"Advantage","Sport Line","M Sport"}', 'Van', 5, 'Diesel', 'Automatik', 110, 150, false, 33193.28),
('PKW', 'BMW', '2er', '220 Gran Coupe', '{"Sport Line","M Sport"}', 'Limousine', 4, 'Benzin', 'Automatik', 131, 178, false, 34873.95),
('PKW', 'BMW', '2er', '220d Gran Coupe', '{"M Sport"}', 'Limousine', 4, 'Diesel', 'Automatik', 140, 190, false, 36974.79),
-- 3er
('PKW', 'BMW', '3er', '318i Limousine', '{"Advantage","Sport Line","M Sport"}', 'Limousine', 4, 'Benzin', 'Automatik', 115, 156, false, 35714.29),
('PKW', 'BMW', '3er', '320i Limousine', '{"Sport Line","M Sport","M Sport Pro"}', 'Limousine', 4, 'Benzin', 'Automatik', 135, 184, false, 39075.63),
('PKW', 'BMW', '3er', '320d Limousine', '{"Advantage","Sport Line","M Sport"}', 'Limousine', 4, 'Diesel', 'Automatik', 140, 190, false, 39915.97),
('PKW', 'BMW', '3er', '330i Limousine', '{"M Sport","M Sport Pro"}', 'Limousine', 4, 'Benzin', 'Automatik', 180, 245, false, 43697.48),
('PKW', 'BMW', '3er', '320i Touring', '{"Sport Line","M Sport"}', 'Kombi', 5, 'Benzin', 'Automatik', 135, 184, false, 40756.30),
('PKW', 'BMW', '3er', '320d Touring', '{"Advantage","Sport Line","M Sport"}', 'Kombi', 5, 'Diesel', 'Automatik', 140, 190, false, 41596.64),
('PKW', 'BMW', '3er', '330d xDrive Touring', '{"M Sport","M Sport Pro"}', 'Kombi', 5, 'Diesel', 'Automatik', 210, 286, true, 49579.83),
-- 4er
('PKW', 'BMW', '4er', '420i Coupe', '{"Sport Line","M Sport"}', 'Coupe', 2, 'Benzin', 'Automatik', 135, 184, false, 42016.81),
('PKW', 'BMW', '4er', '420d Coupe', '{"M Sport"}', 'Coupe', 2, 'Diesel', 'Automatik', 140, 190, false, 44117.65),
-- 5er
('PKW', 'BMW', '5er', '520i Limousine', '{"Sport Line","M Sport","Luxury Line"}', 'Limousine', 4, 'Benzin', 'Automatik', 135, 184, false, 46218.49),
('PKW', 'BMW', '5er', '520d Limousine', '{"Sport Line","M Sport","Luxury Line"}', 'Limousine', 4, 'Diesel', 'Automatik', 145, 197, false, 48739.50),
('PKW', 'BMW', '5er', '530d xDrive Limousine', '{"M Sport","Luxury Line"}', 'Limousine', 4, 'Diesel', 'Automatik', 210, 286, true, 55882.35),
('PKW', 'BMW', '5er', '520i Touring', '{"Sport Line","M Sport"}', 'Kombi', 5, 'Benzin', 'Automatik', 135, 184, false, 48319.33),
('PKW', 'BMW', '5er', '520d Touring', '{"Sport Line","M Sport","Luxury Line"}', 'Kombi', 5, 'Diesel', 'Automatik', 145, 197, false, 50840.34),
('PKW', 'BMW', '5er', '530d xDrive Touring', '{"M Sport"}', 'Kombi', 5, 'Diesel', 'Automatik', 210, 286, true, 57983.19),
-- 7er
('PKW', 'BMW', '7er', '740i', '{"M Sport","Design Pure Excellence"}', 'Limousine', 4, 'Benzin', 'Automatik', 280, 381, false, 84033.61),
('PKW', 'BMW', '7er', '740d xDrive', '{"M Sport","Design Pure Excellence"}', 'Limousine', 4, 'Diesel', 'Automatik', 220, 299, true, 88235.29),
-- X1
('PKW', 'BMW', 'X1', 'X1 sDrive18i', '{"Advantage","Sport Line","M Sport"}', 'SUV', 5, 'Benzin', 'Automatik', 100, 136, false, 33613.45),
('PKW', 'BMW', 'X1', 'X1 sDrive18d', '{"Advantage","Sport Line","M Sport"}', 'SUV', 5, 'Diesel', 'Automatik', 110, 150, false, 35714.29),
('PKW', 'BMW', 'X1', 'X1 xDrive23i', '{"M Sport"}', 'SUV', 5, 'Benzin', 'Automatik', 150, 204, true, 39075.63),
-- X3
('PKW', 'BMW', 'X3', 'X3 xDrive20i', '{"Advantage","Sport Line","M Sport"}', 'SUV', 5, 'Benzin', 'Automatik', 135, 184, true, 44117.65),
('PKW', 'BMW', 'X3', 'X3 xDrive20d', '{"Advantage","Sport Line","M Sport"}', 'SUV', 5, 'Diesel', 'Automatik', 140, 190, true, 46218.49),
('PKW', 'BMW', 'X3', 'X3 xDrive30d', '{"M Sport","M Sport Pro"}', 'SUV', 5, 'Diesel', 'Automatik', 210, 286, true, 52521.01),
-- X5
('PKW', 'BMW', 'X5', 'X5 xDrive40i', '{"M Sport","Design Pure Excellence"}', 'SUV', 5, 'Benzin', 'Automatik', 250, 340, true, 63865.55),
('PKW', 'BMW', 'X5', 'X5 xDrive40d', '{"M Sport","Design Pure Excellence"}', 'SUV', 5, 'Diesel', 'Automatik', 250, 340, true, 65966.39),
('PKW', 'BMW', 'X5', 'X5 xDrive30d', '{"M Sport"}', 'SUV', 5, 'Diesel', 'Automatik', 210, 286, true, 59663.87),
-- iX
('PKW', 'BMW', 'iX', 'iX xDrive40', '{"Sport","M Sport"}', 'SUV', 5, 'Elektro', 'Automatik', 240, 326, true, 63025.21),
('PKW', 'BMW', 'iX', 'iX xDrive50', '{"M Sport","M Sport Pro"}', 'SUV', 5, 'Elektro', 'Automatik', 385, 523, true, 79831.93),
-- i4
('PKW', 'BMW', 'i4', 'i4 eDrive35', '{"Sport","M Sport"}', 'Limousine', 4, 'Elektro', 'Automatik', 210, 286, false, 46218.49),
('PKW', 'BMW', 'i4', 'i4 eDrive40', '{"M Sport"}', 'Limousine', 4, 'Elektro', 'Automatik', 250, 340, false, 51260.50),
('PKW', 'BMW', 'i4', 'i4 M50', '{"M Sport Pro"}', 'Limousine', 4, 'Elektro', 'Automatik', 400, 544, true, 60084.03),

-- ========================
-- MERCEDES-BENZ
-- ========================
-- A-Klasse
('PKW', 'Mercedes-Benz', 'A-Klasse', 'A 180', '{"Progressive","AMG Line"}', 'Hatchback', 5, 'Benzin', 'Automatik', 100, 136, false, 29411.76),
('PKW', 'Mercedes-Benz', 'A-Klasse', 'A 200', '{"Progressive","AMG Line","Edition"}', 'Hatchback', 5, 'Benzin', 'Automatik', 120, 163, false, 32016.81),
('PKW', 'Mercedes-Benz', 'A-Klasse', 'A 180 d', '{"Progressive","AMG Line"}', 'Hatchback', 5, 'Diesel', 'Automatik', 85, 116, false, 30672.27),
('PKW', 'Mercedes-Benz', 'A-Klasse', 'A 200 d', '{"Progressive","AMG Line"}', 'Hatchback', 5, 'Diesel', 'Automatik', 110, 150, false, 33613.45),
-- B-Klasse
('PKW', 'Mercedes-Benz', 'B-Klasse', 'B 180', '{"Progressive","AMG Line"}', 'Van', 5, 'Benzin', 'Automatik', 100, 136, false, 30672.27),
('PKW', 'Mercedes-Benz', 'B-Klasse', 'B 200', '{"Progressive","AMG Line"}', 'Van', 5, 'Benzin', 'Automatik', 120, 163, false, 33193.28),
('PKW', 'Mercedes-Benz', 'B-Klasse', 'B 200 d', '{"Progressive","AMG Line"}', 'Van', 5, 'Diesel', 'Automatik', 110, 150, false, 34453.78),
-- C-Klasse
('PKW', 'Mercedes-Benz', 'C-Klasse', 'C 180 Limousine', '{"Avantgarde","AMG Line"}', 'Limousine', 4, 'Benzin', 'Automatik', 125, 170, false, 37394.96),
('PKW', 'Mercedes-Benz', 'C-Klasse', 'C 200 Limousine', '{"Avantgarde","AMG Line","AMG Line Premium"}', 'Limousine', 4, 'Benzin', 'Automatik', 150, 204, false, 40756.30),
('PKW', 'Mercedes-Benz', 'C-Klasse', 'C 220 d Limousine', '{"Avantgarde","AMG Line"}', 'Limousine', 4, 'Diesel', 'Automatik', 147, 200, false, 42016.81),
('PKW', 'Mercedes-Benz', 'C-Klasse', 'C 300 d 4MATIC Limousine', '{"AMG Line","AMG Line Premium"}', 'Limousine', 4, 'Diesel', 'Automatik', 195, 265, true, 47899.16),
('PKW', 'Mercedes-Benz', 'C-Klasse', 'C 180 T-Modell', '{"Avantgarde","AMG Line"}', 'Kombi', 5, 'Benzin', 'Automatik', 125, 170, false, 39075.63),
('PKW', 'Mercedes-Benz', 'C-Klasse', 'C 200 T-Modell', '{"Avantgarde","AMG Line"}', 'Kombi', 5, 'Benzin', 'Automatik', 150, 204, false, 42436.97),
('PKW', 'Mercedes-Benz', 'C-Klasse', 'C 220 d T-Modell', '{"Avantgarde","AMG Line"}', 'Kombi', 5, 'Diesel', 'Automatik', 147, 200, false, 43697.48),
-- E-Klasse
('PKW', 'Mercedes-Benz', 'E-Klasse', 'E 200 Limousine', '{"Avantgarde","AMG Line","Exclusive"}', 'Limousine', 4, 'Benzin', 'Automatik', 150, 204, false, 48739.50),
('PKW', 'Mercedes-Benz', 'E-Klasse', 'E 220 d Limousine', '{"Avantgarde","AMG Line","Exclusive"}', 'Limousine', 4, 'Diesel', 'Automatik', 143, 194, false, 49579.83),
('PKW', 'Mercedes-Benz', 'E-Klasse', 'E 300 d 4MATIC Limousine', '{"AMG Line","Exclusive"}', 'Limousine', 4, 'Diesel', 'Automatik', 195, 265, true, 55042.02),
('PKW', 'Mercedes-Benz', 'E-Klasse', 'E 200 T-Modell', '{"Avantgarde","AMG Line"}', 'Kombi', 5, 'Benzin', 'Automatik', 150, 204, false, 50840.34),
('PKW', 'Mercedes-Benz', 'E-Klasse', 'E 220 d T-Modell', '{"Avantgarde","AMG Line","Exclusive"}', 'Kombi', 5, 'Diesel', 'Automatik', 143, 194, false, 51680.67),
('PKW', 'Mercedes-Benz', 'E-Klasse', 'E 300 d 4MATIC T-Modell', '{"AMG Line"}', 'Kombi', 5, 'Diesel', 'Automatik', 195, 265, true, 57142.86),
-- GLA
('PKW', 'Mercedes-Benz', 'GLA', 'GLA 200', '{"Progressive","AMG Line"}', 'SUV', 5, 'Benzin', 'Automatik', 120, 163, false, 35294.12),
('PKW', 'Mercedes-Benz', 'GLA', 'GLA 200 d', '{"Progressive","AMG Line"}', 'SUV', 5, 'Diesel', 'Automatik', 110, 150, false, 36554.62),
-- GLB
('PKW', 'Mercedes-Benz', 'GLB', 'GLB 200', '{"Progressive","AMG Line"}', 'SUV', 5, 'Benzin', 'Automatik', 120, 163, false, 36974.79),
('PKW', 'Mercedes-Benz', 'GLB', 'GLB 200 d', '{"Progressive","AMG Line"}', 'SUV', 5, 'Diesel', 'Automatik', 110, 150, false, 38235.29),
-- GLC
('PKW', 'Mercedes-Benz', 'GLC', 'GLC 200 4MATIC', '{"Avantgarde","AMG Line"}', 'SUV', 5, 'Benzin', 'Automatik', 150, 204, true, 46218.49),
('PKW', 'Mercedes-Benz', 'GLC', 'GLC 220 d 4MATIC', '{"Avantgarde","AMG Line"}', 'SUV', 5, 'Diesel', 'Automatik', 145, 197, true, 47899.16),
('PKW', 'Mercedes-Benz', 'GLC', 'GLC 300 d 4MATIC', '{"AMG Line","AMG Line Premium"}', 'SUV', 5, 'Diesel', 'Automatik', 195, 265, true, 52521.01),
-- GLE
('PKW', 'Mercedes-Benz', 'GLE', 'GLE 300 d 4MATIC', '{"Avantgarde","AMG Line"}', 'SUV', 5, 'Diesel', 'Automatik', 200, 272, true, 60504.20),
('PKW', 'Mercedes-Benz', 'GLE', 'GLE 450 4MATIC', '{"AMG Line","AMG Line Premium"}', 'SUV', 5, 'Benzin', 'Automatik', 270, 367, true, 67647.06),
-- EQA
('PKW', 'Mercedes-Benz', 'EQA', 'EQA 250+', '{"Progressive","AMG Line","Electric Art"}', 'SUV', 5, 'Elektro', 'Automatik', 140, 190, false, 41176.47),
('PKW', 'Mercedes-Benz', 'EQA', 'EQA 350 4MATIC', '{"AMG Line","Electric Art"}', 'SUV', 5, 'Elektro', 'Automatik', 215, 292, true, 47058.82),
-- EQC
('PKW', 'Mercedes-Benz', 'EQC', 'EQC 400 4MATIC', '{"Progressive","AMG Line","Electric Art"}', 'SUV', 5, 'Elektro', 'Automatik', 300, 408, true, 57563.03),

-- ========================
-- VOLKSWAGEN
-- ========================
-- Polo
('PKW', 'Volkswagen', 'Polo', 'Polo 1.0 TSI', '{"Life","Style","R-Line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 70, 95, false, 19327.73),
('PKW', 'Volkswagen', 'Polo', 'Polo 1.0 TSI DSG', '{"Style","R-Line"}', 'Hatchback', 5, 'Benzin', 'Automatik', 81, 110, false, 22268.91),
('PKW', 'Volkswagen', 'Polo', 'Polo 1.5 TSI DSG', '{"R-Line","GTI"}', 'Hatchback', 5, 'Benzin', 'Automatik', 110, 150, false, 25630.25),
-- Golf
('PKW', 'Volkswagen', 'Golf', 'Golf 1.5 TSI', '{"Life","Style","R-Line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 96, 130, false, 25210.08),
('PKW', 'Volkswagen', 'Golf', 'Golf 1.5 TSI DSG', '{"Style","R-Line"}', 'Hatchback', 5, 'Benzin', 'Automatik', 110, 150, false, 28151.26),
('PKW', 'Volkswagen', 'Golf', 'Golf 2.0 TDI', '{"Life","Style","R-Line"}', 'Hatchback', 5, 'Diesel', 'Schaltgetriebe', 85, 116, false, 27310.92),
('PKW', 'Volkswagen', 'Golf', 'Golf 2.0 TDI DSG', '{"Style","R-Line"}', 'Hatchback', 5, 'Diesel', 'Automatik', 110, 150, false, 30252.10),
('PKW', 'Volkswagen', 'Golf', 'Golf Variant 1.5 TSI', '{"Life","Style","R-Line"}', 'Kombi', 5, 'Benzin', 'Schaltgetriebe', 96, 130, false, 27310.92),
('PKW', 'Volkswagen', 'Golf', 'Golf Variant 1.5 TSI DSG', '{"Style","R-Line"}', 'Kombi', 5, 'Benzin', 'Automatik', 110, 150, false, 30252.10),
('PKW', 'Volkswagen', 'Golf', 'Golf Variant 2.0 TDI DSG', '{"Style","R-Line"}', 'Kombi', 5, 'Diesel', 'Automatik', 110, 150, false, 32352.94),
-- ID.3
('PKW', 'Volkswagen', 'ID.3', 'ID.3 Pure', '{"Life","Business"}', 'Hatchback', 5, 'Elektro', 'Automatik', 125, 170, false, 33193.28),
('PKW', 'Volkswagen', 'ID.3', 'ID.3 Pro', '{"Life","Business","Tech"}', 'Hatchback', 5, 'Elektro', 'Automatik', 150, 204, false, 36134.45),
('PKW', 'Volkswagen', 'ID.3', 'ID.3 Pro S', '{"Tech","GTX"}', 'Hatchback', 5, 'Elektro', 'Automatik', 170, 231, false, 39495.80),
-- ID.4
('PKW', 'Volkswagen', 'ID.4', 'ID.4 Pure', '{"Life","Business"}', 'SUV', 5, 'Elektro', 'Automatik', 125, 170, false, 35714.29),
('PKW', 'Volkswagen', 'ID.4', 'ID.4 Pro', '{"Life","Business","Tech"}', 'SUV', 5, 'Elektro', 'Automatik', 150, 204, false, 39075.63),
('PKW', 'Volkswagen', 'ID.4', 'ID.4 GTX', '{"GTX"}', 'SUV', 5, 'Elektro', 'Automatik', 220, 299, true, 46218.49),
-- ID.5
('PKW', 'Volkswagen', 'ID.5', 'ID.5 Pro', '{"Life","Business","Tech"}', 'SUV Coupe', 5, 'Elektro', 'Automatik', 150, 204, false, 42016.81),
('PKW', 'Volkswagen', 'ID.5', 'ID.5 GTX', '{"GTX"}', 'SUV Coupe', 5, 'Elektro', 'Automatik', 220, 299, true, 48739.50),
-- Passat
('PKW', 'Volkswagen', 'Passat', 'Passat Variant 1.5 TSI', '{"Business","Elegance","R-Line"}', 'Kombi', 5, 'Benzin', 'Automatik', 110, 150, false, 34873.95),
('PKW', 'Volkswagen', 'Passat', 'Passat Variant 2.0 TDI', '{"Business","Elegance","R-Line"}', 'Kombi', 5, 'Diesel', 'Automatik', 110, 150, false, 37394.96),
('PKW', 'Volkswagen', 'Passat', 'Passat Variant 2.0 TDI DSG 4MOTION', '{"Elegance","R-Line"}', 'Kombi', 5, 'Diesel', 'Automatik', 147, 200, true, 42016.81),
-- Tiguan
('PKW', 'Volkswagen', 'Tiguan', 'Tiguan 1.5 TSI', '{"Life","Elegance","R-Line"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 96, 130, false, 30252.10),
('PKW', 'Volkswagen', 'Tiguan', 'Tiguan 1.5 TSI DSG', '{"Elegance","R-Line"}', 'SUV', 5, 'Benzin', 'Automatik', 110, 150, false, 33613.45),
('PKW', 'Volkswagen', 'Tiguan', 'Tiguan 2.0 TDI DSG', '{"Elegance","R-Line"}', 'SUV', 5, 'Diesel', 'Automatik', 110, 150, false, 35714.29),
('PKW', 'Volkswagen', 'Tiguan', 'Tiguan 2.0 TDI DSG 4MOTION', '{"R-Line"}', 'SUV', 5, 'Diesel', 'Automatik', 147, 200, true, 39495.80),
-- T-Roc
('PKW', 'Volkswagen', 'T-Roc', 'T-Roc 1.0 TSI', '{"Life","Style","R-Line"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 81, 110, false, 24285.71),
('PKW', 'Volkswagen', 'T-Roc', 'T-Roc 1.5 TSI DSG', '{"Style","R-Line"}', 'SUV', 5, 'Benzin', 'Automatik', 110, 150, false, 28991.60),
-- Touareg
('PKW', 'Volkswagen', 'Touareg', 'Touareg 3.0 V6 TDI 4MOTION', '{"Elegance","Atmosphere","R-Line"}', 'SUV', 5, 'Diesel', 'Automatik', 210, 286, true, 57142.86),
('PKW', 'Volkswagen', 'Touareg', 'Touareg 3.0 V6 TSI eHybrid 4MOTION', '{"R-Line"}', 'SUV', 5, 'Plug-in-Hybrid', 'Automatik', 280, 381, true, 63025.21),
-- Caddy (NFZ)
('NFZ', 'Volkswagen', 'Caddy', 'Caddy Cargo 2.0 TDI', '{"Basis","EcoProfi"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 55, 75, false, 19747.90),
('NFZ', 'Volkswagen', 'Caddy', 'Caddy Cargo 2.0 TDI DSG', '{"EcoProfi"}', 'Kastenwagen', 4, 'Diesel', 'Automatik', 90, 122, false, 24285.71),
('NFZ', 'Volkswagen', 'Caddy', 'Caddy Kombi 2.0 TDI', '{"Life","Style"}', 'Kombi', 5, 'Diesel', 'Schaltgetriebe', 75, 102, false, 24705.88),
-- Transporter (NFZ)
('NFZ', 'Volkswagen', 'Transporter', 'Transporter 2.0 TDI Kasten', '{"Basis","EcoProfi"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 81, 110, false, 27310.92),
('NFZ', 'Volkswagen', 'Transporter', 'Transporter 2.0 TDI Kasten DSG', '{"EcoProfi"}', 'Kastenwagen', 4, 'Diesel', 'Automatik', 110, 150, false, 31512.61),
('NFZ', 'Volkswagen', 'Transporter', 'Transporter 2.0 TDI Kombi', '{"Basis","Life"}', 'Kombi', 5, 'Diesel', 'Schaltgetriebe', 81, 110, false, 29831.93),
('NFZ', 'Volkswagen', 'Transporter', 'Transporter 2.0 TDI 4MOTION Kasten', '{"EcoProfi"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 110, 150, true, 34033.61),
-- Multivan (NFZ)
('NFZ', 'Volkswagen', 'Multivan', 'Multivan 1.5 TSI', '{"Life","Style"}', 'Van', 5, 'Benzin', 'Automatik', 100, 136, false, 38235.29),
('NFZ', 'Volkswagen', 'Multivan', 'Multivan 2.0 TDI', '{"Life","Style","Energetic"}', 'Van', 5, 'Diesel', 'Automatik', 110, 150, false, 42016.81),
('NFZ', 'Volkswagen', 'Multivan', 'Multivan 1.4 eHybrid', '{"Style","Energetic"}', 'Van', 5, 'Plug-in-Hybrid', 'Automatik', 160, 218, false, 46218.49),

-- ========================
-- SKODA
-- ========================
-- Fabia
('PKW', 'Skoda', 'Fabia', 'Fabia 1.0 TSI', '{"Active","Ambition","Style"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 70, 95, false, 15546.22),
('PKW', 'Skoda', 'Fabia', 'Fabia 1.0 TSI DSG', '{"Ambition","Style","Monte Carlo"}', 'Hatchback', 5, 'Benzin', 'Automatik', 81, 110, false, 18487.39),
('PKW', 'Skoda', 'Fabia', 'Fabia 1.5 TSI DSG', '{"Style","Monte Carlo"}', 'Hatchback', 5, 'Benzin', 'Automatik', 110, 150, false, 21008.40),
-- Octavia
('PKW', 'Skoda', 'Octavia', 'Octavia 1.5 TSI', '{"Active","Ambition","Style"}', 'Limousine', 4, 'Benzin', 'Schaltgetriebe', 110, 150, false, 24705.88),
('PKW', 'Skoda', 'Octavia', 'Octavia 2.0 TDI DSG', '{"Ambition","Style","L&K"}', 'Limousine', 4, 'Diesel', 'Automatik', 110, 150, false, 28571.43),
('PKW', 'Skoda', 'Octavia', 'Octavia Combi 1.5 TSI', '{"Active","Ambition","Style"}', 'Kombi', 5, 'Benzin', 'Schaltgetriebe', 110, 150, false, 25630.25),
('PKW', 'Skoda', 'Octavia', 'Octavia Combi 2.0 TDI DSG', '{"Ambition","Style","L&K"}', 'Kombi', 5, 'Diesel', 'Automatik', 110, 150, false, 29411.76),
('PKW', 'Skoda', 'Octavia', 'Octavia Combi 2.0 TDI DSG 4x4', '{"Style","L&K"}', 'Kombi', 5, 'Diesel', 'Automatik', 147, 200, true, 33193.28),
-- Superb
('PKW', 'Skoda', 'Superb', 'Superb 1.5 TSI', '{"Ambition","Style","L&K"}', 'Limousine', 4, 'Benzin', 'Automatik', 110, 150, false, 31512.61),
('PKW', 'Skoda', 'Superb', 'Superb 2.0 TDI DSG', '{"Style","L&K"}', 'Limousine', 4, 'Diesel', 'Automatik', 110, 150, false, 34873.95),
('PKW', 'Skoda', 'Superb', 'Superb Combi 1.5 TSI', '{"Ambition","Style","L&K"}', 'Kombi', 5, 'Benzin', 'Automatik', 110, 150, false, 33193.28),
('PKW', 'Skoda', 'Superb', 'Superb Combi 2.0 TDI DSG', '{"Style","L&K"}', 'Kombi', 5, 'Diesel', 'Automatik', 110, 150, false, 36554.62),
('PKW', 'Skoda', 'Superb', 'Superb Combi 2.0 TDI DSG 4x4', '{"L&K"}', 'Kombi', 5, 'Diesel', 'Automatik', 147, 200, true, 39915.97),
-- Kamiq
('PKW', 'Skoda', 'Kamiq', 'Kamiq 1.0 TSI', '{"Active","Ambition","Style"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 81, 110, false, 20168.07),
('PKW', 'Skoda', 'Kamiq', 'Kamiq 1.5 TSI DSG', '{"Style","Monte Carlo"}', 'SUV', 5, 'Benzin', 'Automatik', 110, 150, false, 24285.71),
-- Karoq
('PKW', 'Skoda', 'Karoq', 'Karoq 1.0 TSI', '{"Active","Ambition","Style"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 81, 110, false, 23865.55),
('PKW', 'Skoda', 'Karoq', 'Karoq 1.5 TSI DSG', '{"Ambition","Style","Sportline"}', 'SUV', 5, 'Benzin', 'Automatik', 110, 150, false, 27731.09),
('PKW', 'Skoda', 'Karoq', 'Karoq 2.0 TDI DSG 4x4', '{"Style","Sportline"}', 'SUV', 5, 'Diesel', 'Automatik', 110, 150, true, 31092.44),
-- Kodiaq
('PKW', 'Skoda', 'Kodiaq', 'Kodiaq 1.5 TSI DSG', '{"Ambition","Style","L&K"}', 'SUV', 5, 'Benzin', 'Automatik', 110, 150, false, 31932.77),
('PKW', 'Skoda', 'Kodiaq', 'Kodiaq 2.0 TDI DSG', '{"Style","L&K","Sportline"}', 'SUV', 5, 'Diesel', 'Automatik', 110, 150, false, 34453.78),
('PKW', 'Skoda', 'Kodiaq', 'Kodiaq 2.0 TDI DSG 4x4', '{"L&K","Sportline"}', 'SUV', 5, 'Diesel', 'Automatik', 147, 200, true, 38235.29),
-- Enyaq
('PKW', 'Skoda', 'Enyaq', 'Enyaq iV 60', '{"Loft","Suite","Sportline"}', 'SUV', 5, 'Elektro', 'Automatik', 132, 179, false, 34033.61),
('PKW', 'Skoda', 'Enyaq', 'Enyaq iV 80', '{"Suite","Sportline","L&K"}', 'SUV', 5, 'Elektro', 'Automatik', 150, 204, false, 38655.46),
('PKW', 'Skoda', 'Enyaq', 'Enyaq iV 80x', '{"Sportline","L&K"}', 'SUV', 5, 'Elektro', 'Automatik', 195, 265, true, 42436.97),

-- ========================
-- SEAT / CUPRA
-- ========================
-- Ibiza
('PKW', 'SEAT', 'Ibiza', 'Ibiza 1.0 TSI', '{"Reference","Style","Xcellence","FR"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 70, 95, false, 15966.39),
('PKW', 'SEAT', 'Ibiza', 'Ibiza 1.0 TSI DSG', '{"Xcellence","FR"}', 'Hatchback', 5, 'Benzin', 'Automatik', 81, 110, false, 19327.73),
-- Leon
('PKW', 'SEAT', 'Leon', 'Leon 1.0 TSI', '{"Reference","Style","Xcellence","FR"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 81, 110, false, 20588.24),
('PKW', 'SEAT', 'Leon', 'Leon 1.5 TSI', '{"Xcellence","FR"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 110, 150, false, 23445.38),
('PKW', 'SEAT', 'Leon', 'Leon 2.0 TDI DSG', '{"FR","Xcellence"}', 'Hatchback', 5, 'Diesel', 'Automatik', 110, 150, false, 26470.59),
('PKW', 'SEAT', 'Leon', 'Leon Sportstourer 1.5 TSI', '{"Xcellence","FR"}', 'Kombi', 5, 'Benzin', 'Schaltgetriebe', 110, 150, false, 24705.88),
('PKW', 'SEAT', 'Leon', 'Leon Sportstourer 2.0 TDI DSG', '{"FR","Xcellence"}', 'Kombi', 5, 'Diesel', 'Automatik', 110, 150, false, 27731.09),
-- Ateca
('PKW', 'SEAT', 'Ateca', 'Ateca 1.0 TSI', '{"Reference","Style","Xcellence","FR"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 81, 110, false, 23025.21),
('PKW', 'SEAT', 'Ateca', 'Ateca 1.5 TSI DSG', '{"Xcellence","FR"}', 'SUV', 5, 'Benzin', 'Automatik', 110, 150, false, 27731.09),
-- Cupra Formentor
('PKW', 'Cupra', 'Formentor', 'Formentor 1.5 TSI DSG', '{"V1","V2","VZ"}', 'SUV Coupe', 5, 'Benzin', 'Automatik', 110, 150, false, 30252.10),
('PKW', 'Cupra', 'Formentor', 'Formentor 2.0 TSI DSG 4Drive', '{"VZ"}', 'SUV Coupe', 5, 'Benzin', 'Automatik', 228, 310, true, 39075.63),
('PKW', 'Cupra', 'Formentor', 'Formentor 2.0 TDI DSG 4Drive', '{"V2","VZ"}', 'SUV Coupe', 5, 'Diesel', 'Automatik', 110, 150, true, 33193.28),
-- Cupra Born
('PKW', 'Cupra', 'Born', 'Born 150 kW', '{"V1","V2"}', 'Hatchback', 5, 'Elektro', 'Automatik', 150, 204, false, 33613.45),
('PKW', 'Cupra', 'Born', 'Born 170 kW', '{"V2","VZ"}', 'Hatchback', 5, 'Elektro', 'Automatik', 170, 231, false, 36554.62),

-- ========================
-- OPEL
-- ========================
-- Corsa
('PKW', 'Opel', 'Corsa', 'Corsa 1.2', '{"Edition","Elegance","GS"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 55, 75, false, 14705.88),
('PKW', 'Opel', 'Corsa', 'Corsa 1.2 Turbo', '{"Elegance","GS"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 74, 100, false, 17647.06),
('PKW', 'Opel', 'Corsa', 'Corsa 1.2 Turbo AT', '{"GS"}', 'Hatchback', 5, 'Benzin', 'Automatik', 96, 130, false, 21008.40),
('PKW', 'Opel', 'Corsa', 'Corsa-e', '{"Edition","Elegance","GS"}', 'Hatchback', 5, 'Elektro', 'Automatik', 100, 136, false, 28571.43),
-- Astra
('PKW', 'Opel', 'Astra', 'Astra 1.2 Turbo', '{"Edition","Elegance","GS","Ultimate"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 81, 110, false, 22689.08),
('PKW', 'Opel', 'Astra', 'Astra 1.2 Turbo AT', '{"Elegance","GS"}', 'Hatchback', 5, 'Benzin', 'Automatik', 96, 130, false, 25630.25),
('PKW', 'Opel', 'Astra', 'Astra 1.5 Diesel AT', '{"Elegance","GS"}', 'Hatchback', 5, 'Diesel', 'Automatik', 96, 130, false, 27310.92),
('PKW', 'Opel', 'Astra', 'Astra-e', '{"Edition","GS"}', 'Hatchback', 5, 'Elektro', 'Automatik', 115, 156, false, 34033.61),
('PKW', 'Opel', 'Astra', 'Astra Sports Tourer 1.2 Turbo', '{"Edition","Elegance","GS"}', 'Kombi', 5, 'Benzin', 'Schaltgetriebe', 81, 110, false, 24285.71),
('PKW', 'Opel', 'Astra', 'Astra Sports Tourer 1.5 Diesel AT', '{"Elegance","GS"}', 'Kombi', 5, 'Diesel', 'Automatik', 96, 130, false, 28991.60),
-- Mokka
('PKW', 'Opel', 'Mokka', 'Mokka 1.2 Turbo', '{"Edition","Elegance","GS","Ultimate"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 74, 100, false, 21848.74),
('PKW', 'Opel', 'Mokka', 'Mokka 1.2 Turbo AT', '{"GS","Ultimate"}', 'SUV', 5, 'Benzin', 'Automatik', 96, 130, false, 25210.08),
('PKW', 'Opel', 'Mokka', 'Mokka-e', '{"Edition","GS","Ultimate"}', 'SUV', 5, 'Elektro', 'Automatik', 100, 136, false, 31512.61),
-- Grandland
('PKW', 'Opel', 'Grandland', 'Grandland 1.2 Turbo', '{"Edition","Elegance","GS"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 96, 130, false, 27310.92),
('PKW', 'Opel', 'Grandland', 'Grandland 1.2 Turbo AT', '{"GS","Ultimate"}', 'SUV', 5, 'Benzin', 'Automatik', 96, 130, false, 30252.10),
('PKW', 'Opel', 'Grandland', 'Grandland 1.5 Diesel AT', '{"GS","Ultimate"}', 'SUV', 5, 'Diesel', 'Automatik', 96, 130, false, 31932.77),
-- Combo (NFZ)
('NFZ', 'Opel', 'Combo', 'Combo Cargo 1.5 Diesel', '{"Edition","Essentia"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 75, 102, false, 18907.56),
('NFZ', 'Opel', 'Combo', 'Combo Cargo 1.5 Diesel AT', '{"Essentia"}', 'Kastenwagen', 4, 'Diesel', 'Automatik', 96, 130, false, 22268.91),
-- Vivaro (NFZ)
('NFZ', 'Opel', 'Vivaro', 'Vivaro 2.0 Diesel', '{"Edition","Essentia"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 88, 120, false, 24705.88),
('NFZ', 'Opel', 'Vivaro', 'Vivaro 2.0 Diesel AT', '{"Essentia"}', 'Kastenwagen', 4, 'Diesel', 'Automatik', 130, 177, false, 28571.43),
('NFZ', 'Opel', 'Vivaro', 'Vivaro-e', '{"Edition","Essentia"}', 'Kastenwagen', 4, 'Elektro', 'Automatik', 100, 136, false, 33193.28),

-- ========================
-- FORD
-- ========================
-- Fiesta
('PKW', 'Ford', 'Fiesta', 'Fiesta 1.0 EcoBoost', '{"Trend","Titanium","ST-Line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 70, 95, false, 15966.39),
('PKW', 'Ford', 'Fiesta', 'Fiesta 1.0 EcoBoost AT', '{"Titanium","ST-Line"}', 'Hatchback', 5, 'Benzin', 'Automatik', 92, 125, false, 19327.73),
-- Focus
('PKW', 'Ford', 'Focus', 'Focus 1.0 EcoBoost', '{"Trend","Titanium","ST-Line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 92, 125, false, 22268.91),
('PKW', 'Ford', 'Focus', 'Focus 1.0 EcoBoost AT', '{"Titanium","ST-Line","Active"}', 'Hatchback', 5, 'Benzin', 'Automatik', 114, 155, false, 25210.08),
('PKW', 'Ford', 'Focus', 'Focus 1.5 EcoBlue', '{"Titanium","ST-Line"}', 'Hatchback', 5, 'Diesel', 'Schaltgetriebe', 88, 120, false, 24705.88),
('PKW', 'Ford', 'Focus', 'Focus Turnier 1.0 EcoBoost', '{"Trend","Titanium","ST-Line"}', 'Kombi', 5, 'Benzin', 'Schaltgetriebe', 92, 125, false, 23865.55),
('PKW', 'Ford', 'Focus', 'Focus Turnier 1.0 EcoBoost AT', '{"Titanium","ST-Line","Active"}', 'Kombi', 5, 'Benzin', 'Automatik', 114, 155, false, 26890.76),
('PKW', 'Ford', 'Focus', 'Focus Turnier 1.5 EcoBlue AT', '{"Titanium","ST-Line"}', 'Kombi', 5, 'Diesel', 'Automatik', 88, 120, false, 27731.09),
-- Puma
('PKW', 'Ford', 'Puma', 'Puma 1.0 EcoBoost', '{"Titanium","ST-Line","ST-Line X"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 92, 125, false, 23025.21),
('PKW', 'Ford', 'Puma', 'Puma 1.0 EcoBoost AT', '{"ST-Line","ST-Line X"}', 'SUV', 5, 'Benzin', 'Automatik', 114, 155, false, 25630.25),
-- Kuga
('PKW', 'Ford', 'Kuga', 'Kuga 1.5 EcoBoost', '{"Titanium","ST-Line","Vignale"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 110, 150, false, 29411.76),
('PKW', 'Ford', 'Kuga', 'Kuga 2.5 Duratec PHEV', '{"ST-Line","Vignale"}', 'SUV', 5, 'Plug-in-Hybrid', 'Automatik', 165, 225, false, 35714.29),
('PKW', 'Ford', 'Kuga', 'Kuga 1.5 EcoBlue AT', '{"Titanium","ST-Line"}', 'SUV', 5, 'Diesel', 'Automatik', 88, 120, false, 31932.77),
-- Mustang Mach-E
('PKW', 'Ford', 'Mustang Mach-E', 'Mustang Mach-E Standard Range', '{"Basis","Premium"}', 'SUV', 5, 'Elektro', 'Automatik', 198, 269, false, 38655.46),
('PKW', 'Ford', 'Mustang Mach-E', 'Mustang Mach-E Extended Range', '{"Premium","GT"}', 'SUV', 5, 'Elektro', 'Automatik', 294, 400, true, 48739.50),
-- Transit (NFZ)
('NFZ', 'Ford', 'Transit', 'Transit 2.0 EcoBlue Kasten', '{"Basis","Trend"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 77, 105, false, 26050.42),
('NFZ', 'Ford', 'Transit', 'Transit 2.0 EcoBlue Kasten AT', '{"Trend"}', 'Kastenwagen', 4, 'Diesel', 'Automatik', 96, 130, false, 29831.93),
('NFZ', 'Ford', 'Transit', 'Transit 2.0 EcoBlue Kasten FWD', '{"Trend","Limited"}', 'Kastenwagen', 4, 'Diesel', 'Automatik', 125, 170, false, 32773.11),
-- Transit Custom (NFZ)
('NFZ', 'Ford', 'Transit Custom', 'Transit Custom 2.0 EcoBlue', '{"Basis","Trend","Limited"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 81, 110, false, 24285.71),
('NFZ', 'Ford', 'Transit Custom', 'Transit Custom 2.0 EcoBlue AT', '{"Trend","Limited"}', 'Kastenwagen', 4, 'Diesel', 'Automatik', 96, 130, false, 27731.09),

-- ========================
-- TOYOTA
-- ========================
-- Yaris
('PKW', 'Toyota', 'Yaris', 'Yaris 1.0', '{"Live","Active","Comfort"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 53, 72, false, 14285.71),
('PKW', 'Toyota', 'Yaris', 'Yaris 1.5 Hybrid', '{"Active","Comfort","Premiere"}', 'Hatchback', 5, 'Hybrid', 'Automatik', 85, 116, false, 19327.73),
-- Corolla
('PKW', 'Toyota', 'Corolla', 'Corolla 1.8 Hybrid Hatchback', '{"Business","Comfort","Lounge"}', 'Hatchback', 5, 'Hybrid', 'Automatik', 103, 140, false, 24705.88),
('PKW', 'Toyota', 'Corolla', 'Corolla 2.0 Hybrid Hatchback', '{"Lounge","GR Sport"}', 'Hatchback', 5, 'Hybrid', 'Automatik', 144, 196, false, 28151.26),
('PKW', 'Toyota', 'Corolla', 'Corolla 1.8 Hybrid Touring Sports', '{"Business","Comfort","Lounge"}', 'Kombi', 5, 'Hybrid', 'Automatik', 103, 140, false, 26050.42),
('PKW', 'Toyota', 'Corolla', 'Corolla 2.0 Hybrid Touring Sports', '{"Lounge","GR Sport"}', 'Kombi', 5, 'Hybrid', 'Automatik', 144, 196, false, 29831.93),
-- Camry
('PKW', 'Toyota', 'Camry', 'Camry 2.5 Hybrid', '{"Business","Comfort","Executive"}', 'Limousine', 4, 'Hybrid', 'Automatik', 160, 218, false, 34033.61),
-- RAV4
('PKW', 'Toyota', 'RAV4', 'RAV4 2.5 Hybrid', '{"Life","Style","Lounge"}', 'SUV', 5, 'Hybrid', 'Automatik', 160, 218, false, 33193.28),
('PKW', 'Toyota', 'RAV4', 'RAV4 2.5 Hybrid AWD', '{"Style","Lounge","Adventure"}', 'SUV', 5, 'Hybrid', 'Automatik', 163, 222, true, 36134.45),
('PKW', 'Toyota', 'RAV4', 'RAV4 2.5 Plug-in-Hybrid AWD', '{"Style","Lounge"}', 'SUV', 5, 'Plug-in-Hybrid', 'Automatik', 225, 306, true, 40756.30),
-- C-HR
('PKW', 'Toyota', 'C-HR', 'C-HR 1.8 Hybrid', '{"Active","Style"}', 'SUV Coupe', 5, 'Hybrid', 'Automatik', 103, 140, false, 27310.92),
('PKW', 'Toyota', 'C-HR', 'C-HR 2.0 Hybrid', '{"Style","Lounge","GR Sport"}', 'SUV Coupe', 5, 'Hybrid', 'Automatik', 144, 196, false, 31092.44),
-- Hilux (NFZ)
('NFZ', 'Toyota', 'Hilux', 'Hilux 2.8 D-4D Single Cab', '{"Basis","Country"}', 'Pritsche', 2, 'Diesel', 'Schaltgetriebe', 110, 150, false, 24705.88),
('NFZ', 'Toyota', 'Hilux', 'Hilux 2.8 D-4D Double Cab 4x4', '{"Country","Comfort","Invincible"}', 'Pritsche', 4, 'Diesel', 'Automatik', 150, 204, true, 33613.45),
-- Proace (NFZ)
('NFZ', 'Toyota', 'Proace', 'Proace 2.0 D-4D Kasten', '{"Basis","Comfort"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 88, 120, false, 25210.08),
('NFZ', 'Toyota', 'Proace', 'Proace 2.0 D-4D Kasten AT', '{"Comfort"}', 'Kastenwagen', 4, 'Diesel', 'Automatik', 130, 177, false, 28991.60),

-- ========================
-- HYUNDAI
-- ========================
-- i10
('PKW', 'Hyundai', 'i10', 'i10 1.0', '{"Select","Trend","Style"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 49, 67, false, 11764.71),
('PKW', 'Hyundai', 'i10', 'i10 1.2', '{"Trend","Style","N Line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 62, 84, false, 13865.55),
-- i20
('PKW', 'Hyundai', 'i20', 'i20 1.0 T-GDI', '{"Select","Trend","Prime","N Line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 74, 100, false, 16386.55),
('PKW', 'Hyundai', 'i20', 'i20 1.0 T-GDI DCT', '{"Prime","N Line"}', 'Hatchback', 5, 'Benzin', 'Automatik', 88, 120, false, 20168.07),
-- i30
('PKW', 'Hyundai', 'i30', 'i30 1.0 T-GDI', '{"Select","Trend","Prime","N Line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 88, 120, false, 21428.57),
('PKW', 'Hyundai', 'i30', 'i30 1.5 T-GDI DCT', '{"Prime","N Line"}', 'Hatchback', 5, 'Benzin', 'Automatik', 117, 159, false, 25210.08),
('PKW', 'Hyundai', 'i30', 'i30 1.6 CRDi DCT', '{"Trend","Prime"}', 'Hatchback', 5, 'Diesel', 'Automatik', 100, 136, false, 25630.25),
('PKW', 'Hyundai', 'i30', 'i30 Kombi 1.0 T-GDI', '{"Select","Trend","Prime"}', 'Kombi', 5, 'Benzin', 'Schaltgetriebe', 88, 120, false, 22689.08),
('PKW', 'Hyundai', 'i30', 'i30 Kombi 1.5 T-GDI DCT', '{"Prime","N Line"}', 'Kombi', 5, 'Benzin', 'Automatik', 117, 159, false, 26470.59),
-- Tucson
('PKW', 'Hyundai', 'Tucson', 'Tucson 1.6 T-GDI', '{"Select","Trend","Prime","N Line"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 110, 150, false, 28151.26),
('PKW', 'Hyundai', 'Tucson', 'Tucson 1.6 T-GDI Hybrid', '{"Trend","Prime","N Line"}', 'SUV', 5, 'Hybrid', 'Automatik', 169, 230, false, 32352.94),
('PKW', 'Hyundai', 'Tucson', 'Tucson 1.6 T-GDI Hybrid 4WD', '{"Prime","N Line"}', 'SUV', 5, 'Hybrid', 'Automatik', 169, 230, true, 35294.12),
('PKW', 'Hyundai', 'Tucson', 'Tucson 1.6 CRDi DCT', '{"Trend","Prime"}', 'SUV', 5, 'Diesel', 'Automatik', 100, 136, false, 30252.10),
-- Kona
('PKW', 'Hyundai', 'Kona', 'Kona 1.0 T-GDI', '{"Select","Trend","Prime","N Line"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 88, 120, false, 21848.74),
('PKW', 'Hyundai', 'Kona', 'Kona 1.6 T-GDI DCT', '{"N Line"}', 'SUV', 5, 'Benzin', 'Automatik', 146, 198, false, 27310.92),
('PKW', 'Hyundai', 'Kona', 'Kona Elektro 48 kWh', '{"Select","Trend"}', 'SUV', 5, 'Elektro', 'Automatik', 99, 135, false, 30252.10),
('PKW', 'Hyundai', 'Kona', 'Kona Elektro 65 kWh', '{"Prime","N Line"}', 'SUV', 5, 'Elektro', 'Automatik', 150, 204, false, 34453.78),
-- Ioniq 5
('PKW', 'Hyundai', 'Ioniq 5', 'Ioniq 5 58 kWh', '{"Basis","Dynamiq","Techniq"}', 'SUV', 5, 'Elektro', 'Automatik', 125, 170, false, 37394.96),
('PKW', 'Hyundai', 'Ioniq 5', 'Ioniq 5 77 kWh', '{"Dynamiq","Techniq","Uniq"}', 'SUV', 5, 'Elektro', 'Automatik', 168, 228, false, 41596.64),
('PKW', 'Hyundai', 'Ioniq 5', 'Ioniq 5 77 kWh AWD', '{"Techniq","Uniq"}', 'SUV', 5, 'Elektro', 'Automatik', 239, 325, true, 47058.82),
-- Ioniq 6
('PKW', 'Hyundai', 'Ioniq 6', 'Ioniq 6 53 kWh', '{"Dynamiq","Techniq"}', 'Limousine', 4, 'Elektro', 'Automatik', 111, 151, false, 37815.13),
('PKW', 'Hyundai', 'Ioniq 6', 'Ioniq 6 77 kWh', '{"Dynamiq","Techniq","Uniq"}', 'Limousine', 4, 'Elektro', 'Automatik', 168, 228, false, 42436.97),
('PKW', 'Hyundai', 'Ioniq 6', 'Ioniq 6 77 kWh AWD', '{"Uniq"}', 'Limousine', 4, 'Elektro', 'Automatik', 239, 325, true, 48319.33),

-- ========================
-- KIA
-- ========================
-- Picanto
('PKW', 'Kia', 'Picanto', 'Picanto 1.0', '{"Edition 7","Attract","Spirit","GT-Line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 49, 67, false, 11344.54),
('PKW', 'Kia', 'Picanto', 'Picanto 1.0 T-GDI', '{"Spirit","GT-Line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 74, 100, false, 14285.71),
-- Ceed
('PKW', 'Kia', 'Ceed', 'Ceed 1.0 T-GDI', '{"Edition 7","Spin","Spirit","GT-Line"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 88, 120, false, 20168.07),
('PKW', 'Kia', 'Ceed', 'Ceed 1.5 T-GDI DCT', '{"Spirit","GT-Line"}', 'Hatchback', 5, 'Benzin', 'Automatik', 117, 159, false, 24285.71),
('PKW', 'Kia', 'Ceed', 'Ceed Sportswagon 1.0 T-GDI', '{"Edition 7","Spin","Spirit"}', 'Kombi', 5, 'Benzin', 'Schaltgetriebe', 88, 120, false, 21428.57),
('PKW', 'Kia', 'Ceed', 'Ceed Sportswagon 1.5 T-GDI DCT', '{"Spirit","GT-Line"}', 'Kombi', 5, 'Benzin', 'Automatik', 117, 159, false, 25630.25),
('PKW', 'Kia', 'Ceed', 'Ceed Sportswagon 1.6 CRDi DCT', '{"Spirit","GT-Line"}', 'Kombi', 5, 'Diesel', 'Automatik', 100, 136, false, 26470.59),
-- Sportage
('PKW', 'Kia', 'Sportage', 'Sportage 1.6 T-GDI', '{"Spin","Spirit","GT-Line"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 110, 150, false, 27310.92),
('PKW', 'Kia', 'Sportage', 'Sportage 1.6 T-GDI Hybrid', '{"Spirit","GT-Line"}', 'SUV', 5, 'Hybrid', 'Automatik', 169, 230, false, 31932.77),
('PKW', 'Kia', 'Sportage', 'Sportage 1.6 T-GDI Hybrid AWD', '{"GT-Line"}', 'SUV', 5, 'Hybrid', 'Automatik', 169, 230, true, 34873.95),
('PKW', 'Kia', 'Sportage', 'Sportage 1.6 CRDi DCT', '{"Spirit","GT-Line"}', 'SUV', 5, 'Diesel', 'Automatik', 100, 136, false, 29831.93),
-- Niro
('PKW', 'Kia', 'Niro', 'Niro 1.6 GDI Hybrid', '{"Edition 7","Spin","Spirit"}', 'SUV', 5, 'Hybrid', 'Automatik', 104, 141, false, 27731.09),
('PKW', 'Kia', 'Niro', 'Niro PHEV', '{"Spirit","GT-Line"}', 'SUV', 5, 'Plug-in-Hybrid', 'Automatik', 133, 181, false, 31512.61),
('PKW', 'Kia', 'Niro', 'Niro EV 64 kWh', '{"Spirit","GT-Line"}', 'SUV', 5, 'Elektro', 'Automatik', 150, 204, false, 35714.29),
-- EV6
('PKW', 'Kia', 'EV6', 'EV6 58 kWh', '{"Air","Wind"}', 'SUV', 5, 'Elektro', 'Automatik', 125, 170, false, 38655.46),
('PKW', 'Kia', 'EV6', 'EV6 77 kWh', '{"Wind","GT-Line"}', 'SUV', 5, 'Elektro', 'Automatik', 168, 228, false, 42857.14),
('PKW', 'Kia', 'EV6', 'EV6 77 kWh AWD', '{"GT-Line"}', 'SUV', 5, 'Elektro', 'Automatik', 239, 325, true, 48319.33),
-- Sorento
('PKW', 'Kia', 'Sorento', 'Sorento 1.6 T-GDI Hybrid AWD', '{"Spirit","GT-Line","Platinum"}', 'SUV', 5, 'Hybrid', 'Automatik', 169, 230, true, 39075.63),
('PKW', 'Kia', 'Sorento', 'Sorento 2.2 CRDi AWD', '{"Spirit","GT-Line","Platinum"}', 'SUV', 5, 'Diesel', 'Automatik', 148, 202, true, 42016.81),

-- ========================
-- VOLVO
-- ========================
-- XC40
('PKW', 'Volvo', 'XC40', 'XC40 B3', '{"Essential","Plus","Ultimate"}', 'SUV', 5, 'Benzin', 'Automatik', 120, 163, false, 33613.45),
('PKW', 'Volvo', 'XC40', 'XC40 B4', '{"Plus","Ultimate"}', 'SUV', 5, 'Benzin', 'Automatik', 145, 197, false, 37394.96),
('PKW', 'Volvo', 'XC40', 'XC40 B4 AWD', '{"Plus","Ultimate"}', 'SUV', 5, 'Benzin', 'Automatik', 145, 197, true, 39495.80),
-- XC60
('PKW', 'Volvo', 'XC60', 'XC60 B4', '{"Essential","Plus","Ultimate"}', 'SUV', 5, 'Benzin', 'Automatik', 145, 197, false, 42857.14),
('PKW', 'Volvo', 'XC60', 'XC60 B5 AWD', '{"Plus","Ultimate"}', 'SUV', 5, 'Benzin', 'Automatik', 184, 250, true, 47058.82),
('PKW', 'Volvo', 'XC60', 'XC60 B4 D', '{"Essential","Plus"}', 'SUV', 5, 'Diesel', 'Automatik', 145, 197, false, 44537.82),
-- XC90
('PKW', 'Volvo', 'XC90', 'XC90 B5 AWD', '{"Essential","Plus","Ultimate"}', 'SUV', 5, 'Benzin', 'Automatik', 184, 250, true, 56722.69),
('PKW', 'Volvo', 'XC90', 'XC90 B6 AWD', '{"Plus","Ultimate"}', 'SUV', 5, 'Benzin', 'Automatik', 220, 299, true, 63865.55),
('PKW', 'Volvo', 'XC90', 'XC90 T8 eAWD PHEV', '{"Plus","Ultimate"}', 'SUV', 5, 'Plug-in-Hybrid', 'Automatik', 335, 455, true, 72268.91),
-- S60
('PKW', 'Volvo', 'S60', 'S60 B4', '{"Essential","Plus","Ultimate"}', 'Limousine', 4, 'Benzin', 'Automatik', 145, 197, false, 37394.96),
('PKW', 'Volvo', 'S60', 'S60 B5 AWD', '{"Plus","Ultimate"}', 'Limousine', 4, 'Benzin', 'Automatik', 184, 250, true, 42016.81),
-- V60
('PKW', 'Volvo', 'V60', 'V60 B3', '{"Essential","Plus","Ultimate"}', 'Kombi', 5, 'Benzin', 'Automatik', 120, 163, false, 36134.45),
('PKW', 'Volvo', 'V60', 'V60 B4', '{"Plus","Ultimate"}', 'Kombi', 5, 'Benzin', 'Automatik', 145, 197, false, 39495.80),
('PKW', 'Volvo', 'V60', 'V60 B4 D', '{"Plus","Ultimate"}', 'Kombi', 5, 'Diesel', 'Automatik', 145, 197, false, 41176.47),
-- V90
('PKW', 'Volvo', 'V90', 'V90 B5 AWD', '{"Plus","Ultimate"}', 'Kombi', 5, 'Benzin', 'Automatik', 184, 250, true, 50840.34),
('PKW', 'Volvo', 'V90', 'V90 B4 D', '{"Plus","Ultimate"}', 'Kombi', 5, 'Diesel', 'Automatik', 145, 197, false, 47899.16),
-- C40
('PKW', 'Volvo', 'C40', 'C40 Recharge Single Motor', '{"Plus","Ultimate"}', 'SUV Coupe', 5, 'Elektro', 'Automatik', 170, 231, false, 41596.64),
('PKW', 'Volvo', 'C40', 'C40 Recharge Twin Motor', '{"Ultimate"}', 'SUV Coupe', 5, 'Elektro', 'Automatik', 300, 408, true, 50420.17),
-- EX30
('PKW', 'Volvo', 'EX30', 'EX30 Single Motor', '{"Core","Plus","Ultra"}', 'SUV', 5, 'Elektro', 'Automatik', 200, 272, false, 30252.10),
('PKW', 'Volvo', 'EX30', 'EX30 Twin Motor AWD', '{"Ultra"}', 'SUV', 5, 'Elektro', 'Automatik', 315, 428, true, 38235.29),

-- ========================
-- PEUGEOT
-- ========================
-- 208
('PKW', 'Peugeot', '208', '208 PureTech 75', '{"Active","Allure","GT"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 55, 75, false, 15966.39),
('PKW', 'Peugeot', '208', '208 PureTech 100', '{"Allure","GT"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 74, 100, false, 18487.39),
('PKW', 'Peugeot', '208', '208 PureTech 130 EAT8', '{"GT"}', 'Hatchback', 5, 'Benzin', 'Automatik', 96, 130, false, 22689.08),
('PKW', 'Peugeot', '208', 'e-208', '{"Active","Allure","GT"}', 'Hatchback', 5, 'Elektro', 'Automatik', 100, 136, false, 29411.76),
-- 308
('PKW', 'Peugeot', '308', '308 PureTech 130', '{"Active","Allure","GT"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 96, 130, false, 23025.21),
('PKW', 'Peugeot', '308', '308 PureTech 130 EAT8', '{"Allure","GT"}', 'Hatchback', 5, 'Benzin', 'Automatik', 96, 130, false, 25630.25),
('PKW', 'Peugeot', '308', '308 BlueHDi 130 EAT8', '{"Allure","GT"}', 'Hatchback', 5, 'Diesel', 'Automatik', 96, 130, false, 27310.92),
('PKW', 'Peugeot', '308', 'e-308', '{"Allure","GT"}', 'Hatchback', 5, 'Elektro', 'Automatik', 115, 156, false, 35294.12),
('PKW', 'Peugeot', '308', '308 SW PureTech 130', '{"Allure","GT"}', 'Kombi', 5, 'Benzin', 'Schaltgetriebe', 96, 130, false, 24705.88),
('PKW', 'Peugeot', '308', '308 SW BlueHDi 130 EAT8', '{"Allure","GT"}', 'Kombi', 5, 'Diesel', 'Automatik', 96, 130, false, 28991.60),
-- 508
('PKW', 'Peugeot', '508', '508 PureTech 130 EAT8', '{"Active","Allure","GT"}', 'Limousine', 4, 'Benzin', 'Automatik', 96, 130, false, 32352.94),
('PKW', 'Peugeot', '508', '508 BlueHDi 130 EAT8', '{"Allure","GT"}', 'Limousine', 4, 'Diesel', 'Automatik', 96, 130, false, 34873.95),
('PKW', 'Peugeot', '508', '508 SW PureTech 130 EAT8', '{"Active","Allure","GT"}', 'Kombi', 5, 'Benzin', 'Automatik', 96, 130, false, 34033.61),
('PKW', 'Peugeot', '508', '508 SW BlueHDi 130 EAT8', '{"Allure","GT"}', 'Kombi', 5, 'Diesel', 'Automatik', 96, 130, false, 36554.62),
-- 2008
('PKW', 'Peugeot', '2008', '2008 PureTech 100', '{"Active","Allure","GT"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 74, 100, false, 21428.57),
('PKW', 'Peugeot', '2008', '2008 PureTech 130 EAT8', '{"Allure","GT"}', 'SUV', 5, 'Benzin', 'Automatik', 96, 130, false, 25210.08),
('PKW', 'Peugeot', '2008', 'e-2008', '{"Active","Allure","GT"}', 'SUV', 5, 'Elektro', 'Automatik', 100, 136, false, 31512.61),
-- 3008
('PKW', 'Peugeot', '3008', '3008 PureTech 130 EAT8', '{"Active","Allure","GT"}', 'SUV', 5, 'Benzin', 'Automatik', 96, 130, false, 30252.10),
('PKW', 'Peugeot', '3008', '3008 BlueHDi 130 EAT8', '{"Allure","GT"}', 'SUV', 5, 'Diesel', 'Automatik', 96, 130, false, 32773.11),
('PKW', 'Peugeot', '3008', '3008 Hybrid 225 e-EAT8', '{"Allure","GT"}', 'SUV', 5, 'Plug-in-Hybrid', 'Automatik', 165, 225, false, 37394.96),
-- 5008
('PKW', 'Peugeot', '5008', '5008 PureTech 130 EAT8', '{"Active","Allure","GT"}', 'SUV', 5, 'Benzin', 'Automatik', 96, 130, false, 33613.45),
('PKW', 'Peugeot', '5008', '5008 BlueHDi 130 EAT8', '{"Allure","GT"}', 'SUV', 5, 'Diesel', 'Automatik', 96, 130, false, 35714.29),

-- ========================
-- RENAULT
-- ========================
-- Clio
('PKW', 'Renault', 'Clio', 'Clio TCe 90', '{"Life","Equilibre","Techno","Esprit Alpine"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 67, 91, false, 14705.88),
('PKW', 'Renault', 'Clio', 'Clio E-Tech Hybrid 145', '{"Techno","Esprit Alpine"}', 'Hatchback', 5, 'Hybrid', 'Automatik', 105, 143, false, 21008.40),
-- Megane E-Tech
('PKW', 'Renault', 'Megane E-Tech', 'Megane E-Tech EV40 130', '{"Equilibre","Techno"}', 'SUV', 5, 'Elektro', 'Automatik', 96, 130, false, 33193.28),
('PKW', 'Renault', 'Megane E-Tech', 'Megane E-Tech EV60 220', '{"Techno","Iconic"}', 'SUV', 5, 'Elektro', 'Automatik', 160, 218, false, 38655.46),
-- Captur
('PKW', 'Renault', 'Captur', 'Captur TCe 90', '{"Life","Equilibre","Techno"}', 'SUV', 5, 'Benzin', 'Schaltgetriebe', 67, 91, false, 19327.73),
('PKW', 'Renault', 'Captur', 'Captur TCe 140', '{"Techno","Esprit Alpine"}', 'SUV', 5, 'Benzin', 'Automatik', 103, 140, false, 23445.38),
('PKW', 'Renault', 'Captur', 'Captur E-Tech Hybrid 145', '{"Techno","Esprit Alpine"}', 'SUV', 5, 'Hybrid', 'Automatik', 105, 143, false, 25630.25),
-- Arkana
('PKW', 'Renault', 'Arkana', 'Arkana TCe 140', '{"Equilibre","Techno","Esprit Alpine"}', 'SUV Coupe', 5, 'Benzin', 'Automatik', 103, 140, false, 25210.08),
('PKW', 'Renault', 'Arkana', 'Arkana E-Tech Hybrid 145', '{"Techno","Esprit Alpine"}', 'SUV Coupe', 5, 'Hybrid', 'Automatik', 105, 143, false, 27731.09),
-- Kangoo (NFZ)
('NFZ', 'Renault', 'Kangoo', 'Kangoo Rapid TCe 100', '{"Start","Business"}', 'Kastenwagen', 4, 'Benzin', 'Schaltgetriebe', 74, 100, false, 17647.06),
('NFZ', 'Renault', 'Kangoo', 'Kangoo Rapid Blue dCi 95', '{"Start","Business"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 70, 95, false, 19327.73),
('NFZ', 'Renault', 'Kangoo', 'Kangoo E-Tech Elektro', '{"Start","Business"}', 'Kastenwagen', 4, 'Elektro', 'Automatik', 90, 122, false, 28151.26),
-- Master (NFZ)
('NFZ', 'Renault', 'Master', 'Master dCi 120', '{"L1H1","L2H2"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 88, 120, false, 28571.43),
('NFZ', 'Renault', 'Master', 'Master dCi 150', '{"L2H2","L3H2"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 110, 150, false, 31092.44),
('NFZ', 'Renault', 'Master', 'Master dCi 180 AT', '{"L2H2"}', 'Kastenwagen', 4, 'Diesel', 'Automatik', 132, 180, false, 34033.61),

-- ========================
-- CITROEN
-- ========================
-- C3
('PKW', 'Citroen', 'C3', 'C3 PureTech 83', '{"Live","Feel","Shine"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 61, 83, false, 13865.55),
('PKW', 'Citroen', 'C3', 'C3 PureTech 110 EAT6', '{"Shine"}', 'Hatchback', 5, 'Benzin', 'Automatik', 81, 110, false, 18067.23),
('PKW', 'Citroen', 'C3', 'e-C3', '{"You","Max"}', 'Hatchback', 5, 'Elektro', 'Automatik', 83, 113, false, 20168.07),
-- C4
('PKW', 'Citroen', 'C4', 'C4 PureTech 100', '{"Live","Feel","Shine"}', 'Hatchback', 5, 'Benzin', 'Schaltgetriebe', 74, 100, false, 20588.24),
('PKW', 'Citroen', 'C4', 'C4 PureTech 130 EAT8', '{"Feel","Shine"}', 'Hatchback', 5, 'Benzin', 'Automatik', 96, 130, false, 23865.55),
('PKW', 'Citroen', 'C4', 'C4 BlueHDi 130 EAT8', '{"Shine"}', 'Hatchback', 5, 'Diesel', 'Automatik', 96, 130, false, 25630.25),
('PKW', 'Citroen', 'C4', 'e-C4 Elektro', '{"Feel","Shine"}', 'Hatchback', 5, 'Elektro', 'Automatik', 100, 136, false, 30252.10),
-- C5 X
('PKW', 'Citroen', 'C5 X', 'C5 X PureTech 130 EAT8', '{"Feel","Shine","Shine Pack"}', 'Limousine', 4, 'Benzin', 'Automatik', 96, 130, false, 28571.43),
('PKW', 'Citroen', 'C5 X', 'C5 X BlueHDi 130 EAT8', '{"Shine","Shine Pack"}', 'Limousine', 4, 'Diesel', 'Automatik', 96, 130, false, 31092.44),
('PKW', 'Citroen', 'C5 X', 'C5 X Hybrid 225 e-EAT8', '{"Shine","Shine Pack"}', 'Limousine', 4, 'Plug-in-Hybrid', 'Automatik', 165, 225, false, 35714.29),
-- Berlingo (NFZ)
('NFZ', 'Citroen', 'Berlingo', 'Berlingo Kastenwagen BlueHDi 100', '{"Worker","Control"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 75, 102, false, 18487.39),
('NFZ', 'Citroen', 'Berlingo', 'Berlingo Kastenwagen BlueHDi 130 EAT8', '{"Control","Driver"}', 'Kastenwagen', 4, 'Diesel', 'Automatik', 96, 130, false, 22689.08),
('NFZ', 'Citroen', 'Berlingo', 'e-Berlingo Kastenwagen', '{"Worker","Control"}', 'Kastenwagen', 4, 'Elektro', 'Automatik', 100, 136, false, 28571.43),
-- Jumpy (NFZ)
('NFZ', 'Citroen', 'Jumpy', 'Jumpy BlueHDi 120', '{"Worker","Control"}', 'Kastenwagen', 4, 'Diesel', 'Schaltgetriebe', 88, 120, false, 24285.71),
('NFZ', 'Citroen', 'Jumpy', 'Jumpy BlueHDi 180 EAT8', '{"Control","Driver"}', 'Kastenwagen', 4, 'Diesel', 'Automatik', 130, 177, false, 28991.60),
('NFZ', 'Citroen', 'Jumpy', 'e-Jumpy Elektro', '{"Worker","Control"}', 'Kastenwagen', 4, 'Elektro', 'Automatik', 100, 136, false, 34033.61);

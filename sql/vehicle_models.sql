-- ============================================================
-- vehicle_models: Einfache Marke/Modell-Tabelle
-- Ersetzt die alte vehicle_catalog Tabelle
-- Ausfuehren im Supabase SQL Editor
-- ============================================================

-- Alte Tabelle entfernen
DROP TABLE IF EXISTS vehicle_catalog CASCADE;

-- Neue Tabelle
CREATE TABLE IF NOT EXISTS vehicle_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('PKW', 'NFZ')),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vm_type_brand ON vehicle_models(vehicle_type, brand);
CREATE INDEX IF NOT EXISTS idx_vm_brand ON vehicle_models(brand);

ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read vehicle_models" ON vehicle_models;
CREATE POLICY "Anyone can read vehicle_models" ON vehicle_models FOR SELECT USING (true);

-- ============================================================
-- Seed-Daten: Aktuelle Modelle fuer den deutschen Markt
-- ============================================================

INSERT INTO vehicle_models (vehicle_type, brand, model) VALUES
-- Audi (26)
('PKW', 'Audi', 'A1'),
('PKW', 'Audi', 'A3 Sportback'),
('PKW', 'Audi', 'A3 Limousine'),
('PKW', 'Audi', 'A4 Limousine'),
('PKW', 'Audi', 'A4 Avant'),
('PKW', 'Audi', 'A5 Sportback'),
('PKW', 'Audi', 'A5 Coupé'),
('PKW', 'Audi', 'A6 Limousine'),
('PKW', 'Audi', 'A6 Avant'),
('PKW', 'Audi', 'A7'),
('PKW', 'Audi', 'A8'),
('PKW', 'Audi', 'Q2'),
('PKW', 'Audi', 'Q3'),
('PKW', 'Audi', 'Q4 e-tron'),
('PKW', 'Audi', 'Q5'),
('PKW', 'Audi', 'Q7'),
('PKW', 'Audi', 'Q8'),
('PKW', 'Audi', 'Q8 e-tron'),
('PKW', 'Audi', 'e-tron GT'),
('PKW', 'Audi', 'RS3'),
('PKW', 'Audi', 'RS4'),
('PKW', 'Audi', 'RS5'),
('PKW', 'Audi', 'RS6'),
('PKW', 'Audi', 'RS7'),
('PKW', 'Audi', 'RS Q8'),
('PKW', 'Audi', 'TT'),

-- BMW (30)
('PKW', 'BMW', '1er'),
('PKW', 'BMW', '2er Active Tourer'),
('PKW', 'BMW', '2er Gran Coupé'),
('PKW', 'BMW', '3er Limousine'),
('PKW', 'BMW', '3er Touring'),
('PKW', 'BMW', '4er Coupé'),
('PKW', 'BMW', '4er Gran Coupé'),
('PKW', 'BMW', '5er Limousine'),
('PKW', 'BMW', '5er Touring'),
('PKW', 'BMW', '7er'),
('PKW', 'BMW', '8er'),
('PKW', 'BMW', 'X1'),
('PKW', 'BMW', 'X2'),
('PKW', 'BMW', 'X3'),
('PKW', 'BMW', 'X4'),
('PKW', 'BMW', 'X5'),
('PKW', 'BMW', 'X6'),
('PKW', 'BMW', 'X7'),
('PKW', 'BMW', 'XM'),
('PKW', 'BMW', 'iX'),
('PKW', 'BMW', 'iX1'),
('PKW', 'BMW', 'iX3'),
('PKW', 'BMW', 'i4'),
('PKW', 'BMW', 'i5'),
('PKW', 'BMW', 'i7'),
('PKW', 'BMW', 'Z4'),
('PKW', 'BMW', 'M2'),
('PKW', 'BMW', 'M3'),
('PKW', 'BMW', 'M4'),
('PKW', 'BMW', 'M5'),

-- Mercedes-Benz (23)
('PKW', 'Mercedes-Benz', 'A-Klasse'),
('PKW', 'Mercedes-Benz', 'B-Klasse'),
('PKW', 'Mercedes-Benz', 'C-Klasse Limousine'),
('PKW', 'Mercedes-Benz', 'C-Klasse T-Modell'),
('PKW', 'Mercedes-Benz', 'E-Klasse Limousine'),
('PKW', 'Mercedes-Benz', 'E-Klasse T-Modell'),
('PKW', 'Mercedes-Benz', 'S-Klasse'),
('PKW', 'Mercedes-Benz', 'CLA'),
('PKW', 'Mercedes-Benz', 'CLE'),
('PKW', 'Mercedes-Benz', 'GLA'),
('PKW', 'Mercedes-Benz', 'GLB'),
('PKW', 'Mercedes-Benz', 'GLC'),
('PKW', 'Mercedes-Benz', 'GLC Coupé'),
('PKW', 'Mercedes-Benz', 'GLE'),
('PKW', 'Mercedes-Benz', 'GLE Coupé'),
('PKW', 'Mercedes-Benz', 'GLS'),
('PKW', 'Mercedes-Benz', 'G-Klasse'),
('PKW', 'Mercedes-Benz', 'EQA'),
('PKW', 'Mercedes-Benz', 'EQB'),
('PKW', 'Mercedes-Benz', 'EQC'),
('PKW', 'Mercedes-Benz', 'EQE'),
('PKW', 'Mercedes-Benz', 'EQS'),
('PKW', 'Mercedes-Benz', 'AMG GT'),

-- Volkswagen PKW (15)
('PKW', 'Volkswagen', 'Polo'),
('PKW', 'Volkswagen', 'Golf'),
('PKW', 'Volkswagen', 'Golf Variant'),
('PKW', 'Volkswagen', 'ID.3'),
('PKW', 'Volkswagen', 'ID.4'),
('PKW', 'Volkswagen', 'ID.5'),
('PKW', 'Volkswagen', 'ID.7'),
('PKW', 'Volkswagen', 'Passat Variant'),
('PKW', 'Volkswagen', 'Tiguan'),
('PKW', 'Volkswagen', 'T-Roc'),
('PKW', 'Volkswagen', 'T-Cross'),
('PKW', 'Volkswagen', 'Touareg'),
('PKW', 'Volkswagen', 'Taigo'),
('PKW', 'Volkswagen', 'Arteon'),
('PKW', 'Volkswagen', 'up!'),

-- VW Nutzfahrzeuge (8)
('NFZ', 'Volkswagen Nutzfahrzeuge', 'Caddy'),
('NFZ', 'Volkswagen Nutzfahrzeuge', 'Caddy Cargo'),
('NFZ', 'Volkswagen Nutzfahrzeuge', 'Transporter'),
('NFZ', 'Volkswagen Nutzfahrzeuge', 'Multivan'),
('NFZ', 'Volkswagen Nutzfahrzeuge', 'Crafter'),
('NFZ', 'Volkswagen Nutzfahrzeuge', 'Amarok'),
('NFZ', 'Volkswagen Nutzfahrzeuge', 'ID. Buzz'),
('NFZ', 'Volkswagen Nutzfahrzeuge', 'ID. Buzz Cargo'),

-- Škoda (12)
('PKW', 'Škoda', 'Fabia'),
('PKW', 'Škoda', 'Fabia Combi'),
('PKW', 'Škoda', 'Octavia'),
('PKW', 'Škoda', 'Octavia Combi'),
('PKW', 'Škoda', 'Superb'),
('PKW', 'Škoda', 'Superb Combi'),
('PKW', 'Škoda', 'Kamiq'),
('PKW', 'Škoda', 'Karoq'),
('PKW', 'Škoda', 'Kodiaq'),
('PKW', 'Škoda', 'Enyaq'),
('PKW', 'Škoda', 'Enyaq Coupé'),
('PKW', 'Škoda', 'Scala'),

-- SEAT (6)
('PKW', 'SEAT', 'Ibiza'),
('PKW', 'SEAT', 'Leon'),
('PKW', 'SEAT', 'Leon Sportstourer'),
('PKW', 'SEAT', 'Arona'),
('PKW', 'SEAT', 'Ateca'),
('PKW', 'SEAT', 'Tarraco'),

-- Cupra (6)
('PKW', 'Cupra', 'Formentor'),
('PKW', 'Cupra', 'Born'),
('PKW', 'Cupra', 'Leon'),
('PKW', 'Cupra', 'Leon Sportstourer'),
('PKW', 'Cupra', 'Ateca'),
('PKW', 'Cupra', 'Tavascan'),

-- Opel PKW (8)
('PKW', 'Opel', 'Corsa'),
('PKW', 'Opel', 'Astra'),
('PKW', 'Opel', 'Astra Sports Tourer'),
('PKW', 'Opel', 'Mokka'),
('PKW', 'Opel', 'Grandland'),
('PKW', 'Opel', 'Crossland'),
('PKW', 'Opel', 'Combo Life'),
('PKW', 'Opel', 'Zafira Life'),
-- Opel NFZ (3)
('NFZ', 'Opel', 'Combo Cargo'),
('NFZ', 'Opel', 'Vivaro'),
('NFZ', 'Opel', 'Movano'),

-- Ford PKW (7)
('PKW', 'Ford', 'Fiesta'),
('PKW', 'Ford', 'Focus'),
('PKW', 'Ford', 'Focus Turnier'),
('PKW', 'Ford', 'Puma'),
('PKW', 'Ford', 'Kuga'),
('PKW', 'Ford', 'Mustang Mach-E'),
('PKW', 'Ford', 'Explorer'),
-- Ford NFZ (5)
('NFZ', 'Ford', 'Ranger'),
('NFZ', 'Ford', 'Transit'),
('NFZ', 'Ford', 'Transit Custom'),
('NFZ', 'Ford', 'Transit Connect'),
('NFZ', 'Ford', 'Transit Courier'),

-- Toyota PKW (13)
('PKW', 'Toyota', 'Aygo X'),
('PKW', 'Toyota', 'Yaris'),
('PKW', 'Toyota', 'Yaris Cross'),
('PKW', 'Toyota', 'Corolla'),
('PKW', 'Toyota', 'Corolla Touring Sports'),
('PKW', 'Toyota', 'Camry'),
('PKW', 'Toyota', 'C-HR'),
('PKW', 'Toyota', 'RAV4'),
('PKW', 'Toyota', 'Highlander'),
('PKW', 'Toyota', 'Land Cruiser'),
('PKW', 'Toyota', 'bZ4X'),
('PKW', 'Toyota', 'Supra'),
('PKW', 'Toyota', 'GR86'),
-- Toyota NFZ (3)
('NFZ', 'Toyota', 'Hilux'),
('NFZ', 'Toyota', 'Proace'),
('NFZ', 'Toyota', 'Proace City'),

-- Hyundai PKW (10)
('PKW', 'Hyundai', 'i10'),
('PKW', 'Hyundai', 'i20'),
('PKW', 'Hyundai', 'i30'),
('PKW', 'Hyundai', 'i30 Kombi'),
('PKW', 'Hyundai', 'Ioniq 5'),
('PKW', 'Hyundai', 'Ioniq 6'),
('PKW', 'Hyundai', 'Kona'),
('PKW', 'Hyundai', 'Tucson'),
('PKW', 'Hyundai', 'Santa Fe'),
('PKW', 'Hyundai', 'Bayon'),
-- Hyundai NFZ (1)
('NFZ', 'Hyundai', 'Staria'),

-- Kia (12)
('PKW', 'Kia', 'Picanto'),
('PKW', 'Kia', 'Rio'),
('PKW', 'Kia', 'Ceed'),
('PKW', 'Kia', 'Ceed Sportswagon'),
('PKW', 'Kia', 'ProCeed'),
('PKW', 'Kia', 'Sportage'),
('PKW', 'Kia', 'Sorento'),
('PKW', 'Kia', 'Niro'),
('PKW', 'Kia', 'EV6'),
('PKW', 'Kia', 'EV9'),
('PKW', 'Kia', 'Stonic'),
('PKW', 'Kia', 'XCeed'),

-- Volvo (10)
('PKW', 'Volvo', 'S60'),
('PKW', 'Volvo', 'S90'),
('PKW', 'Volvo', 'V60'),
('PKW', 'Volvo', 'V90'),
('PKW', 'Volvo', 'XC40'),
('PKW', 'Volvo', 'XC60'),
('PKW', 'Volvo', 'XC90'),
('PKW', 'Volvo', 'C40'),
('PKW', 'Volvo', 'EX30'),
('PKW', 'Volvo', 'EX90'),

-- Peugeot PKW (12)
('PKW', 'Peugeot', '208'),
('PKW', 'Peugeot', '308'),
('PKW', 'Peugeot', '308 SW'),
('PKW', 'Peugeot', '408'),
('PKW', 'Peugeot', '508'),
('PKW', 'Peugeot', '508 SW'),
('PKW', 'Peugeot', '2008'),
('PKW', 'Peugeot', '3008'),
('PKW', 'Peugeot', '5008'),
('PKW', 'Peugeot', 'e-208'),
('PKW', 'Peugeot', 'e-308'),
('PKW', 'Peugeot', 'Rifter'),
-- Peugeot NFZ (3)
('NFZ', 'Peugeot', 'Partner'),
('NFZ', 'Peugeot', 'Expert'),
('NFZ', 'Peugeot', 'Boxer'),

-- Renault PKW (7)
('PKW', 'Renault', 'Clio'),
('PKW', 'Renault', 'Captur'),
('PKW', 'Renault', 'Arkana'),
('PKW', 'Renault', 'Mégane E-Tech'),
('PKW', 'Renault', 'Austral'),
('PKW', 'Renault', 'Espace'),
('PKW', 'Renault', 'Scénic E-Tech'),
-- Renault NFZ (3)
('NFZ', 'Renault', 'Kangoo'),
('NFZ', 'Renault', 'Trafic'),
('NFZ', 'Renault', 'Master'),

-- Citroën PKW (9)
('PKW', 'Citroën', 'C3'),
('PKW', 'Citroën', 'C3 Aircross'),
('PKW', 'Citroën', 'C4'),
('PKW', 'Citroën', 'C5 X'),
('PKW', 'Citroën', 'C5 Aircross'),
('PKW', 'Citroën', 'ë-C3'),
('PKW', 'Citroën', 'ë-C4'),
('PKW', 'Citroën', 'Berlingo'),
('PKW', 'Citroën', 'SpaceTourer'),
-- Citroën NFZ (3)
('NFZ', 'Citroën', 'Berlingo'),
('NFZ', 'Citroën', 'Jumpy'),
('NFZ', 'Citroën', 'Jumper'),

-- Fiat PKW (5)
('PKW', 'Fiat', '500'),
('PKW', 'Fiat', '500e'),
('PKW', 'Fiat', 'Panda'),
('PKW', 'Fiat', 'Tipo'),
('PKW', 'Fiat', '600'),
-- Fiat NFZ (3)
('NFZ', 'Fiat', 'Doblo'),
('NFZ', 'Fiat', 'Ducato'),
('NFZ', 'Fiat', 'Scudo'),

-- Mazda (8)
('PKW', 'Mazda', '2'),
('PKW', 'Mazda', '3'),
('PKW', 'Mazda', 'CX-3'),
('PKW', 'Mazda', 'CX-30'),
('PKW', 'Mazda', 'CX-5'),
('PKW', 'Mazda', 'CX-60'),
('PKW', 'Mazda', 'MX-5'),
('PKW', 'Mazda', 'MX-30'),

-- Nissan PKW (6)
('PKW', 'Nissan', 'Micra'),
('PKW', 'Nissan', 'Juke'),
('PKW', 'Nissan', 'Qashqai'),
('PKW', 'Nissan', 'X-Trail'),
('PKW', 'Nissan', 'Ariya'),
('PKW', 'Nissan', 'Leaf'),
-- Nissan NFZ (3)
('NFZ', 'Nissan', 'Townstar'),
('NFZ', 'Nissan', 'Primastar'),
('NFZ', 'Nissan', 'Interstar'),

-- Dacia (5)
('PKW', 'Dacia', 'Sandero'),
('PKW', 'Dacia', 'Sandero Stepway'),
('PKW', 'Dacia', 'Duster'),
('PKW', 'Dacia', 'Jogger'),
('PKW', 'Dacia', 'Spring'),

-- MG (6)
('PKW', 'MG', 'MG4'),
('PKW', 'MG', 'MG5'),
('PKW', 'MG', 'ZS'),
('PKW', 'MG', 'HS'),
('PKW', 'MG', 'Marvel R'),
('PKW', 'MG', 'Cyberster'),

-- Tesla (4)
('PKW', 'Tesla', 'Model 3'),
('PKW', 'Tesla', 'Model Y'),
('PKW', 'Tesla', 'Model S'),
('PKW', 'Tesla', 'Model X'),

-- Porsche (7)
('PKW', 'Porsche', '911'),
('PKW', 'Porsche', '718 Cayman'),
('PKW', 'Porsche', '718 Boxster'),
('PKW', 'Porsche', 'Taycan'),
('PKW', 'Porsche', 'Macan'),
('PKW', 'Porsche', 'Cayenne'),
('PKW', 'Porsche', 'Panamera'),

-- Mini (6)
('PKW', 'Mini', 'Cooper'),
('PKW', 'Mini', 'Cooper S'),
('PKW', 'Mini', 'Countryman'),
('PKW', 'Mini', 'Clubman'),
('PKW', 'Mini', 'Cabrio'),
('PKW', 'Mini', 'Aceman'),

-- Land Rover (7)
('PKW', 'Land Rover', 'Defender'),
('PKW', 'Land Rover', 'Discovery'),
('PKW', 'Land Rover', 'Discovery Sport'),
('PKW', 'Land Rover', 'Range Rover'),
('PKW', 'Land Rover', 'Range Rover Sport'),
('PKW', 'Land Rover', 'Range Rover Velar'),
('PKW', 'Land Rover', 'Range Rover Evoque'),

-- Jaguar (4)
('PKW', 'Jaguar', 'F-Pace'),
('PKW', 'Jaguar', 'E-Pace'),
('PKW', 'Jaguar', 'I-Pace'),
('PKW', 'Jaguar', 'XF'),

-- smart (4)
('PKW', 'smart', 'fortwo'),
('PKW', 'smart', 'forfour'),
('PKW', 'smart', '#1'),
('PKW', 'smart', '#3');

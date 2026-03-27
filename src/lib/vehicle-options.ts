// ============================================================
// Dropdown-Optionen fuer den Fahrzeug-Konfigurator
// ============================================================

// Section 2: Karosserie & Aufbau
export const BODY_TYPE_OPTIONS = [
  "Kleinwagen",
  "Kompaktklasse",
  "Limousine",
  "Kombi",
  "Coupé",
  "Cabrio",
  "SUV/Geländewagen",
  "Van/Minibus",
  "Transporter",
  "Pick-up",
  "Andere",
];

export const SEATS_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9];

export const DOORS_OPTIONS = [2, 3, 4, 5, 6, 7];

export const SLIDING_DOOR_OPTIONS = ["Keine", "Links", "Rechts", "Beidseitig"];

// Section 3: Motor & Antrieb
export const FUEL_TYPE_OPTIONS = [
  "Benzin",
  "Diesel",
  "Elektro",
  "Hybrid (Benzin/Elektro)",
  "Hybrid (Diesel/Elektro)",
  "Plug-in-Hybrid",
  "Wasserstoff",
  "Autogas (LPG)",
  "Erdgas (CNG)",
  "Ethanol (FFV/E85)",
  "Andere",
];

export const POWER_OPTIONS = [
  { kw: 37, ps: 50 },
  { kw: 55, ps: 75 },
  { kw: 66, ps: 90 },
  { kw: 74, ps: 100 },
  { kw: 81, ps: 110 },
  { kw: 85, ps: 116 },
  { kw: 96, ps: 130 },
  { kw: 110, ps: 150 },
  { kw: 120, ps: 163 },
  { kw: 130, ps: 177 },
  { kw: 140, ps: 190 },
  { kw: 150, ps: 204 },
  { kw: 160, ps: 218 },
  { kw: 170, ps: 231 },
  { kw: 180, ps: 245 },
  { kw: 190, ps: 258 },
  { kw: 200, ps: 272 },
  { kw: 220, ps: 299 },
  { kw: 250, ps: 340 },
  { kw: 280, ps: 381 },
  { kw: 300, ps: 408 },
  { kw: 350, ps: 476 },
  { kw: 400, ps: 544 },
];

export const DISPLACEMENT_OPTIONS = [1000, 1200, 1400, 1600, 1800, 2000, 2600, 3000, 5000, 7500];

export const TANK_SIZE_OPTIONS = [30, 50, 80, 100, 150];

export const CYLINDER_OPTIONS = [3, 4, 6, 8, 10, 12];

export const TRANSMISSION_OPTIONS = ["Automatik", "Halbautomatik", "Schaltgetriebe"];

export const DRIVE_TYPE_OPTIONS = ["Frontantrieb", "Heckantrieb", "Allrad"];

export const FUEL_CONSUMPTION_OPTIONS = [3, 5, 6, 7, 8, 9, 10, 12, 15];

// Section 4: Gewicht & Anhänger
export const WEIGHT_OPTIONS = [400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000];

export const TOW_BAR_OPTIONS = [
  "Keine",
  "Fest/abnehmbar/schwenkbar",
  "Abnehmbar oder schwenkbar",
  "Schwenkbar",
  "Anhängerrangierassistent",
];

export const TOW_CAPACITY_BRAKED_OPTIONS = [500, 1000, 1500, 2000, 2500, 3000, 3500];

export const TOW_CAPACITY_UNBRAKED_OPTIONS = [300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800];

export const NOSE_WEIGHT_OPTIONS = [50, 100, 150, 200];

// Section 5: Umwelt & Emissionen
export const ENVIRONMENTAL_BADGE_OPTIONS = ["1 (Keine)", "2 (Rot)", "3 (Gelb)", "4 (Grün)"];

export const EMISSION_CLASS_OPTIONS = [
  "Euro 1",
  "Euro 2",
  "Euro 3",
  "Euro 4",
  "Euro 5",
  "Euro 6",
  "Euro 6c",
  "Euro 6d-TEMP",
  "Euro 6d",
  "Euro 6e",
  "Euro 7",
];

// Section 6: Exterieur
export const EXTERIOR_COLOR_OPTIONS = [
  { name: "Schwarz", hex: "#1a1a1a" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Grau", hex: "#808080" },
  { name: "Braun", hex: "#8B4513" },
  { name: "Weiß", hex: "#FFFFFF" },
  { name: "Orange", hex: "#FF8C00" },
  { name: "Blau", hex: "#2563EB" },
  { name: "Gelb", hex: "#EAB308" },
  { name: "Rot", hex: "#DC2626" },
  { name: "Grün", hex: "#16A34A" },
  { name: "Silber", hex: "#C0C0C0" },
  { name: "Gold", hex: "#DAA520" },
  { name: "Lila", hex: "#7C3AED" },
];

export const PARKING_AID_OPTIONS = [
  "360°-Kamera",
  "Ausparkassistent",
  "Hinten",
  "Kamera",
  "Selbstlenkende Systeme",
  "Vorne",
];

export const CRUISE_CONTROL_OPTIONS = ["Tempomat", "Abstandstempomat"];

// Section 7: Exterieur-Extras
export const EXTERIOR_EXTRAS = [
  "Abgedunkelte Scheiben",
  "ABS",
  "Abstandswarner",
  "Adaptives Fahrwerk",
  "Adaptives Kurvenlicht",
  "Allwetterreifen",
  "Beheizbare Frontscheibe",
  "Behindertengerecht",
  "Berganfahrassistent",
  "Bi-Xenon Scheinwerfer",
  "Blendfreies Fernlicht",
  "Dachreling",
  "Elektr. Heckklappe",
  "Elektr. Wegfahrsperre",
  "ESP",
  "Faltdach",
  "Fernlichtassistent",
  "Geschwindigkeitsbegrenzer",
  "Kurvenlicht",
  "Laserlicht",
  "LED-Scheinwerfer",
  "LED-Tagfahrlicht",
  "Leichtmetallfelgen",
  "Lichtsensor",
  "Luftfederung",
  "Nachtsicht-Assistent",
  "Nebelscheinwerfer",
  "Notbremsassistent",
  "Notrad",
  "Pannenkit",
  "Panorama-Dach",
  "Regensensor",
  "Reifendruckkontrolle",
  "Reserverad",
  "Scheinwerferreinigung",
  "Schiebedach",
  "Schlüssellose Zentralverriegelung",
  "Servolenkung",
  "Sommerreifen",
  "Sportfahrwerk",
  "Sportpaket",
  "Spurhalteassistent",
  "Stahlfelgen",
  "Start/Stopp-Automatik",
  "Tagfahrlicht",
  "Totwinkel-Assistent",
  "Traktionskontrolle",
  "Verkehrszeichenerkennung",
  "Winterpaket",
  "Winterreifen",
  "Xenonscheinwerfer",
  "Zentralverriegelung",
];

// Section 8: Interieur
export const INTERIOR_COLOR_OPTIONS = ["Beige", "Schwarz", "Blau", "Braun", "Grau", "Rot", "Andere"];

export const INTERIOR_MATERIAL_OPTIONS = [
  "Alcantara",
  "Vollleder",
  "Teilleder",
  "Kunstleder",
  "Velours",
  "Stoff",
  "Andere",
];

export const AIRBAG_OPTIONS = [
  "Fahrer-Airbag",
  "Front-Airbags",
  "Front- und Seiten-Airbags",
  "Front-, Seiten- und weitere Airbags",
];

export const CLIMATE_OPTIONS = [
  "Keine",
  "Klimaanlage",
  "Klimaautomatik",
  "2-Zonen-Klimaautomatik",
  "3-Zonen-Klimaautomatik",
  "4-Zonen-Klimaautomatik",
];

// Section 9: Interieur-Extras
export const INTERIOR_EXTRAS = [
  "Alarmanlage",
  "Ambiente-Beleuchtung",
  "Android Auto",
  "Apple CarPlay",
  "Armlehne",
  "Beheizbares Lenkrad",
  "Bluetooth",
  "Bordcomputer",
  "CD-Spieler",
  "Elektr. Fensterheber",
  "Elektr. Seitenspiegel",
  "Elektr. Seitenspiegel anklappbar",
  "Elektr. Sitzeinstellung",
  "Elektr. Sitzeinstellung mit Memory",
  "Elektr. Sitzeinstellung hinten",
  "Freisprecheinrichtung",
  "Gepäckraumabtrennung",
  "Head-Up Display",
  "Induktionsladen Smartphones",
  "Innenspiegel autom. abblendend",
  "Isofix",
  "Isofix Beifahrersitz",
  "Lederlenkrad",
  "Lordosenstütze",
  "Massagesitze",
  "Müdigkeitswarner",
  "Multifunktionslenkrad",
  "Musikstreaming integriert",
  "Navigationssystem",
  "Notrufsystem",
  "Radio DAB",
  "Raucherpaket",
  "Rechtslenker",
  "Schaltwippen",
  "Sitzbelüftung",
  "Sitzheizung",
  "Sitzheizung hinten",
  "Skisack",
  "Soundsystem",
  "Sportsitze",
  "Sprachsteuerung",
  "Standheizung",
  "Touchscreen",
  "Tuner/Radio",
  "TV",
  "Umklappbarer Beifahrersitz",
  "USB",
  "Virtuelle Seitenspiegel",
  "Volldigitales Kombiinstrument",
  "WLAN/Wifi Hotspot",
];

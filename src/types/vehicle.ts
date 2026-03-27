export interface VehicleConfig {
  id: string;
  method: "configurator" | "upload";

  // Section 1: Fahrzeug (Pflicht)
  vehicleType: "PKW" | "NFZ";
  brand: string | null;
  model: string | null;
  quantity: number;

  // Section 2: Karosserie & Aufbau
  bodyType: string | null;
  seatsFrom: number | null;
  seatsTo: number | null;
  doors: number | null;
  slidingDoor: string | null;

  // Section 3: Motor & Antrieb
  fuelType: string | null;
  powerFrom: number | null;
  powerTo: number | null;
  displacementFrom: number | null;
  displacementTo: number | null;
  tankSizeFrom: number | null;
  tankSizeTo: number | null;
  cylinders: number | null;
  transmission: string | null;
  driveType: string | null;
  fuelConsumption: number | null;

  // Section 4: Gewicht & Anhänger
  weightFrom: number | null;
  weightTo: number | null;
  towBar: string | null;
  towCapacityBraked: number | null;
  towCapacityUnbraked: number | null;
  noseWeight: number | null;

  // Section 5: Umwelt & Emissionen
  environmentalBadge: string | null;
  emissionClass: string | null;
  particleFilter: boolean;

  // Section 6: Exterieur
  exteriorColor: string | null;
  matt: boolean;
  metallic: boolean;
  parkingAid: string[];
  cruiseControl: string | null;

  // Section 7: Exterieur-Extras
  exteriorExtras: string[];

  // Section 8: Interieur
  interiorColor: string | null;
  interiorMaterial: string | null;
  airbags: string | null;
  climate: string | null;

  // Section 9: Interieur-Extras
  interiorExtras: string[];

  // Section 10: Preis
  listPriceNet: number | null;
  listPriceGross: number | null;

  // Upload
  uploadFile?: File | null;
  configFilePath?: string | null;
}

export function createEmptyVehicleConfig(): VehicleConfig {
  return {
    id: crypto.randomUUID(),
    method: "configurator",
    vehicleType: "PKW",
    brand: null,
    model: null,
    quantity: 1,
    bodyType: null,
    seatsFrom: null,
    seatsTo: null,
    doors: null,
    slidingDoor: null,
    fuelType: null,
    powerFrom: null,
    powerTo: null,
    displacementFrom: null,
    displacementTo: null,
    tankSizeFrom: null,
    tankSizeTo: null,
    cylinders: null,
    transmission: null,
    driveType: null,
    fuelConsumption: null,
    weightFrom: null,
    weightTo: null,
    towBar: null,
    towCapacityBraked: null,
    towCapacityUnbraked: null,
    noseWeight: null,
    environmentalBadge: null,
    emissionClass: null,
    particleFilter: false,
    exteriorColor: null,
    matt: false,
    metallic: false,
    parkingAid: [],
    cruiseControl: null,
    exteriorExtras: [],
    interiorColor: null,
    interiorMaterial: null,
    airbags: null,
    climate: null,
    interiorExtras: [],
    listPriceNet: null,
    listPriceGross: null,
  };
}

/** Build the equipment JSONB from a VehicleConfig (fields that don't have their own DB column) */
export function buildEquipmentJson(v: VehicleConfig): Record<string, unknown> | null {
  const eq: Record<string, unknown> = {};
  if (v.seatsFrom != null) eq.seatsFrom = v.seatsFrom;
  if (v.seatsTo != null) eq.seatsTo = v.seatsTo;
  if (v.slidingDoor) eq.slidingDoor = v.slidingDoor;
  if (v.powerTo != null) eq.powerTo = v.powerTo;
  if (v.displacementFrom != null) eq.displacementFrom = v.displacementFrom;
  if (v.displacementTo != null) eq.displacementTo = v.displacementTo;
  if (v.tankSizeFrom != null) eq.tankSizeFrom = v.tankSizeFrom;
  if (v.tankSizeTo != null) eq.tankSizeTo = v.tankSizeTo;
  if (v.cylinders != null) eq.cylinders = v.cylinders;
  if (v.driveType) eq.driveType = v.driveType;
  if (v.fuelConsumption != null) eq.fuelConsumption = v.fuelConsumption;
  if (v.weightFrom != null) eq.weightFrom = v.weightFrom;
  if (v.weightTo != null) eq.weightTo = v.weightTo;
  if (v.towBar) eq.towBar = v.towBar;
  if (v.towCapacityBraked != null) eq.towCapacityBraked = v.towCapacityBraked;
  if (v.towCapacityUnbraked != null) eq.towCapacityUnbraked = v.towCapacityUnbraked;
  if (v.noseWeight != null) eq.noseWeight = v.noseWeight;
  if (v.environmentalBadge) eq.environmentalBadge = v.environmentalBadge;
  if (v.emissionClass) eq.emissionClass = v.emissionClass;
  if (v.particleFilter) eq.particleFilter = true;
  if (v.matt) eq.matt = true;
  if (v.parkingAid.length > 0) eq.parkingAid = v.parkingAid;
  if (v.cruiseControl) eq.cruiseControl = v.cruiseControl;
  if (v.exteriorExtras.length > 0) eq.exteriorExtras = v.exteriorExtras;
  if (v.interiorColor) eq.interiorColor = v.interiorColor;
  if (v.interiorMaterial) eq.interiorMaterial = v.interiorMaterial;
  if (v.airbags) eq.airbags = v.airbags;
  if (v.climate) eq.climate = v.climate;
  if (v.interiorExtras.length > 0) eq.interiorExtras = v.interiorExtras;
  return Object.keys(eq).length > 0 ? eq : null;
}

/** Map a DB tender_vehicle row back to VehicleConfig */
export function dbRowToVehicleConfig(v: Record<string, unknown>): VehicleConfig {
  const eq = (v.equipment || {}) as Record<string, unknown>;
  return {
    id: (v.id as string) || crypto.randomUUID(),
    method: ((v.config_method as string) === "upload" ? "upload" : "configurator") as VehicleConfig["method"],
    vehicleType: ((v.vehicle_type as string) || "PKW") as "PKW" | "NFZ",
    brand: (v.brand as string) || null,
    model: (v.model_name as string) || null,
    quantity: (v.quantity as number) || 1,
    bodyType: (v.body_type as string) || null,
    seatsFrom: (eq.seatsFrom as number) ?? null,
    seatsTo: (eq.seatsTo as number) ?? null,
    doors: (v.doors as number) ?? null,
    slidingDoor: (eq.slidingDoor as string) || null,
    fuelType: (v.fuel_type as string) || null,
    powerFrom: (v.power_kw as number) ?? null,
    powerTo: (eq.powerTo as number) ?? null,
    displacementFrom: (eq.displacementFrom as number) ?? null,
    displacementTo: (eq.displacementTo as number) ?? null,
    tankSizeFrom: (eq.tankSizeFrom as number) ?? null,
    tankSizeTo: (eq.tankSizeTo as number) ?? null,
    cylinders: (eq.cylinders as number) ?? null,
    transmission: (v.transmission as string) || null,
    driveType: (eq.driveType as string) || null,
    fuelConsumption: (eq.fuelConsumption as number) ?? null,
    weightFrom: (eq.weightFrom as number) ?? null,
    weightTo: (eq.weightTo as number) ?? null,
    towBar: (eq.towBar as string) || null,
    towCapacityBraked: (eq.towCapacityBraked as number) ?? null,
    towCapacityUnbraked: (eq.towCapacityUnbraked as number) ?? null,
    noseWeight: (eq.noseWeight as number) ?? null,
    environmentalBadge: (eq.environmentalBadge as string) || null,
    emissionClass: (eq.emissionClass as string) || null,
    particleFilter: (eq.particleFilter as boolean) || false,
    exteriorColor: (v.color as string) || null,
    matt: (eq.matt as boolean) || false,
    metallic: (v.metallic as boolean) || false,
    parkingAid: (eq.parkingAid as string[]) || [],
    cruiseControl: (eq.cruiseControl as string) || null,
    exteriorExtras: (eq.exteriorExtras as string[]) || [],
    interiorColor: (eq.interiorColor as string) || null,
    interiorMaterial: (eq.interiorMaterial as string) || null,
    airbags: (eq.airbags as string) || null,
    climate: (eq.climate as string) || null,
    interiorExtras: (eq.interiorExtras as string[]) || [],
    listPriceNet: (v.list_price_net as number) ?? null,
    listPriceGross: (v.list_price_gross as number) ?? null,
    configFilePath: (v.config_file_path as string) || null,
  };
}

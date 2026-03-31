"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Settings2, UploadCloud, Check, X, Minus, Plus, ChevronDown,
  Car, Cog, Gauge, Weight, Leaf, Paintbrush, Sparkles, Sofa,
  FileText, Trash2, Banknote, Search,
} from "lucide-react";
import { useVehicleModels, useVehicleModelsByBrand } from "@/hooks/useVehicleModels";
import type { VehicleConfig } from "@/types/vehicle";
import {
  BODY_TYPE_OPTIONS, SEATS_OPTIONS, DOORS_OPTIONS, SLIDING_DOOR_OPTIONS,
  FUEL_TYPE_OPTIONS, POWER_OPTIONS, DISPLACEMENT_OPTIONS, TANK_SIZE_OPTIONS,
  CYLINDER_OPTIONS, TRANSMISSION_OPTIONS, DRIVE_TYPE_OPTIONS, FUEL_CONSUMPTION_OPTIONS,
  WEIGHT_OPTIONS, TOW_BAR_OPTIONS, TOW_CAPACITY_BRAKED_OPTIONS, TOW_CAPACITY_UNBRAKED_OPTIONS,
  NOSE_WEIGHT_OPTIONS, ENVIRONMENTAL_BADGE_OPTIONS, EMISSION_CLASS_OPTIONS,
  EXTERIOR_COLOR_OPTIONS, PARKING_AID_OPTIONS, CRUISE_CONTROL_OPTIONS,
  INTERIOR_COLOR_OPTIONS, INTERIOR_MATERIAL_OPTIONS, AIRBAG_OPTIONS, CLIMATE_OPTIONS,
} from "@/lib/vehicle-options";

/* ------------------------------------------------------------------ */
/* Types & helpers                                                     */
/* ------------------------------------------------------------------ */

interface VehicleConfigFormProps {
  vehicle: VehicleConfig;
  onChange: (updated: VehicleConfig) => void;
  onSave: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  /** "tender" (default) shows method selection + save/cancel buttons.
   *  "instant-offer" hides method selection, upload mode, quantity stepper, and action buttons. */
  mode?: "tender" | "instant-offer";
}

type SectionDef = {
  title: string;
  icon: React.ElementType;
  required?: boolean;
};

const SECTIONS: SectionDef[] = [
  { title: "Fahrzeug", icon: Car, required: true },
  { title: "Karosserie & Aufbau", icon: Cog },
  { title: "Motor & Antrieb", icon: Gauge },
  { title: "Gewicht & Anhänger", icon: Weight },
  { title: "Umwelt & Emissionen", icon: Leaf },
  { title: "Exterieur", icon: Paintbrush },
  { title: "Interieur", icon: Sofa },
  { title: "Ausstattung", icon: Sparkles },
  { title: "Leasing & Finanzierung", icon: Banknote },
];

type EquipmentCategoryDef = {
  label: string;
  field: "exteriorExtras" | "interiorExtras";
  items: string[];
};

const EQUIPMENT_CATEGORIES: EquipmentCategoryDef[] = [
  {
    label: "Licht & Sicht",
    field: "exteriorExtras",
    items: [
      "Adaptives Kurvenlicht", "Bi-Xenon Scheinwerfer", "Blendfreies Fernlicht",
      "Fernlichtassistent", "Kurvenlicht", "Laserlicht", "LED-Scheinwerfer",
      "LED-Tagfahrlicht", "Lichtsensor", "Nachtsicht-Assistent",
      "Nebelscheinwerfer", "Scheinwerferreinigung", "Tagfahrlicht",
      "Xenonscheinwerfer",
    ],
  },
  {
    label: "Sicherheit & Assistenz",
    field: "exteriorExtras",
    items: [
      "ABS", "Abstandswarner", "Berganfahrassistent", "ESP",
      "Notbremsassistent", "Spurhalteassistent", "Totwinkel-Assistent",
      "Traktionskontrolle", "Verkehrszeichenerkennung",
      "Geschwindigkeitsbegrenzer", "Reifendruckkontrolle",
      "Elektr. Wegfahrsperre",
    ],
  },
  {
    label: "Fahrwerk & Räder",
    field: "exteriorExtras",
    items: [
      "Adaptives Fahrwerk", "Luftfederung", "Sportfahrwerk",
      "Leichtmetallfelgen", "Stahlfelgen", "Allwetterreifen",
      "Sommerreifen", "Winterreifen", "Winterpaket", "Sportpaket",
    ],
  },
  {
    label: "Komfort & Karosserie",
    field: "exteriorExtras",
    items: [
      "Abgedunkelte Scheiben", "Beheizbare Frontscheibe", "Dachreling",
      "Elektr. Heckklappe", "Faltdach", "Panorama-Dach", "Regensensor",
      "Schiebedach", "Schlüssellose Zentralverriegelung", "Servolenkung",
      "Start/Stopp-Automatik", "Zentralverriegelung", "Notrad", "Pannenkit",
      "Reserverad", "Behindertengerecht",
    ],
  },
  {
    label: "Infotainment & Konnektivität",
    field: "interiorExtras",
    items: [
      "Android Auto", "Apple CarPlay", "Bluetooth", "CD-Spieler",
      "Freisprecheinrichtung", "Induktionsladen Smartphones",
      "Musikstreaming integriert", "Navigationssystem", "Radio DAB",
      "Soundsystem", "Sprachsteuerung", "Touchscreen", "Tuner/Radio", "TV",
      "USB", "Volldigitales Kombiinstrument", "WLAN/Wifi Hotspot",
      "Head-Up Display",
    ],
  },
  {
    label: "Sitze & Komfort",
    field: "interiorExtras",
    items: [
      "Armlehne", "Beheizbares Lenkrad", "Elektr. Sitzeinstellung",
      "Elektr. Sitzeinstellung mit Memory", "Elektr. Sitzeinstellung hinten",
      "Lederlenkrad", "Lordosenstütze", "Massagesitze", "Sitzbelüftung",
      "Sitzheizung", "Sitzheizung hinten", "Sportsitze",
      "Umklappbarer Beifahrersitz", "Multifunktionslenkrad", "Schaltwippen",
    ],
  },
  {
    label: "Sicherheit & Überwachung",
    field: "interiorExtras",
    items: [
      "Alarmanlage", "Bordcomputer", "Elektr. Seitenspiegel",
      "Elektr. Seitenspiegel anklappbar", "Elektr. Fensterheber",
      "Innenspiegel autom. abblendend", "Isofix", "Isofix Beifahrersitz",
      "Müdigkeitswarner", "Notrufsystem", "Virtuelle Seitenspiegel",
    ],
  },
  {
    label: "Sonstiges Interieur",
    field: "interiorExtras",
    items: [
      "Ambiente-Beleuchtung", "Gepäckraumabtrennung", "Raucherpaket",
      "Rechtslenker", "Skisack", "Standheizung",
    ],
  },
];

const selectCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function VehicleConfigForm({
  vehicle,
  onChange,
  onSave,
  onCancel,
  showCancel = false,
  mode = "tender",
}: VehicleConfigFormProps) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [powerUnit, setPowerUnit] = useState<"kw" | "ps">("kw");
  const [equipmentSearch, setEquipmentSearch] = useState("");

  const { brands, loadingBrands } = useVehicleModels(vehicle.vehicleType);
  const { models, loadingModels } = useVehicleModelsByBrand(vehicle.vehicleType, vehicle.brand);

  const toggle = (i: number) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const update = (partial: Partial<VehicleConfig>) => onChange({ ...vehicle, ...partial });

  const isValid = vehicle.brand !== null && vehicle.model !== null
    && (vehicle.method !== "upload" || !!vehicle.uploadFile || !!vehicle.configFilePath);

  /* ---------- small reusable renderers ---------- */

  const sel = (
    label: string,
    value: string | number | null,
    options: (string | number)[],
    onCh: (v: string) => void,
    opts?: { disabled?: boolean; loading?: boolean; placeholder?: string; fmt?: (o: string | number) => string },
  ) => (
    <div className="space-y-1.5">
      <Label className="text-sm text-slate-600 font-semibold">{label}</Label>
      <select
        value={value ?? ""}
        onChange={(e) => onCh(e.target.value)}
        disabled={opts?.disabled || opts?.loading}
        className={selectCls}
      >
        <option value="" disabled>
          {opts?.placeholder || `${label.replace(" *", "")} wählen...`}
        </option>
        {options.map((o) => (
          <option key={String(o)} value={o}>
            {opts?.fmt ? opts.fmt(o) : String(o)}
          </option>
        ))}
      </select>
    </div>
  );

  const rangeSel = (
    label: string,
    from: number | null,
    to: number | null,
    options: number[],
    onFrom: (v: number | null) => void,
    onTo: (v: number | null) => void,
    opts?: { unit?: string; fmt?: (n: number) => string },
  ) => (
    <div className="space-y-1.5">
      <Label className="text-sm text-slate-600 font-semibold">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <select value={from ?? ""} onChange={(e) => onFrom(e.target.value ? Number(e.target.value) : null)} className={selectCls}>
          <option value="">von</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {opts?.fmt ? opts.fmt(o) : `${o.toLocaleString("de-DE")}${opts?.unit ? ` ${opts.unit}` : ""}`}
            </option>
          ))}
        </select>
        <select value={to ?? ""} onChange={(e) => onTo(e.target.value ? Number(e.target.value) : null)} className={selectCls}>
          <option value="">bis</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {opts?.fmt ? opts.fmt(o) : `${o.toLocaleString("de-DE")}${opts?.unit ? ` ${opts.unit}` : ""}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  /** Numeric input for exact values (instant-offer mode) */
  const numInput = (
    label: string,
    value: number | null,
    onCh: (v: number | null) => void,
    opts?: { unit?: string; placeholder?: string; step?: string },
  ) => (
    <div className="space-y-1.5">
      <Label className="text-sm text-slate-600 font-semibold">{label}{opts?.unit ? ` (${opts.unit})` : ""}</Label>
      <Input
        type="number"
        placeholder={opts?.placeholder || ""}
        step={opts?.step}
        value={value ?? ""}
        onChange={(e) => onCh(e.target.value ? Number(e.target.value) : null)}
        className="rounded-xl h-11 bg-slate-50 border-slate-200 text-base focus-visible:ring-blue-500"
      />
    </div>
  );

  const checkGrid = (items: string[], selected: string[], field: keyof VehicleConfig) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map((item) => (
        <label
          key={item}
          className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <Checkbox
            checked={selected.includes(item)}
            onCheckedChange={(c) => {
              const arr = selected as string[];
              update({ [field]: c ? [...arr, item] : arr.filter((e) => e !== item) } as Partial<VehicleConfig>);
            }}
          />
          <span className="text-slate-700 text-xs leading-tight">{item}</span>
        </label>
      ))}
    </div>
  );

  /* ---------- section header ---------- */

  const sectionHeader = (idx: number) => {
    const s = SECTIONS[idx];
    const Icon = s.icon;
    const isOpen = openSections.has(idx);
    return (
      <button onClick={() => toggle(idx)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Icon size={16} className="text-slate-500" />
          </div>
          <span className="font-bold text-navy-950 text-base">{s.title}</span>
          {s.required ? (
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-wide">Pflicht</span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Optional</span>
          )}
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
    );
  };

  /* ================================================================ */
  /* RENDER                                                            */
  /* ================================================================ */

  return (
    <div className="space-y-6">
      {/* ---- Method Selection (tender mode only) ---- */}
      {mode === "tender" && (
        <div>
          <h2 className="text-2xl font-bold text-navy-950 mb-6">Konfigurationsmethode wählen</h2>
          <RadioGroup
            value={vehicle.method}
            onValueChange={(v) => update({ method: v as VehicleConfig["method"] })}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            {[
              { id: "configurator", icon: Settings2, title: "Konfigurator", desc: "Schritt für Schritt konfigurieren" },
              { id: "upload", icon: UploadCloud, title: "Datei hochladen", desc: "PDF, DOC, TXT hochladen" },
            ].map((opt) => (
              <div key={opt.id} className="relative">
                <RadioGroupItem value={opt.id} id={`method-${vehicle.id}-${opt.id}`} className="peer sr-only" />
                <Label
                  htmlFor={`method-${vehicle.id}-${opt.id}`}
                  className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-300 peer-data-[state=checked]:border-2 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:shadow-md transition-all text-center h-full group"
                >
                  <div className="h-12 w-12 mb-3 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <opt.icon size={22} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <span className="font-bold text-navy-950 text-base block mb-1">{opt.title}</span>
                  <span className="text-xs font-normal text-slate-500">{opt.desc}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* ================================================================ */}
      {/* CONFIGURATOR MODE                                                */}
      {/* ================================================================ */}
      {(vehicle.method === "configurator" || mode === "instant-offer") && (
        <div className="space-y-3">
          {/* ---- Section 0: Fahrzeug (Pflicht) ---- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            {sectionHeader(0)}
            {openSections.has(0) && (
              <div className="p-6 border-t border-slate-100 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-slate-600 font-semibold">Fahrzeugart</Label>
                  <div className="flex gap-2">
                    {(["PKW", "NFZ"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => update({ vehicleType: t, brand: null, model: null })}
                        className={`flex-1 h-11 rounded-xl border text-base font-semibold transition-all ${
                          vehicle.vehicleType === t
                            ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sel("Marke *", vehicle.brand, brands, (v) => update({ brand: v, model: null }), { loading: loadingBrands })}
                  {sel("Modell *", vehicle.model, models, (v) => update({ model: v }), { disabled: !vehicle.brand, loading: loadingModels })}
                </div>
                {/* Quantity Stepper (tender mode only — instant-offer has its own stepper) */}
                {mode === "tender" && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <Label className="text-sm font-bold text-navy-950 block">Stückzahl</Label>
                      <p className="text-xs text-slate-500">Wie viele Fahrzeuge dieser Konfiguration?</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => update({ quantity: Math.max(1, vehicle.quantity - 1) })} disabled={vehicle.quantity <= 1} className="h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-40">
                        <Minus size={14} />
                      </button>
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        value={vehicle.quantity}
                        onChange={(e) => update({ quantity: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)) })}
                        className="w-14 text-center font-bold text-base rounded-lg h-9 bg-white border-slate-200 focus-visible:ring-blue-500"
                      />
                      <button onClick={() => update({ quantity: Math.min(99, vehicle.quantity + 1) })} className="h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ---- Section 1: Karosserie & Aufbau ---- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            {sectionHeader(1)}
            {openSections.has(1) && (
              <div className="p-6 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sel("Fahrzeugtyp", vehicle.bodyType, BODY_TYPE_OPTIONS, (v) => update({ bodyType: v }))}
                  {sel("Anzahl Türen", vehicle.doors, DOORS_OPTIONS, (v) => update({ doors: parseInt(v) }))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mode === "instant-offer"
                    ? sel("Anzahl Sitzplätze", vehicle.seatsFrom, SEATS_OPTIONS, (v) => update({ seatsFrom: v ? Number(v) : null }))
                    : rangeSel(
                        "Anzahl Sitzplätze",
                        vehicle.seatsFrom,
                        vehicle.seatsTo,
                        SEATS_OPTIONS,
                        (v) => update({ seatsFrom: v }),
                        (v) => update({ seatsTo: v }),
                        { fmt: (n) => (n === 9 ? "9+" : String(n)) },
                      )
                  }
                  {sel("Schiebetür", vehicle.slidingDoor, SLIDING_DOOR_OPTIONS, (v) => update({ slidingDoor: v }))}
                </div>
              </div>
            )}
          </div>

          {/* ---- Section 2: Motor & Antrieb ---- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            {sectionHeader(2)}
            {openSections.has(2) && (
              <div className="p-6 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sel("Kraftstoffart", vehicle.fuelType, FUEL_TYPE_OPTIONS, (v) => update({ fuelType: v }))}
                  {sel("Getriebe", vehicle.transmission, TRANSMISSION_OPTIONS, (v) => update({ transmission: v }))}
                </div>

                {mode === "instant-offer" ? (
                  <>
                    {/* Power with kW/PS toggle — always stored as kW */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-slate-600 font-semibold">Leistung</Label>
                        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                          {(["kw", "ps"] as const).map((u) => (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setPowerUnit(u)}
                              className={`px-3 py-1 text-xs font-bold transition-all ${
                                powerUnit === u
                                  ? "bg-blue-500 text-white"
                                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                              }`}
                            >
                              {u.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder={powerUnit === "kw" ? "z.B. 110" : "z.B. 150"}
                          value={
                            vehicle.powerFrom
                              ? powerUnit === "kw"
                                ? vehicle.powerFrom
                                : Math.round(vehicle.powerFrom * 1.35962)
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : null;
                            if (val === null) {
                              update({ powerFrom: null });
                            } else {
                              // Always store as kW
                              const kw = powerUnit === "kw" ? val : Math.round(val / 1.35962);
                              update({ powerFrom: kw });
                            }
                          }}
                          className="rounded-xl h-11 bg-slate-50 border-slate-200 text-base focus-visible:ring-blue-500 pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                          {powerUnit === "kw"
                            ? vehicle.powerFrom ? `= ${Math.round(vehicle.powerFrom * 1.35962)} PS` : "kW"
                            : vehicle.powerFrom ? `= ${vehicle.powerFrom} kW` : "PS"
                          }
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {numInput("Hubraum", vehicle.displacementFrom, (v) => update({ displacementFrom: v }), { unit: "cm³", placeholder: "z.B. 1998" })}
                      {numInput("Tankgröße", vehicle.tankSizeFrom, (v) => update({ tankSizeFrom: v }), { unit: "l", placeholder: "z.B. 55" })}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {sel("Zylinder", vehicle.cylinders, CYLINDER_OPTIONS, (v) => update({ cylinders: parseInt(v) }))}
                      {sel("Antriebsart", vehicle.driveType, DRIVE_TYPE_OPTIONS, (v) => update({ driveType: v }))}
                      {numInput("Verbrauch (komb.)", vehicle.fuelConsumption, (v) => update({ fuelConsumption: v }), { unit: "l/100km", placeholder: "z.B. 6.5", step: "0.1" })}
                    </div>
                  </>
                ) : (
                  <>
                    {rangeSel(
                      "Leistung",
                      vehicle.powerFrom,
                      vehicle.powerTo,
                      POWER_OPTIONS.map((p) => p.kw),
                      (v) => update({ powerFrom: v }),
                      (v) => update({ powerTo: v }),
                      {
                        fmt: (kw) => {
                          const p = POWER_OPTIONS.find((po) => po.kw === kw);
                          return p ? `${p.kw} kW (${p.ps} PS)` : `${kw} kW`;
                        },
                      },
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rangeSel("Hubraum", vehicle.displacementFrom, vehicle.displacementTo, DISPLACEMENT_OPTIONS, (v) => update({ displacementFrom: v }), (v) => update({ displacementTo: v }), { unit: "cm³" })}
                      {rangeSel("Tankgröße", vehicle.tankSizeFrom, vehicle.tankSizeTo, TANK_SIZE_OPTIONS, (v) => update({ tankSizeFrom: v }), (v) => update({ tankSizeTo: v }), { unit: "l" })}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {sel("Zylinder", vehicle.cylinders, CYLINDER_OPTIONS, (v) => update({ cylinders: parseInt(v) }))}
                      {sel("Antriebsart", vehicle.driveType, DRIVE_TYPE_OPTIONS, (v) => update({ driveType: v }))}
                      {sel("Verbrauch (komb.) bis", vehicle.fuelConsumption, FUEL_CONSUMPTION_OPTIONS, (v) => update({ fuelConsumption: parseInt(v) }), { fmt: (o) => `${o} l/100km` })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ---- Section 3: Gewicht & Anhänger ---- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            {sectionHeader(3)}
            {openSections.has(3) && (
              <div className="p-6 border-t border-slate-100 space-y-4">
                {mode === "instant-offer" ? (
                  <>
                    {numInput("Gewicht", vehicle.weightFrom, (v) => update({ weightFrom: v }), { unit: "kg", placeholder: "z.B. 1850" })}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sel("Anhängerkupplung", vehicle.towBar, TOW_BAR_OPTIONS, (v) => update({ towBar: v }))}
                      {numInput("Anhängelast gebremst", vehicle.towCapacityBraked, (v) => update({ towCapacityBraked: v }), { unit: "kg", placeholder: "z.B. 2000" })}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {numInput("Anhängelast ungebremst", vehicle.towCapacityUnbraked, (v) => update({ towCapacityUnbraked: v }), { unit: "kg", placeholder: "z.B. 750" })}
                      {numInput("Stützlast", vehicle.noseWeight, (v) => update({ noseWeight: v }), { unit: "kg", placeholder: "z.B. 80" })}
                    </div>
                  </>
                ) : (
                  <>
                    {rangeSel("Gewicht", vehicle.weightFrom, vehicle.weightTo, WEIGHT_OPTIONS, (v) => update({ weightFrom: v }), (v) => update({ weightTo: v }), { unit: "kg" })}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sel("Anhängerkupplung", vehicle.towBar, TOW_BAR_OPTIONS, (v) => update({ towBar: v }))}
                      {sel("Anhängelast gebremst ab", vehicle.towCapacityBraked, TOW_CAPACITY_BRAKED_OPTIONS, (v) => update({ towCapacityBraked: parseInt(v) }), { fmt: (o) => `${Number(o).toLocaleString("de-DE")} kg` })}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sel("Anhängelast ungebremst ab", vehicle.towCapacityUnbraked, TOW_CAPACITY_UNBRAKED_OPTIONS, (v) => update({ towCapacityUnbraked: parseInt(v) }), { fmt: (o) => `${o} kg` })}
                      {sel("Stützlast ab", vehicle.noseWeight, NOSE_WEIGHT_OPTIONS, (v) => update({ noseWeight: parseInt(v) }), { fmt: (o) => `${o} kg` })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ---- Section 4: Umwelt & Emissionen ---- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            {sectionHeader(4)}
            {openSections.has(4) && (
              <div className="p-6 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sel("Umweltplakette", vehicle.environmentalBadge, ENVIRONMENTAL_BADGE_OPTIONS, (v) => update({ environmentalBadge: v }))}
                  {sel("Schadstoffklasse", vehicle.emissionClass, EMISSION_CLASS_OPTIONS, (v) => update({ emissionClass: v }))}
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <Label className="text-sm font-semibold text-slate-700">Partikelfilter</Label>
                  <Switch checked={vehicle.particleFilter} onCheckedChange={(c) => update({ particleFilter: c })} />
                </div>
              </div>
            )}
          </div>

          {/* ---- Section 5: Exterieur ---- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            {sectionHeader(5)}
            {openSections.has(5) && (
              <div className="p-6 border-t border-slate-100 space-y-5">
                {/* Color Picker */}
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600 font-semibold">Außenfarbe</Label>
                  <div className="flex flex-wrap gap-3">
                    {EXTERIOR_COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => update({ exteriorColor: vehicle.exteriorColor === c.name ? null : c.name })}
                        className="group flex flex-col items-center gap-1 transition-transform"
                        title={c.name}
                      >
                        <div
                          className={`h-10 w-10 rounded-full border-2 transition-all ${
                            vehicle.exteriorColor === c.name
                              ? "border-blue-500 ring-2 ring-blue-200 scale-110"
                              : "border-slate-200 group-hover:border-slate-400"
                          } ${c.name === "Weiß" ? "shadow-inner" : ""}`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className={`text-[10px] ${vehicle.exteriorColor === c.name ? "text-blue-600 font-bold" : "text-slate-500"}`}>
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Matt / Metallic Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <Label className="text-sm font-semibold text-slate-700">Matt</Label>
                    <Switch checked={vehicle.matt} onCheckedChange={(c) => update({ matt: c })} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <Label className="text-sm font-semibold text-slate-700">Metallic</Label>
                    <Switch checked={vehicle.metallic} onCheckedChange={(c) => update({ metallic: c })} />
                  </div>
                </div>

                {/* Parking Aid */}
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600 font-semibold">Einparkhilfe</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PARKING_AID_OPTIONS.map((item) => (
                      <label key={item} className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                        <Checkbox
                          checked={vehicle.parkingAid.includes(item)}
                          onCheckedChange={(c) => {
                            update({ parkingAid: c ? [...vehicle.parkingAid, item] : vehicle.parkingAid.filter((e) => e !== item) });
                          }}
                        />
                        <span className="text-xs text-slate-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cruise Control */}
                {sel("Tempomat", vehicle.cruiseControl, CRUISE_CONTROL_OPTIONS, (v) => update({ cruiseControl: v }))}
              </div>
            )}
          </div>

          {/* ---- Section 6: Interieur ---- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            {sectionHeader(6)}
            {openSections.has(6) && (
              <div className="p-6 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sel("Farbe Innenausstattung", vehicle.interiorColor, INTERIOR_COLOR_OPTIONS, (v) => update({ interiorColor: v }))}
                  {sel("Material Innenausstattung", vehicle.interiorMaterial, INTERIOR_MATERIAL_OPTIONS, (v) => update({ interiorMaterial: v }))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sel("Airbags", vehicle.airbags, AIRBAG_OPTIONS, (v) => update({ airbags: v }))}
                  {sel("Klimatisierung", vehicle.climate, CLIMATE_OPTIONS, (v) => update({ climate: v }))}
                </div>
              </div>
            )}
          </div>

          {/* ---- Section 7: Ausstattung ---- */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            {sectionHeader(7)}
            {openSections.has(7) && (
              <div className="p-6 border-t border-slate-100 space-y-6">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Ausstattung suchen…"
                    value={equipmentSearch}
                    onChange={(e) => setEquipmentSearch(e.target.value)}
                    className="pl-9 rounded-xl h-11 bg-slate-50 border-slate-200 text-base focus-visible:ring-blue-500"
                  />
                  {equipmentSearch && (
                    <button onClick={() => setEquipmentSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
                {(() => {
                  const q = equipmentSearch.toLowerCase();
                  const filtered = EQUIPMENT_CATEGORIES.map((cat) => ({
                    ...cat,
                    items: q ? cat.items.filter((i) => i.toLowerCase().includes(q)) : cat.items,
                  })).filter((cat) => cat.items.length > 0);

                  if (filtered.length === 0) {
                    return <p className="text-sm text-slate-400 text-center py-4">Keine Ausstattung gefunden.</p>;
                  }

                  return filtered.map((cat) => {
                    const selected = cat.field === "exteriorExtras" ? vehicle.exteriorExtras : vehicle.interiorExtras;
                    const count = cat.items.filter((i) => selected.includes(i)).length;
                    return (
                      <div key={cat.label} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-navy-950">{cat.label}</h4>
                          {count > 0 && (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
                              {count}
                            </span>
                          )}
                        </div>
                        {checkGrid(cat.items, selected, cat.field)}
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* ---- Section 8: Leasing & Finanzierung (tender mode only) ---- */}
          {mode === "tender" && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              {sectionHeader(8)}
              {openSections.has(8) && (
                <div className="p-6 border-t border-slate-100 space-y-5">
                  <p className="text-sm text-slate-500">Neben dem Barkauf-Angebot (Standard): Welche weiteren Angebotsarten sollen Händler für dieses Fahrzeug abgeben?</p>

                  {/* Leasing */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${vehicle.leasingRequested ? "border-blue-300 bg-blue-50/30" : "border-slate-200"}`}>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`leasing-${vehicle.id}`}
                        checked={vehicle.leasingRequested}
                        onCheckedChange={(c) => update({ leasingRequested: c === true })}
                        className="scale-110"
                      />
                      <Label htmlFor={`leasing-${vehicle.id}`} className="font-bold text-navy-950 cursor-pointer">Leasing-Angebot einholen</Label>
                    </div>
                    {vehicle.leasingRequested && (
                      <div className="mt-4 ml-7 grid grid-cols-2 gap-4 animate-in fade-in">
                        <div className="space-y-1.5">
                          <Label className="text-sm text-slate-600 font-semibold">Laufzeit</Label>
                          <select value={vehicle.leasingDuration} onChange={(e) => update({ leasingDuration: e.target.value })} className={selectCls}>
                            <option value="24">24 Monate</option>
                            <option value="36">36 Monate</option>
                            <option value="48">48 Monate</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm text-slate-600 font-semibold">Laufleistung / Jahr</Label>
                          <select value={vehicle.leasingKmYear} onChange={(e) => update({ leasingKmYear: e.target.value })} className={selectCls}>
                            <option value="10000">10.000 km</option>
                            <option value="15000">15.000 km</option>
                            <option value="20000">20.000 km</option>
                            <option value="25000">25.000 km</option>
                            <option value="30000">30.000 km</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Financing */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${vehicle.financingRequested ? "border-blue-300 bg-blue-50/30" : "border-slate-200"}`}>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`financing-${vehicle.id}`}
                        checked={vehicle.financingRequested}
                        onCheckedChange={(c) => update({ financingRequested: c === true })}
                        className="scale-110"
                      />
                      <Label htmlFor={`financing-${vehicle.id}`} className="font-bold text-navy-950 cursor-pointer">Finanzierungs-Angebot einholen</Label>
                    </div>
                    {vehicle.financingRequested && (
                      <div className="mt-4 ml-7 grid grid-cols-2 gap-4 animate-in fade-in">
                        <div className="space-y-1.5">
                          <Label className="text-sm text-slate-600 font-semibold">Laufzeit</Label>
                          <select value={vehicle.financingDuration} onChange={(e) => update({ financingDuration: e.target.value })} className={selectCls}>
                            <option value="36">36 Monate</option>
                            <option value="48">48 Monate</option>
                            <option value="60">60 Monate</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm text-slate-600 font-semibold">Anzahlung (€)</Label>
                          <Input type="number" placeholder="z.B. 5000" value={vehicle.financingDownPayment}
                            onChange={(e) => update({ financingDownPayment: e.target.value })}
                            className="rounded-xl h-11 bg-slate-50 border-slate-200 text-base focus-visible:ring-blue-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* UPLOAD MODE (tender mode only)                                   */}
      {/* ================================================================ */}
      {mode === "tender" && vehicle.method === "upload" && (
        <div className="space-y-6">
          {/* Section 1 fields for upload */}
          <div className="border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-navy-950 text-base flex items-center gap-2">
              <Car size={16} className="text-slate-500" /> Fahrzeug-Grunddaten
            </h3>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-600 font-semibold">Fahrzeugart</Label>
              <div className="flex gap-2">
                {(["PKW", "NFZ"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => update({ vehicleType: t, brand: null, model: null })}
                    className={`flex-1 h-11 rounded-xl border text-base font-semibold transition-all ${
                      vehicle.vehicleType === t
                        ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sel("Marke *", vehicle.brand, brands, (v) => update({ brand: v, model: null }), { loading: loadingBrands })}
              {sel("Modell *", vehicle.model, models, (v) => update({ model: v }), { disabled: !vehicle.brand, loading: loadingModels })}
            </div>
            {/* Quantity */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <Label className="text-sm font-bold text-navy-950 block">Stückzahl</Label>
                <p className="text-xs text-slate-500">Wie viele Fahrzeuge dieser Konfiguration?</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => update({ quantity: Math.max(1, vehicle.quantity - 1) })} disabled={vehicle.quantity <= 1} className="h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-40">
                  <Minus size={14} />
                </button>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  value={vehicle.quantity}
                  onChange={(e) => update({ quantity: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)) })}
                  className="w-14 text-center font-bold text-base rounded-lg h-9 bg-white border-slate-200 focus-visible:ring-blue-500"
                />
                <button onClick={() => update({ quantity: Math.min(99, vehicle.quantity + 1) })} className="h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          {vehicle.uploadFile ? (
            <div className="border border-slate-200 bg-white rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <FileText size={22} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-navy-950 text-sm truncate">{vehicle.uploadFile.name}</p>
                  <p className="text-xs text-slate-500">{(vehicle.uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => update({ uploadFile: null })}
                className="h-9 w-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-2xl p-10 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group relative"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                const ALLOWED = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
                const MAX_SIZE = 10 * 1024 * 1024;
                if (!ALLOWED.includes(file.type)) {
                  alert("Nur PDF, DOC, DOCX oder TXT Dateien sind erlaubt.");
                  return;
                }
                if (file.size > MAX_SIZE) {
                  alert("Die Datei darf maximal 10 MB groß sein.");
                  return;
                }
                update({ uploadFile: file });
              }}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf,.doc,.docx,.txt";
                input.onchange = () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  const MAX_SIZE = 10 * 1024 * 1024;
                  if (file.size > MAX_SIZE) {
                    alert("Die Datei darf maximal 10 MB groß sein.");
                    return;
                  }
                  update({ uploadFile: file });
                };
                input.click();
              }}
            >
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <UploadCloud size={28} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h4 className="text-base font-bold text-navy-900 mb-1">Konfiguration hochladen</h4>
              <p className="text-slate-500 text-sm mb-4 max-w-xs text-center">
                Ziehen Sie Ihre PDF, DOC, DOCX oder TXT Datei in diesen Bereich oder klicken Sie hier. Max. 10 MB.
              </p>
              <Button variant="outline" className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50" onClick={(e) => e.stopPropagation()}>
                Datei auswählen
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ---- Save / Cancel (tender mode only) ---- */}
      {mode === "tender" && (
        <div className="flex justify-end gap-3 pt-2">
          {showCancel && onCancel && (
            <Button variant="ghost" onClick={onCancel} className="rounded-xl text-slate-500 h-11 px-6">
              <X size={16} className="mr-2" /> Abbrechen
            </Button>
          )}
          <Button
            onClick={onSave}
            disabled={!isValid}
            className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white h-11 px-8 font-semibold shadow-sm disabled:opacity-40"
          >
            <Check size={16} className="mr-2" /> Fahrzeug übernehmen
          </Button>
        </div>
      )}
    </div>
  );
}

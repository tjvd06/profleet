"use client";

import { useState } from "react";
import { ChevronDown, Car, Settings2, Gauge, Weight, Leaf, Palette, Sofa, Euro, FileDown } from "lucide-react";
import type { VehicleConfig } from "@/types/vehicle";

type Field = { label: string; value: string };
type Section = {
  key: string;
  title: string;
  icon: React.ElementType;
  fields: Field[];
  tags?: string[];
};

function kWtoPS(kw: number): number {
  return Math.round(kw * 1.36);
}

function formatRange(from: number | null, to: number | null, unit: string): string | null {
  if (from != null && to != null && from !== to) return `${from}–${to} ${unit}`;
  if (from != null) return `${from} ${unit}`;
  if (to != null) return `${to} ${unit}`;
  return null;
}

function buildSections(v: VehicleConfig): Section[] {
  const sections: Section[] = [];

  // 1. Fahrzeug
  const fahrzeug: Field[] = [];
  if (v.vehicleType) fahrzeug.push({ label: "Fahrzeugart", value: v.vehicleType });
  if (v.brand) fahrzeug.push({ label: "Marke", value: v.brand });
  if (v.model) fahrzeug.push({ label: "Modell", value: v.model });
  fahrzeug.push({ label: "Stückzahl", value: String(v.quantity) });
  if (fahrzeug.length > 0) sections.push({ key: "fahrzeug", title: "Fahrzeug", icon: Car, fields: fahrzeug });

  // 2. Karosserie & Aufbau
  const karosserie: Field[] = [];
  if (v.bodyType) karosserie.push({ label: "Fahrzeugtyp", value: v.bodyType });
  const seats = formatRange(v.seatsFrom, v.seatsTo, "");
  if (seats) karosserie.push({ label: "Sitzplätze", value: seats.trim() });
  if (v.doors != null) karosserie.push({ label: "Türen", value: String(v.doors) });
  if (v.slidingDoor && v.slidingDoor !== "Keine") karosserie.push({ label: "Schiebetür", value: v.slidingDoor });
  if (karosserie.length > 0) sections.push({ key: "karosserie", title: "Karosserie & Aufbau", icon: Settings2, fields: karosserie });

  // 3. Motor & Antrieb
  const motor: Field[] = [];
  if (v.fuelType) motor.push({ label: "Kraftstoff", value: v.fuelType });
  if (v.powerFrom != null || v.powerTo != null) {
    const parts: string[] = [];
    if (v.powerFrom != null && v.powerTo != null && v.powerFrom !== v.powerTo) {
      parts.push(`${v.powerFrom}–${v.powerTo} kW (${kWtoPS(v.powerFrom)}–${kWtoPS(v.powerTo)} PS)`);
    } else {
      const kw = v.powerFrom ?? v.powerTo!;
      parts.push(`${kw} kW (${kWtoPS(kw)} PS)`);
    }
    motor.push({ label: "Leistung", value: parts.join("") });
  }
  const disp = formatRange(v.displacementFrom, v.displacementTo, "ccm");
  if (disp) motor.push({ label: "Hubraum", value: disp });
  const tank = formatRange(v.tankSizeFrom, v.tankSizeTo, "L");
  if (tank) motor.push({ label: "Tankgröße", value: tank });
  if (v.cylinders != null) motor.push({ label: "Zylinder", value: String(v.cylinders) });
  if (v.transmission) motor.push({ label: "Getriebe", value: v.transmission });
  if (v.driveType) motor.push({ label: "Antriebsart", value: v.driveType });
  if (v.fuelConsumption != null) motor.push({ label: "Verbrauch", value: `${v.fuelConsumption} L/100km` });
  if (motor.length > 0) sections.push({ key: "motor", title: "Motor & Antrieb", icon: Gauge, fields: motor });

  // 4. Gewicht & Anhänger
  const gewicht: Field[] = [];
  const weight = formatRange(v.weightFrom, v.weightTo, "kg");
  if (weight) gewicht.push({ label: "Gewicht", value: weight });
  if (v.towBar && v.towBar !== "Keine") gewicht.push({ label: "Anhängerkupplung", value: v.towBar });
  if (v.towCapacityBraked != null) gewicht.push({ label: "Anhängelast gebremst", value: `${v.towCapacityBraked} kg` });
  if (v.towCapacityUnbraked != null) gewicht.push({ label: "Anhängelast ungebremst", value: `${v.towCapacityUnbraked} kg` });
  if (v.noseWeight != null) gewicht.push({ label: "Stützlast", value: `${v.noseWeight} kg` });
  if (gewicht.length > 0) sections.push({ key: "gewicht", title: "Gewicht & Anhänger", icon: Weight, fields: gewicht });

  // 5. Umwelt & Emissionen
  const umwelt: Field[] = [];
  if (v.environmentalBadge) umwelt.push({ label: "Umweltplakette", value: v.environmentalBadge });
  if (v.emissionClass) umwelt.push({ label: "Schadstoffklasse", value: v.emissionClass });
  if (v.particleFilter) umwelt.push({ label: "Partikelfilter", value: "Ja" });
  if (umwelt.length > 0) sections.push({ key: "umwelt", title: "Umwelt & Emissionen", icon: Leaf, fields: umwelt });

  // 6. Exterieur (+ Extras)
  const exterieur: Field[] = [];
  if (v.exteriorColor) exterieur.push({ label: "Außenfarbe", value: v.exteriorColor });
  if (v.matt) exterieur.push({ label: "Matt", value: "Ja" });
  if (v.metallic) exterieur.push({ label: "Metallic", value: "Ja" });
  if (v.parkingAid.length > 0) exterieur.push({ label: "Einparkhilfe", value: v.parkingAid.join(", ") });
  if (v.cruiseControl) exterieur.push({ label: "Tempomat", value: v.cruiseControl });
  const extTags = v.exteriorExtras.length > 0 ? v.exteriorExtras : undefined;
  if (exterieur.length > 0 || extTags) sections.push({ key: "exterieur", title: "Exterieur", icon: Palette, fields: exterieur, tags: extTags });

  // 7. Interieur (+ Extras)
  const interieur: Field[] = [];
  if (v.interiorColor) interieur.push({ label: "Farbe", value: v.interiorColor });
  if (v.interiorMaterial) interieur.push({ label: "Material", value: v.interiorMaterial });
  if (v.airbags) interieur.push({ label: "Airbags", value: v.airbags });
  if (v.climate) interieur.push({ label: "Klimatisierung", value: v.climate });
  const intTags = v.interiorExtras.length > 0 ? v.interiorExtras : undefined;
  if (interieur.length > 0 || intTags) sections.push({ key: "interieur", title: "Interieur", icon: Sofa, fields: interieur, tags: intTags });

  // 8. Preis
  const preis: Field[] = [];
  if (v.listPriceNet != null) preis.push({ label: "Listenpreis netto", value: `${v.listPriceNet.toLocaleString("de-DE")} €` });
  if (v.listPriceGross != null) preis.push({ label: "Listenpreis brutto", value: `${v.listPriceGross.toLocaleString("de-DE")} €` });
  if (preis.length > 0) sections.push({ key: "preis", title: "Preis", icon: Euro, fields: preis });

  return sections;
}

function CollapsibleSection({ section, defaultOpen }: { section: Section; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = section.icon;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-blue-600 shrink-0" />
          <span className="font-bold text-navy-950 text-sm">{section.title}</span>
        </div>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 py-4 bg-white animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {section.fields.map((f) => (
              <div key={f.label}>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{f.label}</div>
                <div className="font-semibold text-navy-950 text-sm">{f.value}</div>
              </div>
            ))}
          </div>
          {section.tags && section.tags.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Extras</div>
              <div className="flex flex-wrap gap-1.5">
                {section.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function VehicleDetailSections({
  vehicle,
  defaultOpenAll,
}: {
  vehicle: VehicleConfig;
  defaultOpenAll?: boolean;
}) {
  const sections = buildSections(vehicle);

  if (vehicle.method === "upload") {
    return (
      <div className="space-y-3">
        {/* Show basic info */}
        {sections.filter((s) => s.key === "fahrzeug").map((s) => (
          <CollapsibleSection key={s.key} section={s} defaultOpen={true} />
        ))}
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <FileDown size={20} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Detaillierte Konfiguration als Datei hochgeladen</p>
            <p className="text-amber-600 text-xs mt-0.5">Die Konfigurationsdatei wurde vom Nachfrager bereitgestellt.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sections.map((s, i) => (
        <CollapsibleSection key={s.key} section={s} defaultOpen={defaultOpenAll || i === 0} />
      ))}
    </div>
  );
}

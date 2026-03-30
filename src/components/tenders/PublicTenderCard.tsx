"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock, MapPin, ChevronDown, Car, TrendingDown, Users, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { VehicleDetailSections } from "@/components/tenders/VehicleDetailSections";
import { dbRowToVehicleConfig } from "@/types/vehicle";

interface PublicTenderCardProps {
  id: string;
  endAt: string;
  location: string;
  requestedTypes: string[];
  fleetDiscount: boolean;
  fleetDiscountPercent: number;
  offersCount: number;
  bestTotalPrice: number | null;
  totalVehicles: number;
  totalListPrice: number;
  rawVehicles: Record<string, unknown>[];
}

export function PublicTenderCard({ id, endAt, location, requestedTypes, fleetDiscount, fleetDiscountPercent, offersCount, bestTotalPrice, totalVehicles, totalListPrice, rawVehicles }: PublicTenderCardProps) {
  const [vehiclesExpanded, setVehiclesExpanded] = useState(false);

  const vehicleConfigs = useMemo(
    () => rawVehicles.map((v) => dbRowToVehicleConfig(v)),
    [rawVehicles],
  );

  // Time left
  const now = new Date();
  const end = new Date(endAt);
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const timeLeft = diffDays > 0
    ? `${diffDays}T ${diffHours}h`
    : `${Math.max(0, diffHours)}h`;
  const isUrgent = diffDays === 0 && diffHours < 12;

  return (
    <Card className="relative overflow-hidden rounded-3xl border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-mono text-xs px-2.5 py-1">
            {id.split("-")[0].toUpperCase()}
          </Badge>
          {requestedTypes.map((type) => (
            <Badge key={type} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2 py-0.5">{type}</Badge>
          ))}
          {fleetDiscount && (
            <Badge className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-0.5">
              Großkundenvertrag ({fleetDiscountPercent}%)
            </Badge>
          )}
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border shrink-0 ${
          isUrgent ? "text-red-600 bg-red-50 border-red-200" : "text-slate-600 bg-slate-50 border-slate-200"
        }`}>
          <Clock size={14} className={isUrgent ? "text-red-500" : "text-blue-500"} /> {timeLeft}
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

        {/* ── Column 1: Vehicles ──────────────────────────────── */}
        <div className="lg:col-span-7 p-5 sm:p-6 lg:border-r border-slate-100">
          {/* Vehicle cards */}
          <div className="space-y-3">
            {vehicleConfigs.map((config: ReturnType<typeof dbRowToVehicleConfig>, i: number) => {
              const raw = rawVehicles[i];
              return (
                <div key={config.id || i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  {/* Vehicle header */}
                  <div className="px-4 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Car size={16} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-navy-950 text-sm leading-tight truncate">
                          {vehicleConfigs.length > 1 && <span className="text-blue-600">#{i + 1} </span>}
                          {config.brand || "—"} {config.model || ""} {(raw as Record<string, unknown>)?.trim_level ? ` ${(raw as Record<string, unknown>).trim_level}` : ""}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="font-semibold">{config.quantity}x</span>
                          {config.fuelType && <><span className="text-slate-300">|</span> <span>{config.fuelType}</span></>}
                          {config.bodyType && <><span className="text-slate-300">|</span> <span>{config.bodyType}</span></>}
                          {config.exteriorColor && <><span className="text-slate-300">|</span> <span>{config.exteriorColor}</span></>}
                        </div>
                      </div>
                    </div>
                    {config.listPriceNet != null && (
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">UVP netto</div>
                        <div className="font-bold text-navy-950 text-sm">{config.listPriceNet.toLocaleString("de-DE")} €</div>
                      </div>
                    )}
                  </div>
                  {/* Expandable detail */}
                  {vehiclesExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <VehicleDetailSections vehicle={config} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Toggle details */}
          <button
            type="button"
            onClick={() => setVehiclesExpanded(!vehiclesExpanded)}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors mx-auto"
          >
            <ChevronDown size={14} className={`transition-transform duration-200 ${vehiclesExpanded ? "rotate-180" : ""}`} />
            {vehiclesExpanded ? "Details ausblenden" : "Alle Fahrzeugdetails anzeigen"}
          </button>

          {/* Multi-vehicle total */}
          {vehicleConfigs.length > 1 && (
            <div className="flex items-center justify-center bg-navy-950 text-white px-5 py-2.5 rounded-xl mt-4 text-sm">
              <span className="font-bold">
                Gesamt: {totalVehicles} Fahrzeug{totalVehicles !== 1 ? "e" : ""}
                {totalListPrice > 0 && <> · UVP {totalListPrice.toLocaleString("de-DE")} € netto</>}
              </span>
            </div>
          )}
        </div>

        {/* ── Column 2: Stats + CTA ──────────────────────────── */}
        <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mb-5">
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span>{location}</span>
          </div>

          {/* Offer stats */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Wettbewerb</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Angebote</div>
                <div className="text-2xl font-black text-navy-950">{offersCount}</div>
              </div>
              {offersCount > 0 && bestTotalPrice != null && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Bester Gesamtpreis netto</div>
                  <div className="font-bold text-green-600 text-sm flex items-center gap-1">
                    <TrendingDown size={14} />
                    {bestTotalPrice.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-auto pt-2">
            <Link href="/registrieren">
              <Button className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Angebot abgeben
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-slate-400 text-center mt-2.5 font-medium">
              Kostenlos als Händler registrieren
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock, AlertCircle, Building2, MapPin, CheckCircle2, Mail, Phone,
  ChevronDown, Car, TrendingDown, Users, Star,
} from "lucide-react";
import Link from "next/link";
import { RatingBadge } from "@/components/ui-custom/RatingBadge";
import { VehicleDetailSections } from "@/components/tenders/VehicleDetailSections";
import { ConfigFileDownload } from "@/components/tenders/ConfigFileDownload";
import { dbRowToVehicleConfig } from "@/types/vehicle";

export function DealerTenderCard({ tender }: { tender: any }) {
  const isPreferred = tender.isPreferredDealer;
  const [vehiclesExpanded, setVehiclesExpanded] = useState(false);

  const vehicleConfigs = useMemo(
    () => (tender.rawVehicles || []).map((v: Record<string, unknown>) => dbRowToVehicleConfig(v)),
    [tender.rawVehicles]
  );

  return (
    <Card className={`relative overflow-hidden rounded-3xl transition-all hover:shadow-xl ${isPreferred ? "border-amber-300 shadow-amber-100/50" : "border-slate-200 shadow-md shadow-slate-200/50"}`}>
      {/* Preferred dealer banner */}
      {isPreferred && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-sm font-bold px-6 py-2.5 flex items-center justify-center gap-2">
          <AlertCircle size={18} /> Sie wurden als Wunschhändler angefragt!
        </div>
      )}

      {/* ── Top Bar: ID + Status + Timer ───────────────────────────── */}
      <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-mono text-xs px-2.5 py-1">
            {tender.id.split("-")[0].toUpperCase()}
          </Badge>
          {tender.hasAnswered ? (
            <Badge className="bg-green-50 text-green-700 border border-green-200 font-semibold flex items-center gap-1 px-2.5 py-1">
              <CheckCircle2 size={12} /> Beantwortet
            </Badge>
          ) : (
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2.5 py-1">
              Neu
            </Badge>
          )}
          {tender.fleetDiscount && (
            <Badge className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1">
              Großkundenvertrag ({tender.fleetDiscountPercent}%)
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 text-sm font-bold bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shrink-0">
          <Clock size={15} className="text-blue-500" /> {tender.timeLeft}
        </div>
      </div>

      {/* ── Main Content: 3 columns on desktop ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

        {/* ── Column 1: Buyer Profile ──────────────────────────── */}
        <div className="lg:col-span-3 p-6 sm:p-8 lg:border-r border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <Building2 size={20} className="text-navy-800" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-navy-950 text-lg leading-tight truncate">{tender.buyerType}</h3>
              {tender.buyerName && tender.buyerName !== "—" && (
                <p className="text-sm text-slate-600 font-medium truncate">{tender.buyerName}</p>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {tender.buyerProfession && (
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Branche</div>
                <div className="text-sm font-semibold text-slate-700">{tender.buyerProfession}</div>
              </div>
            )}
            <div className="flex items-start gap-2 text-sm text-slate-600 font-medium">
              <MapPin size={14} className="shrink-0 mt-0.5 text-slate-400" />
              <span>
                {tender.buyerStreet && <>{tender.buyerStreet}, </>}
                {tender.buyerPlz || ""} {tender.buyerCity || tender.location}
              </span>
            </div>
            {tender.buyerEmail && (
              <a href={`mailto:${tender.buyerEmail}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                <Mail size={14} className="shrink-0" /> {tender.buyerEmail}
              </a>
            )}
            {tender.buyerPhone && (
              <a href={`tel:${tender.buyerPhone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                <Phone size={14} className="shrink-0" /> {tender.buyerPhone}
              </a>
            )}
          </div>

          {/* Rating box */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating</span>
              <RatingBadge score={tender.buyerRating} />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Erfolgsquote</span>
              <span className="font-bold text-navy-950">{tender.successRate}%</span>
            </div>
          </div>
        </div>

        {/* ── Column 2: Vehicles ───────────────────────────────── */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:border-r border-slate-100">
          {/* Requested types */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Angebotsarten</span>
            {tender.requestedTypes.map((type: string) => (
              <Badge key={type} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">{type}</Badge>
            ))}
          </div>

          {/* Vehicle cards */}
          <div className="space-y-3">
            {vehicleConfigs.map((config: any, i: number) => {
              const raw = tender.rawVehicles?.[i];
              return (
                <div key={config.id || i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  {/* Vehicle header */}
                  <div className="px-5 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Car size={18} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-navy-950 text-sm leading-tight truncate">
                          {vehicleConfigs.length > 1 && <span className="text-blue-600">#{i + 1} </span>}
                          {config.brand || "—"} {config.model || ""} {raw?.trim_level || ""}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="font-semibold">{config.quantity}x</span>
                          {config.fuelType && <><span className="text-slate-300">|</span> <span>{config.fuelType}</span></>}
                          {config.bodyType && <><span className="text-slate-300">|</span> <span>{config.bodyType}</span></>}
                        </div>
                      {config.method === "upload" && raw?.config_file_path && (
                        <div className="mt-1.5">
                          <ConfigFileDownload filePath={raw.config_file_path} />
                        </div>
                      )}
                      </div>
                    </div>
                    {config.listPriceGross != null && (
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">UVP brutto</div>
                        <div className="font-bold text-navy-950 text-sm">{config.listPriceGross.toLocaleString("de-DE")} €</div>
                      </div>
                    )}
                  </div>
                  {/* Expandable detail */}
                  {vehiclesExpanded && (
                    <div className="px-5 pb-4 border-t border-slate-100 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
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
            <div className="flex items-center justify-between bg-navy-950 text-white px-5 py-3 rounded-xl mt-4 text-sm">
              <span className="font-bold">
                Gesamt: {tender.totalVehicles} Fahrzeug{tender.totalVehicles !== 1 ? "e" : ""}
              </span>
              <span className="font-bold text-amber-400">
                ca. {(tender.totalPrice || 0).toLocaleString("de-DE")} € brutto
              </span>
            </div>
          )}
        </div>

        {/* ── Column 3: Prices + CTA ───────────────────────────── */}
        <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col">
          {/* Competitor stats */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Wettbewerb</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Angebote</div>
                <div className="text-2xl font-black text-navy-950">{tender.currentOffers}</div>
              </div>
              {tender.currentOffers > 0 && tender.bestTotalGross != null && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Bester Preis</div>
                  <div className="font-bold text-green-600 text-sm flex items-center gap-1">
                    <TrendingDown size={14} />
                    {(tender.bestTotalGross * 1.19).toLocaleString("de-DE", { maximumFractionDigits: 0 })} €
                  </div>
                  {tender.bestPriceNet != null && (
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {tender.bestPriceNet.toLocaleString("de-DE", { maximumFractionDigits: 0 })} € netto/Fzg.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* My offer stats (if answered) */}
          {tender.hasAnswered && tender.myTotalPrice != null && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-blue-500" />
                <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">Mein Angebot</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Gesamtpreis</div>
                  <div className="font-bold text-navy-950 text-sm">
                    {(tender.myTotalPrice * 1.19).toLocaleString("de-DE", { maximumFractionDigits: 0 })} € brutto
                  </div>
                </div>
                {tender.myPriceNet != null && (
                  <div>
                    <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Pro Fahrzeug</div>
                    <div className="font-bold text-navy-950 text-sm">
                      {tender.myPriceNet.toLocaleString("de-DE", { maximumFractionDigits: 0 })} € netto
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTA button pushed to bottom */}
          <div className="mt-auto pt-4">
            <Link
              href={`/dashboard/eingang/${tender.id}/angebot`}
              className={`w-full rounded-2xl shadow-lg text-white font-bold px-8 h-14 text-base transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                tender.hasAnswered
                  ? "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-slate-500/20"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/20"
              }`}
            >
              {tender.hasAnswered ? "Angebot bearbeiten" : "Jetzt Angebot erstellen"}
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

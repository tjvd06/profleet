"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, Building2, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { RatingBadge } from "@/components/ui-custom/RatingBadge";
import { VehicleDetailSections } from "@/components/tenders/VehicleDetailSections";
import { dbRowToVehicleConfig } from "@/types/vehicle";

export function DealerTenderCard({ tender }: { tender: any }) {
  const isPreferred = tender.isPreferredDealer;

  const vehicleConfigs = useMemo(
    () => (tender.rawVehicles || []).map((v: Record<string, unknown>) => dbRowToVehicleConfig(v)),
    [tender.rawVehicles]
  );

  return (
    <Card className={`relative overflow-hidden mb-6 rounded-3xl transition-all hover:shadow-lg ${isPreferred ? 'border-amber-300 shadow-amber-100/50' : 'border-slate-200 shadow-sm'}`}>
      {isPreferred && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-sm font-bold px-6 py-2.5 flex items-center justify-center gap-2 shadow-sm rounded-t-3xl">
          <AlertCircle size={18} /> Der Kunde hat Sie aktiv als Wunschhändler für diese Ausschreibung angefragt!
        </div>
      )}
      <div className="flex flex-col lg:flex-row">
        {/* Left Side: Buyer & Meta */}
        <div className="lg:w-1/3 bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-white border-slate-300 text-slate-600 font-mono shadow-sm">
                  {tender.id}
                </Badge>
                {tender.hasAnswered ? (
                  <Badge className="bg-green-100 text-green-700 border-none font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Beantwortet
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700 border-none font-semibold">
                    Neu
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 text-sm font-bold bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm shrink-0">
                <Clock size={16} className="text-blue-500" /> {tender.timeLeft}
              </div>
            </div>

            <div className="flex flex-col items-center text-center mt-6 mb-8">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-3 shadow-[0_4px_10px_rgba(0,0,0,0.03)] text-navy-800">
                <Building2 size={28} />
              </div>
              <h3 className="font-bold text-navy-950 text-lg">{tender.buyerType}</h3>
              <div className="flex items-center text-slate-500 text-sm mt-1.5 gap-1.5 font-medium">
                <MapPin size={16} /> {tender.location}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500">Käufer-Rating</span>
              <RatingBadge score={tender.buyerRating} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Erfolgsquote</span>
              <span className="font-bold text-navy-950 text-lg">{tender.successRate}%</span>
            </div>
          </div>
        </div>

        {/* Right Side: Vehicle Details & Action */}
        <div className="lg:w-2/3 p-6 sm:p-8 flex flex-col">
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-semibold">Angebotsarten:</Badge>
            {tender.requestedTypes.map((type: string) => (
              <Badge key={type} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">{type}</Badge>
            ))}
            {tender.fleetDiscount && <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 ml-2">Großkundenvertrag ({tender.fleetDiscountPercent}%)</Badge>}
          </div>

          {/* Per-vehicle detail cards */}
          <div className="space-y-4 mb-6">
            {vehicleConfigs.map((config: any, i: number) => {
              const raw = tender.rawVehicles?.[i];
              return (
                <div key={config.id || i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-navy-950 text-base">
                      {vehicleConfigs.length > 1 && <span className="text-blue-600 mr-1">Fahrzeug {i + 1}:</span>}
                      {config.brand || "—"} {config.model || ""} {raw?.trim_level || ""}
                      <span className="text-slate-500 font-normal ml-2">· {config.quantity} Stück</span>
                    </h3>
                    {config.listPriceGross != null && (
                      <span className="text-sm font-bold text-navy-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shrink-0">
                        ca. {config.listPriceGross.toLocaleString("de-DE")} € brutto
                      </span>
                    )}
                  </div>
                  <VehicleDetailSections vehicle={config} />
                </div>
              );
            })}
          </div>

          {/* Summary row for multi-vehicle */}
          {vehicleConfigs.length > 1 && (
            <div className="flex items-center justify-between bg-navy-950 text-white px-5 py-3 rounded-xl mb-6 text-sm">
              <span className="font-bold">
                Gesamt: {tender.totalVehicles} Fahrzeug{tender.totalVehicles !== 1 ? "e" : ""}
              </span>
              <span className="font-bold text-amber-400">
                ca. {(tender.totalPrice || 0).toLocaleString("de-DE")} € brutto
              </span>
            </div>
          )}

          {/* Price comparison section */}
          {(tender.hasAnswered || tender.currentOffers > 0) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {tender.currentOffers > 0 && (
                  <>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Top-Preis Gesamt</div>
                      <div className="font-bold text-green-600 text-base">
                        {tender.bestTotalGross != null
                          ? `${(tender.bestTotalGross * 1.19).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € brutto`
                          : "—"}
                      </div>
                      {tender.bestPriceNet != null && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {tender.bestPriceNet.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € netto/Fzg.
                        </div>
                      )}
                    </div>
                  </>
                )}
                {tender.hasAnswered && tender.myTotalPrice != null && (
                  <>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mein Preis Gesamt</div>
                      <div className="font-bold text-navy-950 text-base">
                        {(tender.myTotalPrice * 1.19).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € brutto
                      </div>
                      {tender.myPriceNet != null && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          {tender.myPriceNet.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € netto/Fzg.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500 font-medium">
              Aktuell <span className="font-bold text-navy-950 text-base">{tender.currentOffers}</span> Angebot{tender.currentOffers !== 1 ? "e" : ""} von Mitbewerbern
            </div>
            <Link
              href={`/dashboard/eingang/${tender.id}/angebot`}
              className={`w-full sm:w-auto rounded-xl shadow-md text-white font-bold px-10 h-14 text-base transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center ${
                tender.hasAnswered
                  ? "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 shadow-slate-500/20"
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

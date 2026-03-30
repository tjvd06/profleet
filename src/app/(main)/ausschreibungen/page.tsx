"use client";

import { useState, useEffect } from "react";
import { PublicTenderCard } from "@/components/tenders/PublicTenderCard";
import { Loader2, UserPlus, LogIn, Sparkles, Gavel, TrendingDown, Timer, ShieldCheck } from "lucide-react";
import { HeroSection } from "@/components/ui-custom/HeroSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";

const PUBLIC_LIMIT = 10;

interface TenderRow {
  id: string;
  status: string;
  end_at: string;
  created_at: string;
  delivery_plz: string | null;
  delivery_city: string | null;
  delivery_radius: number | null;
  tender_scope: string | null;
  tender_vehicles: Record<string, unknown>[];
}

interface TenderStats {
  tender_id: string;
  offer_count: number;
  best_total_price: number | null;
}

export default function AusschreibungenPage() {
  const { user, profile } = useAuth();
  const isLoggedIn = !!user && !!profile;

  const [supabase] = useState(() => createClient());
  const [tenders, setTenders] = useState<TenderRow[]>([]);
  const [stats, setStats] = useState<Map<string, TenderStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { count } = await supabase
        .from("tenders")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .gt("end_at", new Date().toISOString());

      setTotalCount(count || 0);

      // Fetch tenders with full vehicle data (all columns for VehicleDetailSections)
      const { data, error } = await supabase
        .from("tenders")
        .select("id, status, end_at, created_at, delivery_plz, delivery_city, delivery_radius, tender_scope, tender_vehicles(*)")
        .eq("status", "active")
        .gt("end_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(PUBLIC_LIMIT);

      if (!error && data) {
        const rows = data as unknown as TenderRow[];
        setTenders(rows);

        if (rows.length > 0) {
          const ids = rows.map((t) => t.id);
          const { data: statsData } = await supabase.rpc("public_tender_stats", {
            p_tender_ids: ids,
          });
          if (statsData) {
            const map = new Map<string, TenderStats>();
            for (const s of statsData as TenderStats[]) {
              map.set(s.tender_id, s);
            }
            setStats(map);
          }
        }
      }
      setLoading(false);
    })();
  }, [supabase]);

  const totalOffers = Array.from(stats.values()).reduce((sum, s) => sum + s.offer_count, 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <HeroSection
        badge="Live-Ausschreibungen"
        badgeIcon={<Gavel size={14} />}
        title={<>Aktive Ausschreibungen{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">auf einen Blick</span></>}
        subtitle="Geschäftskunden suchen die besten Konditionen für ihre Flotte. Geben Sie Angebote ab und gewinnen Sie neue Kunden."
      >
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3.5 min-w-[140px]">
            <div className="text-2xl font-black text-white">{totalCount}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Aktive Ausschreibungen</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3.5 min-w-[140px]">
            <div className="text-2xl font-black text-emerald-400">{totalOffers}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Abgegebene Angebote</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3.5 min-w-[140px]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={18} className="text-green-400" />
              <span className="text-sm font-bold text-green-400">Verifiziert</span>
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Alle Nachfrager</div>
          </div>
        </div>
      </HeroSection>

      {/* ─── Content ──────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex items-center justify-between mt-10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-cyan-400" />
            <h2 className="text-lg font-bold text-navy-950">
              {loading ? "Lade..." : `${tenders.length} neueste Ausschreibungen`}
            </h2>
          </div>
          {!loading && totalCount > PUBLIC_LIMIT && !isLoggedIn && (
            <span className="text-sm font-semibold text-slate-400">
              +{totalCount - PUBLIC_LIMIT} weitere
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-500" size={36} />
              <span className="text-sm font-semibold text-slate-400">Ausschreibungen werden geladen...</span>
            </div>
          </div>
        ) : tenders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Timer size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-navy-950 mb-2">Derzeit keine aktiven Ausschreibungen</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Neue Ausschreibungen werden laufend veröffentlicht. Schauen Sie bald wieder vorbei.
            </p>
          </div>
        ) : (
          <>
            {/* Tender List */}
            <div className="flex flex-col gap-6">
              {tenders.map((tender) => {
                const vehicles = tender.tender_vehicles || [];
                const tenderStats = stats.get(tender.id);

                // Requested types
                const requestedTypes: string[] = ["Kauf"];
                const seen = new Set<string>();
                vehicles.forEach((v: Record<string, unknown>) => {
                  const leasing = v.leasing as Record<string, unknown> | null;
                  const financing = v.financing as Record<string, unknown> | null;
                  if (leasing?.requested && !seen.has("Leasing")) { requestedTypes.push("Leasing"); seen.add("Leasing"); }
                  if (financing?.requested && !seen.has("Finanzierung")) { requestedTypes.push("Finanzierung"); seen.add("Finanzierung"); }
                });

                const hasFleetDiscount = vehicles.some((v: Record<string, unknown>) => v.fleet_discount && (v.fleet_discount as number) > 0);
                const fleetDiscountPercent = (vehicles.find((v: Record<string, unknown>) => v.fleet_discount)?.fleet_discount as number) || 0;

                const totalVehicles = vehicles.reduce((sum: number, v: Record<string, unknown>) => sum + ((v.quantity as number) || 1), 0);
                const totalListPrice = vehicles.reduce((sum: number, v: Record<string, unknown>) => sum + (((v.list_price_net as number) || 0) * ((v.quantity as number) || 1)), 0);

                // Location
                const locationParts: string[] = [];
                if (tender.delivery_city) locationParts.push(tender.delivery_city);
                else if (tender.delivery_plz) locationParts.push(tender.delivery_plz);
                if (tender.delivery_radius) locationParts.push(`${tender.delivery_radius} km`);
                if (tender.tender_scope === "bundesweit" && !tender.delivery_city) locationParts.push("Bundesweit");
                const location = locationParts.join(" · ") || "Deutschland";

                return (
                  <PublicTenderCard
                    key={tender.id}
                    id={tender.id}
                    endAt={tender.end_at}
                    location={location}
                    requestedTypes={requestedTypes}
                    fleetDiscount={hasFleetDiscount}
                    fleetDiscountPercent={fleetDiscountPercent}
                    offersCount={tenderStats?.offer_count ?? 0}
                    bestTotalPrice={tenderStats?.best_total_price ?? null}
                    totalVehicles={totalVehicles}
                    totalListPrice={totalListPrice}
                    rawVehicles={vehicles}
                  />
                );
              })}
            </div>

            {/* Public: CTA banner */}
            {!isLoggedIn && totalCount > PUBLIC_LIMIT && (
              <div className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 p-8 md:p-12">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
                <div className="relative z-10 text-center max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
                    <Sparkles size={14} /> {totalCount - PUBLIC_LIMIT} weitere Ausschreibungen verfügbar
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                    Alle Ausschreibungen einsehen & bieten
                  </h2>
                  <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                    Registrieren Sie sich als Händler, um alle aktiven Ausschreibungen zu sehen und Angebote abzugeben.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/registrieren">
                      <Button className="h-13 px-8 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold text-base shadow-lg shadow-blue-600/20">
                        <UserPlus size={18} className="mr-2" /> Kostenlos registrieren
                      </Button>
                    </Link>
                    <Link href="/anmelden">
                      <Button variant="outline" className="h-13 px-8 rounded-xl border-white/20 text-white hover:bg-white/10 font-bold text-base backdrop-blur-sm">
                        <LogIn size={18} className="mr-2" /> Anmelden
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Trust signals */}
            {!isLoggedIn && (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200/80 p-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy-950">Verifizierte Nachfrager</div>
                    <div className="text-xs text-slate-500">Nur geprüfte Geschäftskunden</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200/80 p-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <TrendingDown size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy-950">Beste Konditionen</div>
                    <div className="text-xs text-slate-500">Wettbewerb sichert faire Preise</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200/80 p-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Timer size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy-950">Zeitlich begrenzt</div>
                    <div className="text-xs text-slate-500">Schnell bieten lohnt sich</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

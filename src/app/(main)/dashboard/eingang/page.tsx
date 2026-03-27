"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DealerTenderCard } from "@/components/tenders/DealerTenderCard";
import { Button } from "@/components/ui/button";
import { Loader2, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";

type TenderVehicle = {
  id: string;
  brand: string | null;
  model_name: string | null;
  model_series: string | null;
  trim_level: string | null;
  list_price_gross: number | null;
  list_price_net: number | null;
  quantity: number;
  config_method: string | null;
  fleet_discount: number | null;
  leasing: any;
  financing: any;
  alt_preferences: any;
  fuel_type: string | null;
  body_type: string | null;
  color: string | null;
  equipment: any;
};

type Tender = {
  id: string;
  buyer_id: string;
  status: string;
  start_at: string | null;
  end_at: string | null;
  delivery_plz: string | null;
  delivery_city: string | null;
  tender_scope: string;
  created_at: string;
  tender_vehicles: TenderVehicle[];
};

function timeLeft(endAt: string | null): string {
  if (!endAt) return "—";
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "Abgelaufen";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days} Tage ${hours} Std.`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours} Std. ${mins} Min.`;
}

function mapTenderToCardProps(
  tender: Tender,
  answeredTenderIds: Set<string>,
  offerStats: Record<string, { count: number; bestPriceNet: number | null; bestTotalGross: number | null }>,
  myOffers: Record<string, { purchasePriceNet: number; totalPrice: number }>,
) {
  const vehicles = tender.tender_vehicles.map(v => ({
    quantity: v.quantity,
    brand: v.brand || "—",
    model: [v.model_name, v.trim_level].filter(Boolean).join(" ") || "—",
    specs: [v.fuel_type, v.body_type, v.color].filter(Boolean).join(" · ") || "",
    price: v.list_price_gross || 0,
  }));

  const totalVehicles = tender.tender_vehicles.reduce((sum, v) => sum + v.quantity, 0);
  const totalPrice = tender.tender_vehicles.reduce((sum, v) => sum + ((v.list_price_gross || 0) * v.quantity), 0);

  const hasFleetDiscount = tender.tender_vehicles.some(v => v.fleet_discount && v.fleet_discount > 0);
  const fleetDiscountPercent = tender.tender_vehicles.find(v => v.fleet_discount)?.fleet_discount || 0;

  const requestedTypes: string[] = ["Kauf"];
  const seen = new Set<string>();
  tender.tender_vehicles.forEach(v => {
    if (v.leasing?.requested && !seen.has("Leasing")) { requestedTypes.push("Leasing"); seen.add("Leasing"); }
    if (v.financing?.requested && !seen.has("Finanzierung")) { requestedTypes.push("Finanzierung"); seen.add("Finanzierung"); }
  });

  return {
    id: tender.id,
    timeLeft: timeLeft(tender.end_at),
    buyerType: "Unternehmen",
    location: tender.delivery_plz
      ? `${tender.delivery_city || "Unbekannt"} (${tender.delivery_plz})`
      : tender.tender_scope === "bundesweit" ? "Bundesweit" : "Lokal",
    buyerRating: 95,
    successRate: 80,
    isPreferredDealer: false,
    requestedTypes,
    fleetDiscount: hasFleetDiscount,
    fleetDiscountPercent: fleetDiscountPercent,
    currentOffers: offerStats[tender.id]?.count ?? 0,
    bestPriceNet: offerStats[tender.id]?.bestPriceNet ?? null,
    bestTotalGross: offerStats[tender.id]?.bestTotalGross ?? null,
    myPriceNet: myOffers[tender.id]?.purchasePriceNet ?? null,
    myTotalPrice: myOffers[tender.id]?.totalPrice ?? null,
    vehicles,
    totalVehicles,
    totalPrice,
    hasAnswered: answeredTenderIds.has(tender.id),
    rawVehicles: tender.tender_vehicles,
  };
}

export default function InboxPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!authLoading && profile && profile.role !== "anbieter") {
      router.replace("/dashboard");
    }
  }, [authLoading, profile]);

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [answeredTenderIds, setAnsweredTenderIds] = useState<Set<string>>(new Set());
  const [offerStats, setOfferStats] = useState<Record<string, { count: number; bestPriceNet: number | null; bestTotalGross: number | null }>>({});
  const [myOffers, setMyOffers] = useState<Record<string, { purchasePriceNet: number; totalPrice: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    let cancelled = false;
    setLoading(true);

    const run = async () => {
      try {
        const [tendersResult, offersResult] = await Promise.all([
          Promise.race([
            supabase
              .from("tenders")
              .select("*, tender_vehicles(*)")
              .eq("status", "active")
              .order("created_at", { ascending: false }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("TIMEOUT")), 10000)
            ),
          ]),
          supabase
            .from("offers")
            .select("tender_id, purchase_price, total_price")
            .eq("dealer_id", user.id),
        ]);

        if (cancelled) return;
        const { data, error: err } = tendersResult as any;
        const { data: offersData } = offersResult as any;

        if (err) {
          console.error("[Eingang] Supabase error:", err.message);
          setError(err.message);
        } else if (data) {
          setTenders(data as Tender[]);
          const answered = new Set<string>();
          const myOfferMap: Record<string, { purchasePriceNet: number; totalPrice: number }> = {};
          if (offersData) {
            (offersData as { tender_id: string; purchase_price: number | null; total_price: number | null }[]).forEach((o) => {
              answered.add(o.tender_id);
              if (!myOfferMap[o.tender_id]) {
                myOfferMap[o.tender_id] = { purchasePriceNet: 0, totalPrice: 0 };
              }
              myOfferMap[o.tender_id].purchasePriceNet += o.purchase_price || 0;
              myOfferMap[o.tender_id].totalPrice += o.total_price || 0;
            });
          }
          setAnsweredTenderIds(answered);
          setMyOffers(myOfferMap);

          // Fetch aggregated competitor offer stats via RPC (excludes own offers)
          const tenderIds = (data as Tender[]).map((t) => t.id);
          const stats: Record<string, { count: number; bestPriceNet: number | null; bestTotalGross: number | null }> = {};
          if (tenderIds.length > 0) {
            const { data: statsData } = await supabase.rpc("get_tender_offer_stats", {
              tender_ids: tenderIds,
            });
            if (statsData) {
              (statsData as { tender_id: string; offer_count: number; best_price_net: number | null; best_total_gross: number | null }[]).forEach((s) => {
                stats[s.tender_id] = { count: s.offer_count, bestPriceNet: s.best_price_net, bestTotalGross: s.best_total_gross };
              });
            }
          }
          setOfferStats(stats);
        }
      } catch (e: any) {
        if (cancelled) return;
        const isTimeout = e?.message === "TIMEOUT";
        console.error("[Eingang] Error:", e?.message);
        setError(
          isTimeout
            ? "Daten konnten nicht geladen werden. Bitte Seite neu laden."
            : e?.message || "Unbekannter Fehler"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [authLoading, user?.id]);

  const totalActive = tenders.length;
  const totalVehiclesAll = tenders.reduce(
    (sum, t) => sum + t.tender_vehicles.reduce((s, v) => s + v.quantity, 0),
    0
  );

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-24">
      {/* Header Segment */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white py-12 md:py-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Eingang Ausschreibungen</h1>
              <p className="text-lg text-blue-100/80 max-w-2xl leading-relaxed">
                {loading
                  ? "Ausschreibungen werden geladen…"
                  : `Aktuell ${totalActive} aktive Ausschreibung${totalActive !== 1 ? "en" : ""} mit ${totalVehiclesAll} Fahrzeug${totalVehiclesAll !== 1 ? "en" : ""} verfügbar.`
                }
              </p>
            </div>
            {!loading && tenders.length > 0 && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 flex gap-6 mt-auto">
                <div className="text-center px-4">
                  <div className="text-2xl font-black text-cyan-300">{totalActive}</div>
                  <div className="text-sm font-semibold text-blue-200/80 uppercase tracking-wider">Aktiv</div>
                </div>
                <div className="text-center px-4 border-l border-white/20">
                  <div className="text-2xl font-black text-cyan-300">{totalVehiclesAll}</div>
                  <div className="text-sm font-semibold text-blue-200/80 uppercase tracking-wider">Fahrzeuge</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-slate-400">
            <Loader2 className="animate-spin mr-3" size={28} />
            <span className="text-lg font-semibold">Ausschreibungen werden geladen…</span>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center text-center">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg w-full">
              <h3 className="text-lg font-bold text-red-800 mb-2">Fehler beim Laden</h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button variant="outline" className="rounded-xl border-red-200 text-red-700 hover:bg-red-100" onClick={() => window.location.reload()}>
                Erneut versuchen
              </Button>
            </div>
          </div>
        ) : tenders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
              <Inbox size={36} />
            </div>
            <h3 className="text-xl font-bold text-navy-950 mb-2">Keine aktiven Ausschreibungen</h3>
            <p className="text-slate-500 max-w-sm">Derzeit gibt es keine offenen Ausschreibungen. Schauen Sie später noch einmal vorbei.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 md:gap-8">
            {tenders.map((tender) => (
              <DealerTenderCard key={tender.id} tender={mapTenderToCardProps(tender, answeredTenderIds, offerStats, myOffers)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

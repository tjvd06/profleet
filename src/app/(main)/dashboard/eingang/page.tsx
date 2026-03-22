"use client";

import { useState, useEffect } from "react";
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
  quantity: number;
  config_method: string | null;
  fleet_discount: number | null;
  leasing: any;
  financing: any;
  alt_preferences: any;
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

function mapTenderToCardProps(tender: Tender) {
  const vehicles = tender.tender_vehicles.map(v => ({
    quantity: v.quantity,
    brand: v.brand || "—",
    model: [v.model_name, v.trim_level].filter(Boolean).join(" ") || "—",
    specs: [v.model_series, v.config_method].filter(Boolean).join(" · ") || "",
    price: v.list_price_gross || 0,
  }));

  const hasFleetDiscount = tender.tender_vehicles.some(v => v.fleet_discount && v.fleet_discount > 0);
  const fleetDiscountPercent = tender.tender_vehicles.find(v => v.fleet_discount)?.fleet_discount || 0;

  const requestedTypes: string[] = ["Kauf"];
  tender.tender_vehicles.forEach(v => {
    if (v.leasing?.requested) requestedTypes.push("Leasing");
    if (v.financing?.requested) requestedTypes.push("Finanzierung");
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
    currentOffers: 0,
    vehicles,
  };
}

export default function InboxPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [supabase] = useState(() => createClient());
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    (async () => {
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from("tenders")
          .select("*, tender_vehicles(*)")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (err) {
          console.error("[Eingang] Supabase error:", err.message);
          setError(err.message);
        } else if (data) {
          setTenders(data as Tender[]);
        }
      } catch (e: any) {
        console.error("[Eingang] Exception:", e);
        setError(e?.message || "Unbekannter Fehler");
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user?.id]);

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
                  : `Aktuell ${tenders.length} aktive Ausschreibung${tenders.length !== 1 ? "en" : ""} verfügbar.`
                }
              </p>
            </div>
            {!loading && tenders.length > 0 && (
              <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 flex gap-4 mt-auto">
                <div className="text-center px-4">
                  <div className="text-2xl font-black text-cyan-300">{tenders.length}</div>
                  <div className="text-sm font-semibold text-blue-200/80 uppercase tracking-wider">Aktiv</div>
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
              <DealerTenderCard key={tender.id} tender={mapTenderToCardProps(tender)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

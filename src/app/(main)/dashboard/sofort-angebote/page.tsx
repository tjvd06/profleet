"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { InstantOfferCard } from "@/components/tenders/InstantOfferCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, SlidersHorizontal, Plus, Zap } from "lucide-react";

// ─── Mock data (same pool as public marketplace) ─────────────────────────────
// TODO: replace with Supabase query once instant_offers table is live
const MOCK_OFFERS = [
  {
    id: "IO-101",
    brand: "Audi",
    model: "A4 Avant 40 TDI S line",
    specs: "150 kW (204 PS) · Automatik · Diesel · Mythosschwarz Metallic",
    availability: "Sofort verfügbar",
    listPrice: 62450,
    offerPrice: 50896,
    savingsPercent: 18.5,
    leasingRate: 549,
    financeRate: 590,
    dealerRating: 98,
    dealerLocation: "München (DE)",
    dealerId: "dealer-demo-1",
  },
  {
    id: "IO-102",
    brand: "BMW",
    model: "530e xDrive Limousine",
    specs: "220 kW (299 PS) · Automatik · Hybrid · Saphirschwarz",
    availability: "In Zulauf (ca. 14 Tage)",
    listPrice: 78500,
    offerPrice: 66725,
    savingsPercent: 15.0,
    leasingRate: 689,
    financeRate: null,
    dealerRating: 95,
    dealerLocation: "Stuttgart (DE)",
    dealerId: "dealer-demo-2",
  },
  {
    id: "IO-103",
    brand: "Mercedes-Benz",
    model: "C 300 e T-Modell",
    specs: "230 kW (313 PS) · Automatik · Hybrid · Polarweiß",
    availability: "Sofort verfügbar",
    listPrice: 68900,
    offerPrice: 57876,
    savingsPercent: 16.0,
    leasingRate: 610,
    financeRate: 650,
    dealerRating: 92,
    dealerLocation: "Berlin (DE)",
    dealerId: "dealer-demo-3",
  },
  {
    id: "IO-104",
    brand: "VW",
    model: "Tiguan R-Line 2.0 TDI",
    specs: "110 kW (150 PS) · DSG · Diesel · Pure White",
    availability: "Sofort verfügbar",
    listPrice: 53400,
    offerPrice: 42720,
    savingsPercent: 20.0,
    leasingRate: 429,
    financeRate: 459,
    dealerRating: 88,
    dealerLocation: "Leipzig (DE)",
    dealerId: "dealer-demo-1", // ← same dealer as IO-101 (shown as "own" for demo)
  },
  {
    id: "IO-105",
    brand: "Volvo",
    model: "XC60 B4 Mild-Hybrid Plus",
    specs: "145 kW (197 PS) · Automatik · Benzin · Onyx Black Metallic",
    availability: "Sofort verfügbar",
    listPrice: 64100,
    offerPrice: 53203,
    savingsPercent: 17.0,
    leasingRate: null,
    financeRate: 580,
    dealerRating: 100,
    dealerLocation: "Hamburg (DE)",
    dealerId: "dealer-demo-4",
  },
  {
    id: "IO-106",
    brand: "Skoda",
    model: "Octavia Combi RS",
    specs: "180 kW (245 PS) · DSG · Benzin · Race-Blau Metallic",
    availability: "In Zulauf (7 Tage)",
    listPrice: 48900,
    offerPrice: 42543,
    savingsPercent: 13.0,
    leasingRate: 410,
    financeRate: 440,
    dealerRating: 94,
    dealerLocation: "Nürnberg (DE)",
    dealerId: "dealer-demo-2",
  },
];

// Demo: the logged-in dealer "owns" these two offers (replace with real user.id check)
const DEMO_OWN_OFFER_IDS = ["IO-101", "IO-104"];

export default function DashboardInstantOffersPage() {
  const { profile } = useAuth();
  const isDealer = profile?.role === "anbieter";

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 pt-12 pb-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10">

          {/* Dealer top bar */}
          {isDealer && (
            <div className="flex justify-end mb-8">
              <Link href="/dashboard/sofort-angebote/neu">
                <Button className="h-12 px-6 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2">
                  <Plus size={18} /> Neues Sofort-Angebot erstellen
                </Button>
              </Link>
            </div>
          )}

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-5 border border-blue-500/30">
              <Zap size={16} className="text-amber-400" />
              {MOCK_OFFERS.length} sofort verfügbare Flottenfahrzeuge
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Sofort-Angebote Marktplatz
            </h1>
            <p className="text-lg text-blue-100/70 max-w-2xl mx-auto mb-10">
              {isDealer
                ? "Vergleichen Sie Marktpreise und verwalten Sie Ihre eigenen Inserate."
                : "Exklusive Lagerfahrzeuge und Tageszulassungen — direkt kauf- und leasbar."}
            </p>

            {/* Search bar */}
            <div className="bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto relative translate-y-12 border border-slate-200">
              <div className="flex-1 flex items-center w-full bg-slate-50/50 rounded-full px-4 py-2">
                <Search className="text-slate-400 mr-3 shrink-0" size={18} />
                <Input placeholder="Marke, Modell, Ausstattung…" className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base h-10 w-full font-medium" />
              </div>
              <div className="h-7 w-px bg-slate-200 hidden md:block" />
              <div className="flex-1 flex items-center w-full px-4 py-2 border-t md:border-0 border-slate-100">
                <Select>
                  <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 text-base h-10 w-full font-medium focus-visible:ring-0">
                    <SelectValue placeholder="Beliebige Marke" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audi">Audi</SelectItem>
                    <SelectItem value="bmw">BMW</SelectItem>
                    <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                    <SelectItem value="vw">Volkswagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-7 w-px bg-slate-200 hidden md:block" />
              <div className="flex-1 flex items-center w-full bg-slate-50/50 rounded-full px-4 py-2">
                <MapPin className="text-slate-400 mr-3 shrink-0" size={18} />
                <Input placeholder="PLZ + Radius" className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base h-10 w-full font-medium" />
              </div>
              <Button className="w-full md:w-auto h-12 md:h-10 px-6 rounded-xl md:rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold md:ml-1">
                Suchen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Offer grid ─────────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-7xl px-4 md:px-8 py-12 mt-10">

        {/* Results bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-300 border-none px-3 py-1 font-semibold text-sm cursor-pointer flex items-center gap-1.5">
              <SlidersHorizontal size={14} /> Filter
            </Badge>
            <span className="text-sm text-slate-500 font-medium">
              {MOCK_OFFERS.length} Angebote gefunden
            </span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-slate-500 font-semibold text-sm">Sortieren:</span>
            <Select defaultValue="savings">
              <SelectTrigger className="w-[180px] h-10 border-slate-200 bg-white font-bold text-navy-950 focus:ring-0 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Höchste Ersparnis</SelectItem>
                <SelectItem value="price_asc">Preis aufsteigend</SelectItem>
                <SelectItem value="price_desc">Preis absteigend</SelectItem>
                <SelectItem value="newest">Neueste zuerst</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {MOCK_OFFERS.map((offer) => (
            <InstantOfferCard
              key={offer.id}
              offer={offer}
              viewMode={isDealer ? "seller" : "buyer"}
              isOwnOffer={isDealer && DEMO_OWN_OFFER_IDS.includes(offer.id)}
            />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-16 flex justify-center">
          <Button variant="outline" size="lg" className="rounded-xl px-12 h-14 border-slate-300 text-slate-600 bg-white hover:bg-slate-50 font-bold">
            Weitere Angebote laden
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { InstantOfferCard } from "@/components/tenders/InstantOfferCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, SlidersHorizontal, Plus, Zap, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { type InstantOfferRow } from "@/lib/instant-offers";

type Tab = "active" | "archive" | "bookmarks";

export default function DashboardInstantOffersPage() {
  const { user, profile } = useAuth();
  const isDealer = profile?.role === "anbieter";
  const [supabase] = useState(() => createClient());

  // Tab state
  const [tab, setTab] = useState<Tab>(isDealer ? "active" : "bookmarks");

  // Data
  const [offers, setOffers] = useState<InstantOfferRow[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Set default tab when profile loads
  useEffect(() => {
    if (profile) {
      setTab(isDealer ? "active" : "bookmarks");
    }
  }, [profile, isDealer]);

  // Fetch bookmarked IDs for buyer
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("bookmarks")
        .select("instant_offer_id")
        .eq("user_id", user.id);
      if (data) {
        setBookmarkedIds(new Set(data.map((r: { instant_offer_id: string }) => r.instant_offer_id)));
      }
    })();
  }, [user, supabase]);

  // Fetch offers based on tab
  const fetchOffers = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    if (tab === "bookmarks") {
      // Buyer: fetch bookmarked offers
      const { data: bmData } = await supabase
        .from("bookmarks")
        .select("instant_offer_id")
        .eq("user_id", user.id);

      if (!bmData || bmData.length === 0) {
        setOffers([]);
        setLoading(false);
        return;
      }

      const ids = bmData.map((r: { instant_offer_id: string }) => r.instant_offer_id);
      let query = supabase
        .from("instant_offers")
        .select("*")
        .in("id", ids);

      if (searchQuery.trim()) {
        query = query.or(`brand.ilike.%${searchQuery.trim()}%,model_name.ilike.%${searchQuery.trim()}%`);
      }

      query = query.order("published_at", { ascending: false });
      const { data } = await query;
      setOffers((data as InstantOfferRow[]) || []);
    } else {
      // Dealer: fetch own offers
      let query = supabase
        .from("instant_offers")
        .select("*")
        .eq("dealer_id", user.id);

      if (tab === "active") {
        query = query.eq("status", "active");
      } else {
        // Archive: expired, archived, or draft
        query = query.in("status", ["expired", "archived", "draft"]);
      }

      if (searchQuery.trim()) {
        query = query.or(`brand.ilike.%${searchQuery.trim()}%,model_name.ilike.%${searchQuery.trim()}%`);
      }

      switch (sortBy) {
        case "savings":
          query = query.order("discount_percent", { ascending: false, nullsFirst: false });
          break;
        case "price_asc":
          query = query.order("purchase_price_net", { ascending: true, nullsFirst: false });
          break;
        case "price_desc":
          query = query.order("purchase_price_net", { ascending: false, nullsFirst: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data } = await query;
      setOffers((data as InstantOfferRow[]) || []);
    }

    setLoading(false);
  }, [user, supabase, tab, searchQuery, sortBy]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleDelete = (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)]">

      {/* Header */}
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
              {isDealer ? "Meine Sofort-Angebote" : "Gemerkte Sofort-Angebote"}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Sofort-Angebote {isDealer ? "Verwaltung" : "Marktplatz"}
            </h1>
            <p className="text-lg text-blue-100/70 max-w-2xl mx-auto mb-10">
              {isDealer
                ? "Verwalten Sie Ihre Sofort-Angebote und erstellen Sie neue Inserate."
                : "Ihre gemerkten Sofort-Angebote auf einen Blick."}
            </p>

            {/* Search bar */}
            <div className="bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-4xl mx-auto relative translate-y-12 border border-slate-200">
              <div className="flex-1 flex items-center w-full bg-slate-50/50 rounded-full px-4 py-2">
                <Search className="text-slate-400 mr-3 shrink-0" size={18} />
                <Input
                  placeholder="Marke, Modell, Ausstattung..."
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base h-10 w-full font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                className="w-full md:w-auto h-12 md:h-10 px-6 rounded-xl md:rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold md:ml-1"
                onClick={() => fetchOffers()}
              >
                Suchen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Offer grid */}
      <div className="container mx-auto max-w-7xl px-4 md:px-8 py-12 mt-10">

        {/* Tabs + Results bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Tabs */}
            {isDealer ? (
              <>
                <button onClick={() => setTab("active")}>
                  <Badge className={`px-4 py-1.5 font-semibold text-sm cursor-pointer transition-colors ${
                    tab === "active"
                      ? "bg-blue-600 text-white hover:bg-blue-700 border-none"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300 border-none"
                  }`}>
                    Laufende
                  </Badge>
                </button>
                <button onClick={() => setTab("archive")}>
                  <Badge className={`px-4 py-1.5 font-semibold text-sm cursor-pointer transition-colors ${
                    tab === "archive"
                      ? "bg-blue-600 text-white hover:bg-blue-700 border-none"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300 border-none"
                  }`}>
                    Archiv
                  </Badge>
                </button>
              </>
            ) : (
              <Badge className="bg-blue-600 text-white hover:bg-blue-700 border-none px-4 py-1.5 font-semibold text-sm">
                Gemerkte Angebote
              </Badge>
            )}

            <span className="text-sm text-slate-500 font-medium ml-2">
              {offers.length} Angebote
            </span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-slate-500 font-semibold text-sm">Sortieren:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-10 border-slate-200 bg-white font-bold text-navy-950 focus:ring-0 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Neueste zuerst</SelectItem>
                <SelectItem value="savings">Höchste Ersparnis</SelectItem>
                <SelectItem value="price_asc">Preis aufsteigend</SelectItem>
                <SelectItem value="price_desc">Preis absteigend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl font-bold text-slate-400 mb-2">
              {tab === "bookmarks"
                ? "Noch keine gemerkten Angebote"
                : tab === "active"
                  ? "Keine laufenden Angebote"
                  : "Keine archivierten Angebote"}
            </p>
            <p className="text-slate-400 mb-6">
              {tab === "bookmarks"
                ? "Besuchen Sie den Marktplatz und merken Sie sich interessante Angebote."
                : "Erstellen Sie Ihr erstes Sofort-Angebot, um hier zu starten."}
            </p>
            {tab === "bookmarks" ? (
              <Link href="/sofort-angebote">
                <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12">
                  Zum Marktplatz
                </Button>
              </Link>
            ) : isDealer && (
              <Link href="/dashboard/sofort-angebote/neu">
                <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12">
                  <Plus size={18} className="mr-2" /> Neues Angebot erstellen
                </Button>
              </Link>
            )}
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {offers.map((offer) => (
              <InstantOfferCard
                key={offer.id}
                offer={offer}
                viewMode={isDealer ? "seller" : "buyer"}
                isOwnOffer={isDealer && offer.dealer_id === user?.id}
                initialBookmarked={bookmarkedIds.has(offer.id)}
                userId={user?.id}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

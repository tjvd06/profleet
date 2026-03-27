"use client";

import { useState, useEffect, useCallback } from "react";
import { InstantOfferCard } from "@/components/tenders/InstantOfferCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, SlidersHorizontal, Zap, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import { type InstantOfferRow } from "@/lib/instant-offers";

const PAGE_SIZE = 12;

export default function SofortAngebotePage() {
  const { user } = useAuth();
  const [supabase] = useState(() => createClient());

  // Data
  const [offers, setOffers] = useState<InstantOfferRow[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [plzFilter, setPlzFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState("savings");

  // Available brands (from DB)
  const [brands, setBrands] = useState<string[]>([]);

  // Fetch distinct brands for filter dropdown
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("instant_offers")
        .select("brand")
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString());
      if (data) {
        const unique = [...new Set(data.map((r: { brand: string }) => r.brand))].sort();
        setBrands(unique);
      }
    })();
  }, [supabase]);

  // Fetch bookmarks for logged-in user
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

  // Fetch offers
  const fetchOffers = useCallback(async (pageNum: number, append: boolean) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    let query = supabase
      .from("instant_offers")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString());

    // Text search (brand or model)
    if (searchQuery.trim()) {
      query = query.or(`brand.ilike.%${searchQuery.trim()}%,model_name.ilike.%${searchQuery.trim()}%`);
    }

    // Brand filter
    if (brandFilter) {
      query = query.eq("brand", brandFilter);
    }

    // PLZ filter
    if (plzFilter.trim()) {
      query = query.eq("delivery_plz", plzFilter.trim());
    }

    // Max price filter
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (max > 0) query = query.lte("purchase_price_net", max);
    }

    // Sort
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
      case "newest":
        query = query.order("published_at", { ascending: false });
        break;
      default:
        query = query.order("published_at", { ascending: false });
    }

    query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    const { data, count, error } = await query;
    if (!error && data) {
      if (append) {
        setOffers((prev) => [...prev, ...(data as InstantOfferRow[])]);
      } else {
        setOffers(data as InstantOfferRow[]);
      }
      if (count != null) setTotalCount(count);
    }

    setLoading(false);
    setLoadingMore(false);
  }, [supabase, searchQuery, brandFilter, plzFilter, maxPrice, sortBy]);

  // Re-fetch on filter change
  useEffect(() => {
    setPage(0);
    fetchOffers(0, false);
  }, [fetchOffers]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOffers(nextPage, true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchOffers(0, false);
  };

  // Active filters for display
  const activeFilters: { label: string; clear: () => void }[] = [];
  if (brandFilter) activeFilters.push({ label: brandFilter, clear: () => setBrandFilter("") });
  if (maxPrice) activeFilters.push({ label: `Max. ${Number(maxPrice).toLocaleString("de-DE")} €`, clear: () => setMaxPrice("") });
  if (plzFilter) activeFilters.push({ label: `PLZ ${plzFilter}`, clear: () => setPlzFilter("") });

  const remaining = totalCount - offers.length;

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Search Header / Filter Section */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 pt-16 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-blue-500/30">
            <Zap size={16} className="text-amber-400" /> {totalCount} sofort verfügbare Flottenfahrzeuge
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Sofort-Angebote Marktplatz
          </h1>
          <p className="text-lg md:text-xl text-blue-100/70 max-w-2xl mx-auto mb-12">
            Entdecken Sie exklusive Lagerfahrzeuge und Tageszulassungen deutscher Markenvertrags-Händler. Direkt kauf- und leasbar zu Großkundenkonditionen.
          </p>

          {/* Advanced Search Bar */}
          <form onSubmit={handleSearch} className="bg-white p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-5xl mx-auto relative translate-y-12 md:translate-y-20 border border-slate-200">
            <div className="flex-1 flex items-center w-full bg-slate-50/50 rounded-full px-4 py-2">
              <Search className="text-slate-400 mr-3" size={20} />
              <Input
                placeholder="Marke, Modell, Ausstattung..."
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base h-12 w-full font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="h-8 w-px bg-slate-200 hidden md:block" />

            <div className="flex-1 flex items-center w-full px-4 py-2 border-t md:border-0 border-slate-100">
              <Select value={brandFilter} onValueChange={(v) => setBrandFilter(v === "__all__" ? "" : v)}>
                <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 text-base h-12 w-full font-medium focus-visible:ring-0">
                  <SelectValue placeholder="Beliebige Marke" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Alle Marken</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden md:block" />

            <div className="flex-1 flex items-center w-full bg-slate-50/50 rounded-full px-4 py-2">
              <MapPin className="text-slate-400 mr-3 shrink-0" size={20} />
              <Input
                placeholder="PLZ"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base h-12 w-full font-medium"
                value={plzFilter}
                onChange={(e) => setPlzFilter(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full md:w-auto h-14 md:h-12 px-8 rounded-xl md:rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base md:ml-2">
              Angebote finden
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 py-16 mt-16 md:mt-12">
        {/* Results Metadata & Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-300 border-none px-3 py-1 font-semibold text-sm cursor-pointer flex items-center gap-1.5">
              <SlidersHorizontal size={14} /> Filter {activeFilters.length > 0 && `(${activeFilters.length})`}
            </Badge>

            {/* Max price quick filter */}
            {!maxPrice && (
              <button onClick={() => setMaxPrice("60000")}>
                <Badge variant="outline" className="border-slate-200 text-slate-500 px-3 py-1 font-semibold cursor-pointer hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                  Max. 60.000 €
                </Badge>
              </button>
            )}

            {activeFilters.map((f) => (
              <Badge key={f.label} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 px-3 py-1 font-semibold flex items-center gap-2">
                {f.label}
                <button onClick={f.clear} className="hover:text-blue-900 border-l border-blue-200 pl-1.5 ml-0.5">
                  <X size={12} />
                </button>
              </Badge>
            ))}

            {activeFilters.length > 0 && (
              <button
                className="text-sm font-semibold text-slate-400 hover:text-navy-900 ml-2"
                onClick={() => { setBrandFilter(""); setMaxPrice(""); setPlzFilter(""); }}
              >
                Alle löschen
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <span className="text-slate-500 font-semibold text-sm">{totalCount} Ergebnisse · Sortieren nach:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] h-10 border-slate-200 bg-white font-bold text-navy-950 focus:ring-0 rounded-xl">
                <SelectValue placeholder="Sortierung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Höchste Ersparnis</SelectItem>
                <SelectItem value="price_asc">Preis aufsteigend</SelectItem>
                <SelectItem value="price_desc">Preis absteigend</SelectItem>
                <SelectItem value="newest">Neueste Inserate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl font-bold text-slate-400 mb-2">Keine Angebote gefunden</p>
            <p className="text-slate-400">Versuchen Sie andere Suchkriterien oder entfernen Sie Filter.</p>
          </div>
        ) : (
          <>
            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {offers.map((offer) => (
                <InstantOfferCard
                  key={offer.id}
                  offer={offer}
                  viewMode="public"
                  initialBookmarked={bookmarkedIds.has(offer.id)}
                  userId={user?.id}
                />
              ))}
            </div>

            {/* Load More */}
            {remaining > 0 && (
              <div className="mt-16 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-12 h-14 border-slate-300 text-slate-600 bg-white hover:bg-slate-50 hover:text-navy-950 font-bold transition-colors"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <><Loader2 className="animate-spin mr-2" size={18} /> Laden...</>
                  ) : (
                    `Weitere Angebote laden (${remaining} übrig)`
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

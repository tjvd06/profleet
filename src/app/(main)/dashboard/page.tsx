"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { Card } from "@/components/ui/card";
import {
  Sparkles, Inbox, Star, Handshake,
  CarFront, FileText, Activity, Bell,
  MessageCircle, TrendingUp, ArrowRight, Loader2, InboxIcon,
  Crown, Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { DealerTenderCard } from "@/components/tenders/DealerTenderCard";
import { InstantOfferCard } from "@/components/tenders/InstantOfferCard";
import { type InstantOfferRow } from "@/lib/instant-offers";

// ─── Activity item type ──────────────────────────────────────────────────────
type ActivityItem = {
  id: string;
  type: "offer" | "message" | "review" | "tender" | "instant_offer";
  title: string;
  subtitle: string;
  time: string;
  href: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} Tag${days > 1 ? "en" : ""}`;
  return new Date(dateStr).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

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

// ─── Map raw tender to DealerTenderCard props ────────────────────────────────
function mapTenderToCardProps(
  tender: any,
  answeredIds: Set<string>,
  offerStats: Record<string, { count: number; bestPriceNet: number | null; bestTotalNet: number | null }>,
  myOffers: Record<string, { purchasePriceNet: number; totalPrice: number }>,
  buyerRatings: Record<string, { score: number; total: number }>,
) {
  const vehicles = (tender.tender_vehicles || []).map((v: any) => ({
    quantity: v.quantity,
    brand: v.brand || "—",
    model: [v.model_name, v.trim_level].filter(Boolean).join(" ") || "—",
    specs: [v.fuel_type, v.body_type, v.color].filter(Boolean).join(" · ") || "",
    price: v.list_price_gross || 0,
  }));

  const totalVehicles = (tender.tender_vehicles || []).reduce((sum: number, v: any) => sum + v.quantity, 0);
  const totalPrice = (tender.tender_vehicles || []).reduce((sum: number, v: any) => sum + ((v.list_price_gross || 0) * v.quantity), 0);

  const hasFleetDiscount = (tender.tender_vehicles || []).some((v: any) => v.fleet_discount && v.fleet_discount > 0);
  const fleetDiscountPercent = (tender.tender_vehicles || []).find((v: any) => v.fleet_discount)?.fleet_discount || 0;

  const requestedTypes: string[] = ["Kauf"];
  const seen = new Set<string>();
  (tender.tender_vehicles || []).forEach((v: any) => {
    if (v.leasing?.requested && !seen.has("Leasing")) { requestedTypes.push("Leasing"); seen.add("Leasing"); }
    if (v.financing?.requested && !seen.has("Finanzierung")) { requestedTypes.push("Finanzierung"); seen.add("Finanzierung"); }
  });

  const buyer = tender.buyer;
  const buyerCompany = buyer?.company_name || "Unternehmen";

  return {
    id: tender.id,
    timeLeft: timeLeft(tender.end_at),
    buyerType: buyerCompany,
    buyerName: null,
    buyerProfession: buyer?.industry || null,
    buyerCity: buyer?.city || null,
    buyerPlz: buyer?.zip || null,
    buyerStreet: null,
    buyerEmail: null,
    buyerPhone: null,
    buyerMemberSince: buyer?.created_at || null,
    location: tender.delivery_plz
      ? `${tender.delivery_city || "Unbekannt"} (${tender.delivery_plz})`
      : "Deutschland",
    buyerRating: buyerRatings[tender.buyer_id]?.score ?? 0,
    buyerRatingTotal: buyerRatings[tender.buyer_id]?.total ?? 0,
    successRate: 0,
    isPreferredDealer: false,
    requestedTypes,
    fleetDiscount: hasFleetDiscount,
    fleetDiscountPercent,
    currentOffers: offerStats[tender.id]?.count ?? 0,
    bestPriceNet: offerStats[tender.id]?.bestPriceNet ?? null,
    bestTotalNet: offerStats[tender.id]?.bestTotalNet ?? null,
    myPriceNet: myOffers[tender.id]?.purchasePriceNet ?? null,
    myTotalPrice: myOffers[tender.id]?.totalPrice ?? null,
    vehicles,
    totalVehicles,
    totalPrice,
    hasAnswered: answeredIds.has(tender.id),
    rawVehicles: tender.tender_vehicles || [],
  };
}

export default function DashboardOverviewPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const {
    tier, subscriptionSince, monthlyOfferCount, activeInstantOfferCount,
    getOfferLimit, getInstantOfferLimit, isLoading: subLoading,
  } = useSubscription();

  const isDealer = profile?.role === "anbieter";
  const userName = profile?.company_name || (isDealer ? "Händler" : "User");

  // ─── Supabase client ──────────────────────────────────────────────────────
  const [supabase] = useState(() => createClient());

  // ─── Buyer state ──────────────────────────────────────────────────────────
  const [buyerStats, setBuyerStats] = useState({ activeTenders: 0, newOffers: 0, openRatings: 0 });
  // Buyer bottom section: offers for their tenders
  const [buyerTenderOffers, setBuyerTenderOffers] = useState<any[]>([]);

  // ─── Dealer state ─────────────────────────────────────────────────────────
  const [dealerStats, setDealerStats] = useState({ newRequests: 0, openOffers: 0, contactRequests: 0, dealerRating: 0 });
  // Dealer bottom section: recent tenders
  const [dealerTenders, setDealerTenders] = useState<any[]>([]);
  const [answeredTenderIds, setAnsweredTenderIds] = useState<Set<string>>(new Set());
  const [offerStats, setOfferStats] = useState<Record<string, { count: number; bestPriceNet: number | null; bestTotalNet: number | null }>>({});
  const [myOffers, setMyOffers] = useState<Record<string, { purchasePriceNet: number; totalPrice: number }>>({});
  const [buyerRatings, setBuyerRatings] = useState<Record<string, { score: number; total: number }>>({});

  // ─── Shared state ─────────────────────────────────────────────────────────
  const [recentInstantOffers, setRecentInstantOffers] = useState<InstantOfferRow[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const timeout = <T,>(p: Promise<T>) =>
    Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), 10000))]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setStatsLoading(false); return; }

    let cancelled = false;

    (async () => {
      try {
        const lastLogin = profile?.last_login || null;

        if (!isDealer) {
          // ── BUYER STATS ─────────────────────────────────────────────────
          const [tendersRes, contactsRes, reviewsRes, messagesRes, instantOffersRes] = await Promise.all([
            timeout(
              supabase
                .from("tenders")
                .select("id, status, created_at, tender_vehicles(brand, model_name, trim_level, list_price_gross, quantity), offers(id, dealer_id, total_price, created_at)")
                .eq("buyer_id", user.id) as any
            ),
            timeout(supabase.from("contacts").select("id, tender_id, dealer_id, created_at, tenders!inner(status)").eq("buyer_id", user.id).in("tenders.status", ["completed", "cancelled"]) as any),
            timeout(supabase.from("reviews").select("id, contact_id, from_user_id, to_user_id, type, created_at").or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`) as any),
            timeout(supabase.from("messages").select("id, contact_id, sender_id, content, created_at").neq("sender_id", user.id).order("created_at", { ascending: false }).limit(20) as any),
            timeout(supabase.from("instant_offers").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(6) as any),
          ]);

          if (cancelled) return;

          const tenders = (tendersRes as any)?.data || [];
          const activeTenders = tenders.filter((t: any) => t.status === "active").length;

          // Count new offers since last login
          let newOffers = 0;
          const allOffers: any[] = [];
          tenders.forEach((t: any) => {
            ((t.offers as any[]) || []).forEach((o: any) => {
              allOffers.push({ ...o, tenderId: t.id, tenderVehicles: t.tender_vehicles });
              if (lastLogin && new Date(o.created_at) > new Date(lastLogin)) {
                newOffers++;
              } else if (!lastLogin) {
                newOffers++;
              }
            });
          });

          // Open ratings: completed contacts without review from this user
          const completedContacts = ((contactsRes as any)?.data || []).map((c: any) => c.id);
          const givenReviews = ((reviewsRes as any)?.data || []).filter((r: any) => r.from_user_id === user.id);
          const reviewedContactIds = new Set(givenReviews.map((r: any) => r.contact_id));
          const openRatings = completedContacts.filter((id: string) => !reviewedContactIds.has(id)).length;

          setBuyerStats({ activeTenders, newOffers, openRatings });

          // ── BUYER ACTIVITY FEED ───────────────────────────────────────
          const activityItems: ActivityItem[] = [];

          // Recent offers received
          allOffers
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
            .forEach((o: any) => {
              const vehicle = o.tenderVehicles?.[0];
              const vehicleName = vehicle ? [vehicle.brand, vehicle.model_name].filter(Boolean).join(" ") : "Fahrzeug";
              activityItems.push({
                id: `offer-${o.id}`,
                type: "offer",
                title: "Neues Angebot erhalten",
                subtitle: `Für ${vehicleName}`,
                time: o.created_at,
                href: `/dashboard/ausschreibungen`,
              });
            });

          // Recent messages
          ((messagesRes as any)?.data || []).slice(0, 5).forEach((m: any) => {
            activityItems.push({
              id: `msg-${m.id}`,
              type: "message",
              title: "Neue Nachricht",
              subtitle: m.content?.substring(0, 50) + (m.content?.length > 50 ? "…" : ""),
              time: m.created_at,
              href: `/dashboard/nachrichten`,
            });
          });

          // Recent reviews received
          ((reviewsRes as any)?.data || [])
            .filter((r: any) => r.to_user_id === user.id)
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
            .forEach((r: any) => {
              activityItems.push({
                id: `review-${r.id}`,
                type: "review",
                title: "Neue Bewertung erhalten",
                subtitle: r.type === "positive" ? "Positive Bewertung" : r.type === "neutral" ? "Neutrale Bewertung" : "Negative Bewertung",
                time: r.created_at,
                href: `/dashboard/bewertungen`,
              });
            });

          activityItems.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          setActivities(activityItems.slice(0, 5));

          // ── BUYER BOTTOM: Recent offers for their tenders ─────────────
          // Show tenders with their latest offers
          const tendersWithOffers = tenders
            .filter((t: any) => t.status === "active" && (t.offers as any[])?.length > 0)
            .sort((a: any, b: any) => {
              const latestA = Math.max(...((a.offers as any[]) || []).map((o: any) => new Date(o.created_at).getTime()));
              const latestB = Math.max(...((b.offers as any[]) || []).map((o: any) => new Date(o.created_at).getTime()));
              return latestB - latestA;
            })
            .slice(0, 5);
          setBuyerTenderOffers(tendersWithOffers);

          // Instant offers for buyer
          setRecentInstantOffers(((instantOffersRes as any)?.data || []) as InstantOfferRow[]);

        } else {
          // ── DEALER STATS ────────────────────────────────────────────────
          const [tendersRes, offersRes, contactsRes, reviewsRes, messagesRes, instantOffersRes] = await Promise.all([
            timeout(supabase.from("tenders").select("*, tender_vehicles(*), buyer_id").eq("status", "active").order("created_at", { ascending: false }).limit(10) as any),
            timeout(supabase.from("offers").select("id, tender_id, purchase_price, total_price, offered_quantity, created_at").eq("dealer_id", user.id) as any),
            timeout(supabase.from("contacts").select("id, buyer_id, tender_id, instant_offer_id, created_at").eq("dealer_id", user.id) as any),
            timeout(supabase.from("reviews").select("id, contact_id, from_user_id, to_user_id, type, created_at").or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`) as any),
            timeout(supabase.from("messages").select("id, contact_id, sender_id, content, created_at").neq("sender_id", user.id).order("created_at", { ascending: false }).limit(20) as any),
            timeout(supabase.from("instant_offers").select("*").eq("dealer_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(6) as any),
          ]);

          if (cancelled) return;

          const tenders = (tendersRes as any)?.data || [];
          const offers = (offersRes as any)?.data || [];
          const contacts = (contactsRes as any)?.data || [];
          const allReviews = (reviewsRes as any)?.data || [];

          // Count new requests (active tenders not yet answered)
          const answeredSet = new Set<string>(offers.map((o: any) => o.tender_id));
          const newRequests = tenders.filter((t: any) => !answeredSet.has(t.id)).length;

          // Open offers count
          const openOffers = offers.length;

          // Contact requests
          const contactRequests = contacts.length;

          // Dealer rating
          const receivedReviews = allReviews.filter((r: any) => r.to_user_id === user.id);
          const positiveCount = receivedReviews.filter((r: any) => r.type === "positive").length;
          const dealerRating = receivedReviews.length > 0 ? Math.round((positiveCount / receivedReviews.length) * 100) : 0;

          setDealerStats({ newRequests, openOffers, contactRequests, dealerRating });

          // ── DEALER ACTIVITY FEED ──────────────────────────────────────
          const activityItems: ActivityItem[] = [];

          // New tenders (for dealers these are "new requests")
          tenders.slice(0, 5).forEach((t: any) => {
            const vehicle = t.tender_vehicles?.[0];
            const vehicleName = vehicle ? [vehicle.brand, vehicle.model_name].filter(Boolean).join(" ") : "Fahrzeug";
            activityItems.push({
              id: `tender-${t.id}`,
              type: "tender",
              title: "Neue Ausschreibung",
              subtitle: vehicleName,
              time: t.created_at,
              href: `/dashboard/eingang`,
            });
          });

          // Recent messages
          ((messagesRes as any)?.data || []).slice(0, 5).forEach((m: any) => {
            activityItems.push({
              id: `msg-${m.id}`,
              type: "message",
              title: "Neue Nachricht",
              subtitle: m.content?.substring(0, 50) + (m.content?.length > 50 ? "…" : ""),
              time: m.created_at,
              href: `/dashboard/nachrichten`,
            });
          });

          // Contact requests
          contacts
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
            .forEach((c: any) => {
              activityItems.push({
                id: `contact-${c.id}`,
                type: "offer",
                title: "Neuer Kontaktwunsch",
                subtitle: c.instant_offer_id ? "Sofort-Angebot Anfrage" : "Ausschreibungs-Anfrage",
                time: c.created_at,
                href: `/dashboard/nachrichten`,
              });
            });

          // Reviews received
          receivedReviews
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
            .forEach((r: any) => {
              activityItems.push({
                id: `review-${r.id}`,
                type: "review",
                title: "Neue Bewertung erhalten",
                subtitle: r.type === "positive" ? "Positive Bewertung" : r.type === "neutral" ? "Neutrale Bewertung" : "Negative Bewertung",
                time: r.created_at,
                href: `/dashboard/bewertungen`,
              });
            });

          activityItems.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          setActivities(activityItems.slice(0, 5));

          // ── DEALER BOTTOM: Tenders + buyer ratings ────────────────────
          setDealerTenders(tenders);
          setAnsweredTenderIds(answeredSet);

          const myOfferMap: Record<string, { purchasePriceNet: number; totalPrice: number }> = {};
          offers.forEach((o: any) => {
            if (!myOfferMap[o.tender_id]) myOfferMap[o.tender_id] = { purchasePriceNet: 0, totalPrice: 0 };
            myOfferMap[o.tender_id].purchasePriceNet += o.purchase_price || 0;
            myOfferMap[o.tender_id].totalPrice += (o.total_price || 0) * (o.offered_quantity || 1);
          });
          setMyOffers(myOfferMap);

          // Load buyer profiles for tender cards
          const buyerIds = Array.from(new Set(tenders.map((t: any) => t.buyer_id).filter(Boolean)));
          if (buyerIds.length > 0) {
            const [profilesRes, reviewsForBuyers] = await Promise.all([
              supabase.from("profiles").select("id, company_name, industry, zip, city, created_at").in("id", buyerIds),
              supabase.from("reviews").select("to_user_id, type").in("to_user_id", buyerIds),
            ]);
            const buyerMap: Record<string, any> = {};
            (profilesRes.data || []).forEach((p: any) => { buyerMap[p.id] = p; });
            // Attach buyer to tenders
            setDealerTenders(prev => prev.map(t => ({ ...t, buyer: buyerMap[t.buyer_id] || null })));

            const ratingMap: Record<string, { score: number; total: number }> = {};
            const grouped: Record<string, { positive: number; total: number }> = {};
            (reviewsForBuyers.data || []).forEach((r: any) => {
              if (!grouped[r.to_user_id]) grouped[r.to_user_id] = { positive: 0, total: 0 };
              grouped[r.to_user_id].total++;
              if (r.type === "positive") grouped[r.to_user_id].positive++;
            });
            Object.entries(grouped).forEach(([uid, { positive, total }]) => {
              ratingMap[uid] = { score: total > 0 ? Math.round((positive / total) * 100) : 0, total };
            });
            setBuyerRatings(ratingMap);
          }

          // Offer stats via RPC
          const tenderIds = tenders.map((t: any) => t.id);
          if (tenderIds.length > 0) {
            const { data: statsData } = await supabase.rpc("get_tender_offer_stats", { tender_ids: tenderIds });
            const stats: Record<string, { count: number; bestPriceNet: number | null; bestTotalNet: number | null }> = {};
            if (statsData) {
              (statsData as any[]).forEach((s) => {
                stats[s.tender_id] = { count: s.offer_count, bestPriceNet: s.best_price_net, bestTotalNet: s.best_total_net };
              });
            }
            setOfferStats(stats);
          }

          // Dealer's own instant offers for bottom section
          setRecentInstantOffers(((instantOffersRes as any)?.data || []) as InstantOfferRow[]);
        }
      } catch (e) {
        if (!cancelled) console.error("[Dashboard] Stats load error:", e);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, user?.id, isDealer]);

  // ─── Activity icon mapping ────────────────────────────────────────────────
  const activityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "offer": return <Inbox size={16} className="text-emerald-600" />;
      case "message": return <MessageCircle size={16} className="text-blue-600" />;
      case "review": return <Star size={16} className="text-amber-500" />;
      case "tender": return <FileText size={16} className="text-blue-600" />;
      case "instant_offer": return <Zap size={16} className="text-purple-600" />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-32">

      {/* Combined Header Segment */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white pt-6 pb-12 shadow-sm overflow-hidden z-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10 flex flex-col gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
              Willkommen zurück, {userName}!
            </h1>
            <p className="text-lg text-blue-100/80 font-medium max-w-2xl">
              {isDealer
                ? "Hier ist Ihr aktueller Überblick über den Marktplatz und eingehende Anfragen."
                : "Ihre Flottenbeschaffung auf einen Blick. So läuft es aktuell:"}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-10 space-y-12">

        {/* =========================================
            BUYER VIEW
           ========================================= */}
        {!isDealer && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">

            {/* 3 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <Link href="/dashboard/ausschreibungen">
                <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText size={24} />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aktive Ausschreibungen</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-navy-950">
                      {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : buyerStats.activeTenders}
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Card>
              </Link>

              <Link href="/dashboard/ausschreibungen">
                <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Inbox size={24} />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Neue Angebote</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-navy-950">
                      {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : buyerStats.newOffers}
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  {!statsLoading && buyerStats.newOffers > 0 && (
                    <p className="text-xs text-emerald-600 font-semibold mt-2">Seit Ihrem letzten Login</p>
                  )}
                </Card>
              </Link>

              <Link href="/dashboard/bewertungen">
                <Card className={`p-6 rounded-3xl shadow-sm bg-white transition-all group cursor-pointer ${buyerStats.openRatings > 0 ? "border-amber-300 border-2 hover:shadow-md" : "border-slate-200 hover:border-amber-300 hover:shadow-md"}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors ${buyerStats.openRatings > 0 ? "bg-amber-100 text-amber-600" : "bg-amber-50 text-amber-500"}`}>
                      <Star size={24} />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Offene Bewertungen</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`text-4xl font-black ${buyerStats.openRatings > 0 ? "text-amber-600" : "text-navy-950"}`}>
                      {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : buyerStats.openRatings}
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                  </div>
                  {buyerStats.openRatings > 0 && (
                    <p className="text-xs text-amber-600 font-semibold mt-2">Bitte bewerten Sie Ihre Kontakte</p>
                  )}
                </Card>
              </Link>
            </div>

            {/* Quick Actions & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Actions (Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-2xl font-bold text-navy-950">Schnellzugriff</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  <Link href="/dashboard/ausschreibungen/neu" className="block h-full">
                    <Card className="h-full p-8 rounded-3xl border-transparent bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-transform group relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <CarFront size={100} />
                      </div>
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                        <Sparkles size={28} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Neue Ausschreibung erstellen</h3>
                        <p className="text-blue-100 font-medium mb-6">Starten Sie einen neuen Beschaffungsprozess für Ihr nächstes Fahrzeug.</p>
                        <div className="flex items-center text-sm font-bold tracking-widest uppercase">
                          Jetzt starten <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </Link>

                  <Link href="/sofort-angebote" className="block h-full">
                    <Card className="h-full p-8 rounded-3xl border-2 border-slate-200 bg-white hover:border-blue-600 hover:shadow-lg transition-all group flex flex-col justify-between">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-50 transition-colors">
                        <Activity size={28} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-navy-950 mb-2">Sofort-Angebote durchsuchen</h3>
                        <p className="text-slate-500 font-medium mb-6">Entdecken Sie sofort verfügbare Lagerwagen deutscher Vertragshändler.</p>
                        <div className="flex items-center text-blue-600 text-sm font-bold tracking-widest uppercase">
                          Zum Marktplatz <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </Link>

                </div>
              </div>

              {/* Activity Feed (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-navy-950">Letzte Aktivitäten</h2>
                  {activities.length > 0 && (
                    <Link href="/dashboard/profil#aktivitaeten" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      Alle ansehen <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm bg-white">
                  {statsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={24} className="animate-spin text-slate-300" />
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                        <InboxIcon size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-navy-950 mb-2">Noch keine Aktivitäten</h4>
                      <p className="text-sm text-slate-500 max-w-xs">Sobald Sie Ausschreibungen erstellen oder Angebote erhalten, erscheinen Ihre Aktivitäten hier.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {activities.map((a) => (
                        <Link key={a.id} href={a.href} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-slate-200 transition-colors">
                            {activityIcon(a.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-navy-950 truncate">{a.title}</p>
                            <p className="text-xs text-slate-500 truncate">{a.subtitle}</p>
                          </div>
                          <span className="text-xs text-slate-400 shrink-0 mt-1">{timeAgo(a.time)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* ── Bottom Section: Recent offers for tenders & Instant Offers ── */}
            {!statsLoading && (buyerTenderOffers.length > 0 || recentInstantOffers.length > 0) && (
              <div className="space-y-12">
                {/* Offers for buyer's tenders */}
                {buyerTenderOffers.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-navy-950">Neue Angebote für Ihre Ausschreibungen</h2>
                      <Link href="/dashboard/ausschreibungen" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Alle ansehen <ArrowRight size={14} />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {buyerTenderOffers.map((t: any) => {
                        const vehicle = t.tender_vehicles?.[0];
                        const vehicleName = vehicle ? [vehicle.brand, vehicle.model_name].filter(Boolean).join(" ") : "Fahrzeug";
                        const offerCount = (t.offers as any[])?.length || 0;
                        return (
                          <Link key={t.id} href="/dashboard/ausschreibungen">
                            <Card className="p-5 rounded-2xl border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                  <FileText size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-navy-950 truncate">{vehicleName}</p>
                                  <p className="text-xs text-slate-500">
                                    {vehicle?.quantity || 1}x · Ausschreibung {t.id.split("-")[0].toUpperCase()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-emerald-600">{offerCount} Angebot{offerCount !== 1 ? "e" : ""}</span>
                                <ArrowRight size={16} className="text-slate-300" />
                              </div>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Instant offers marketplace preview */}
                {recentInstantOffers.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-navy-950">Neue Sofort-Angebote</h2>
                      <Link href="/sofort-angebote" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Alle ansehen <ArrowRight size={14} />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {recentInstantOffers.map((offer) => (
                        <InstantOfferCard
                          key={offer.id}
                          offer={offer}
                          viewMode="buyer"
                          userId={user?.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================
            DEALER VIEW
           ========================================= */}
        {isDealer && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">

            {/* Subscription Card + Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Current Abo */}
              <Card className="p-6 rounded-3xl border-2 border-emerald-200 shadow-sm bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Crown size={80} />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tier === "premium" ? "bg-amber-100 text-amber-600" :
                    tier === "pro" ? "bg-blue-100 text-blue-600" :
                    "bg-slate-100 text-slate-500"
                  }`}>
                    {tier === "premium" ? <Crown size={20} /> : tier === "pro" ? <Zap size={20} /> : <Star size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-navy-950 capitalize">{tier}-Abo</span>
                      {tier === "pro" && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500">Pro</span>}
                      {tier === "premium" && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">Premium</span>}
                    </div>
                    {subscriptionSince && (
                      <p className="text-xs text-slate-400">seit {new Date(subscriptionSince).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    )}
                  </div>
                </div>
                <Link href="/dashboard/abo" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 gap-1 mt-2">
                  Abo verwalten <ArrowRight size={14} />
                </Link>
              </Card>

              {/* Offers this month */}
              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Angebote diesen Monat</div>
                {(() => {
                  const limit = getOfferLimit();
                  return (
                    <>
                      <div className="text-3xl font-black text-navy-950 mb-2">
                        {subLoading ? <Loader2 size={20} className="animate-spin text-slate-300" /> : (
                          limit !== null ? `${monthlyOfferCount}/${limit}` : <>{monthlyOfferCount} <span className="text-sm font-bold text-slate-400">Unbegrenzt</span></>
                        )}
                      </div>
                      {limit !== null && !subLoading && (
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${monthlyOfferCount >= limit ? "bg-red-500" : "bg-blue-500"}`}
                            style={{ width: `${Math.min((monthlyOfferCount / limit) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </>
                  );
                })()}
              </Card>

              {/* Active instant offers */}
              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sofort-Angebote aktiv</div>
                {(() => {
                  const limit = getInstantOfferLimit();
                  return (
                    <>
                      <div className="text-3xl font-black text-navy-950 mb-2">
                        {subLoading ? <Loader2 size={20} className="animate-spin text-slate-300" /> : (
                          limit !== null ? `${activeInstantOfferCount}/${limit}` : <>{activeInstantOfferCount} <span className="text-sm font-bold text-slate-400">Unbegrenzt</span></>
                        )}
                      </div>
                      {limit !== null && !subLoading && (
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${activeInstantOfferCount >= limit ? "bg-red-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min((activeInstantOfferCount / limit) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </>
                  );
                })()}
              </Card>
            </div>

            {/* 4 KPI Cards - all clickable */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Link href="/dashboard/eingang">
                <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Bell size={24} />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Neue Anfragen</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-navy-950">
                      {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : dealerStats.newRequests}
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  {!statsLoading && dealerStats.newRequests > 0 && (
                    <p className="text-xs text-blue-600 font-semibold mt-2">Unbeantwortete Ausschreibungen</p>
                  )}
                </Card>
              </Link>

              <Link href="/dashboard/angebote">
                <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-slate-400 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-600 group-hover:text-white transition-colors">
                      <TrendingUp size={24} />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Abgegebene Angebote</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-navy-950">
                      {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : dealerStats.openOffers}
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </Card>
              </Link>

              <Link href="/dashboard/nachrichten">
                <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Handshake size={24} />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Kontaktwünsche</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-navy-950">
                      {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : dealerStats.contactRequests}
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </Card>
              </Link>

              <Link href="/dashboard/bewertungen">
                <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-amber-300 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                      <Star size={24} />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Bewertung</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-navy-950">
                      {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : `${dealerStats.dealerRating}%`}
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                  </div>
                </Card>
              </Link>
            </div>

            {/* Quick Actions & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Actions (Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-2xl font-bold text-navy-950">Aktions-Hub</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  <Link href="/dashboard/eingang" className="block h-full">
                    <Card className="h-full p-8 rounded-3xl border-transparent bg-navy-950 text-white shadow-xl hover:scale-[1.02] transition-transform group relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <Inbox size={100} />
                      </div>
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                        <MessageCircle size={28} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Ausschreibungen ansehen</h3>
                        <p className="text-slate-400 font-medium mb-6">Prüfen und beantworten Sie frische Ausschreibungen aus Ihrer Region.</p>
                        <div className="flex items-center text-sm font-bold tracking-widest uppercase text-blue-400">
                          Zum Posteingang <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </Link>

                  <Link href="/dashboard/sofort-angebote/neu" className="block h-full">
                    <Card className="h-full p-8 rounded-3xl border-2 border-slate-200 bg-white hover:border-navy-950 hover:shadow-lg transition-all group flex flex-col justify-between">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-slate-200 transition-colors">
                        <CarFront size={28} className="text-slate-600 group-hover:text-navy-950 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-navy-950 mb-2">Sofort-Angebot erstellen</h3>
                        <p className="text-slate-500 font-medium mb-6">Vermarkten Sie Tageszulassungen und Lagerwagen im Marketplace.</p>
                        <div className="flex items-center text-navy-950 text-sm font-bold tracking-widest uppercase">
                          Neues Inserat <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </Link>

                </div>
              </div>

              {/* Activity Feed (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-navy-950">Letzte Aktivitäten</h2>
                  {activities.length > 0 && (
                    <Link href="/dashboard/profil#aktivitaeten" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      Alle ansehen <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm bg-white">
                  {statsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={24} className="animate-spin text-slate-300" />
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                        <InboxIcon size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-navy-950 mb-2">Noch keine Aktivitäten</h4>
                      <p className="text-sm text-slate-500 max-w-xs">Sobald es Neuigkeiten zu Ihren Angeboten oder Ausschreibungen gibt, erscheinen sie hier.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {activities.map((a) => (
                        <Link key={a.id} href={a.href} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-slate-200 transition-colors">
                            {activityIcon(a.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-navy-950 truncate">{a.title}</p>
                            <p className="text-xs text-slate-500 truncate">{a.subtitle}</p>
                          </div>
                          <span className="text-xs text-slate-400 shrink-0 mt-1">{timeAgo(a.time)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* ── Bottom Section: New Tenders & Instant Offers for Dealer ── */}
            {!statsLoading && (dealerTenders.length > 0 || recentInstantOffers.length > 0) && (
              <div className="space-y-12">
                {/* Active tenders for dealer */}
                {dealerTenders.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-navy-950">Aktuelle Ausschreibungen</h2>
                      <Link href="/dashboard/eingang" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Alle ansehen <ArrowRight size={14} />
                      </Link>
                    </div>
                    <div className="flex flex-col gap-6">
                      {dealerTenders.slice(0, 5).map((tender: any) => (
                        <DealerTenderCard
                          key={tender.id}
                          tender={mapTenderToCardProps(tender, answeredTenderIds, offerStats, myOffers, buyerRatings)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Dealer's own instant offers */}
                {recentInstantOffers.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-navy-950">Ihre Sofort-Angebote</h2>
                      <Link href="/dashboard/sofort-angebote" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Alle ansehen <ArrowRight size={14} />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {recentInstantOffers.map((offer) => (
                        <InstantOfferCard
                          key={offer.id}
                          offer={offer}
                          viewMode="seller"
                          isOwnOffer={true}
                          userId={user?.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

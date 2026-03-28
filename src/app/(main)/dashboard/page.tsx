"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Inbox, PiggyBank, Star, Handshake,
  CarFront, FileText, ChevronRight, Activity, Bell, AlertTriangle,
  MessageCircle, TrendingUp, Trophy, ArrowRight, Loader2, InboxIcon,
  Crown, Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function DashboardOverviewPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const {
    tier, subscriptionSince, monthlyOfferCount, activeInstantOfferCount,
    getOfferLimit, getInstantOfferLimit, isLoading: subLoading,
  } = useSubscription();

  const isDealer = profile?.role === "anbieter";
  const userName = profile?.company_name || (isDealer ? "Händler" : "User");

  // ─── Real Supabase Stats ──────────────────────────────────────────────
  const [supabase] = useState(() => createClient());
  const [buyerStats, setBuyerStats] = useState({ activeTenders: 0, totalOffers: 0, avgSavings: 0, openRatings: 0 });
  const [dealerStats, setDealerStats] = useState({ newRequests: 0, openOffers: 0, contactRequests: 0, dealerRating: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setStatsLoading(false); return; }

    let cancelled = false;

    const timeout = <T,>(p: Promise<T>) =>
      Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), 10000))]);

    (async () => {
      try {
        if (!isDealer) {
          const [tendersRes, contactsRes, reviewsRes] = await Promise.all([
            timeout(
              supabase
                .from("tenders")
                .select("id, status, tender_vehicles(list_price_gross), offers(total_price)")
                .eq("buyer_id", user.id) as any
            ),
            timeout(supabase.from("contacts").select("id, tender_id, tenders!inner(status)").eq("buyer_id", user.id).in("tenders.status", ["completed", "cancelled"]) as any),
            timeout(supabase.from("reviews").select("contact_id").eq("from_user_id", user.id) as any),
          ]);

          if (cancelled) return;
          const tenders = (tendersRes as any)?.data;
          const activeTenders = tenders?.filter((t: any) => t.status === "active").length ?? 0;
          const totalOffers = tenders?.reduce((acc: number, t: any) => acc + ((t.offers as any[])?.length ?? 0), 0) ?? 0;

          let savingsSum = 0, savingsCount = 0;
          tenders?.forEach((t: any) => {
            const listPrice = (t.tender_vehicles as any[])?.[0]?.list_price_gross;
            const offers = (t.offers as any[]) ?? [];
            if (listPrice && offers.length > 0) {
              const bestPrice = Math.min(...offers.filter((o: any) => o.total_price).map((o: any) => o.total_price));
              if (bestPrice < listPrice) { savingsSum += (1 - bestPrice / listPrice) * 100; savingsCount++; }
            }
          });

          // Calculate open ratings
          const completedContacts = ((contactsRes as any)?.data || []).map((c: any) => c.id);
          const reviewedContactIds = new Set(((reviewsRes as any)?.data || []).map((r: any) => r.contact_id));
          const openRatings = completedContacts.filter((id: string) => !reviewedContactIds.has(id)).length;

          setBuyerStats({ activeTenders, totalOffers, avgSavings: savingsCount > 0 ? Math.round(savingsSum / savingsCount * 10) / 10 : 0, openRatings });
        } else {
          const [offersRes, requestsRes, contactsRes, reviewsRes] = await Promise.all([
            timeout(supabase.from("offers").select("*", { count: "exact", head: true }).eq("dealer_id", user.id) as any),
            timeout(supabase.from("tenders").select("*", { count: "exact", head: true }).eq("status", "active") as any),
            timeout(supabase.from("contacts").select("*", { count: "exact", head: true }).eq("dealer_id", user.id) as any),
            timeout(supabase.from("reviews").select("id, type").eq("to_user_id", user.id) as any),
          ]) as any[];

          if (cancelled) return;
          const dealerReviews = reviewsRes?.data || [];
          const positiveCount = dealerReviews.filter((r: any) => r.type === "positive").length;
          const dealerRating = dealerReviews.length > 0 ? Math.round((positiveCount / dealerReviews.length) * 100) : 0;
          setDealerStats({ newRequests: requestsRes?.count ?? 0, openOffers: offersRes?.count ?? 0, contactRequests: contactsRes?.count ?? 0, dealerRating });
        }
      } catch (e) {
        if (!cancelled) console.error("[Dashboard] Stats load error:", e);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, user?.id, isDealer]);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-32">
      
      {/* Combined Header Segment */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white pt-6 pb-12 shadow-sm overflow-hidden z-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10 flex flex-col gap-8">
          {/* Welcome Text */}
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
              Willkommen zurück, {userName}! 👋
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
            
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aktive Inserate</div>
                </div>
                <div className="text-4xl font-black text-navy-950">
                  {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : buyerStats.activeTenders}
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Inbox size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Neue Angebote</div>
                </div>
                <div className="text-4xl font-black text-navy-950">
                  {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : buyerStats.totalOffers}
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <PiggyBank size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ø Ersparnis</div>
                </div>
                <div className="text-4xl font-black text-navy-950">
                  {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : `${buyerStats.avgSavings}%`}
                </div>
              </Card>

              <Card className={`p-6 rounded-3xl shadow-sm bg-white transition-colors group ${buyerStats.openRatings > 0 ? "border-amber-300 border-2" : "border-slate-200 hover:border-blue-300"}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${buyerStats.openRatings > 0 ? "bg-amber-100 text-amber-600" : "bg-amber-50 text-amber-500"}`}>
                    <Star size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Offene Ratings</div>
                </div>
                <div className={`text-4xl font-black ${buyerStats.openRatings > 0 ? "text-amber-600" : "text-navy-950"}`}>
                  {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : buyerStats.openRatings}
                </div>
                {buyerStats.openRatings > 0 && (
                  <p className="text-xs text-amber-600 font-semibold mt-2">Bitte bewerten Sie Ihre Kontakte</p>
                )}
              </Card>
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

              {/* Feed (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                <h2 className="text-2xl font-bold text-navy-950">Letzte Aktivitäten</h2>
                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm bg-white">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                      <InboxIcon size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-navy-950 mb-2">Noch keine Aktivitäten</h4>
                    <p className="text-sm text-slate-500 max-w-xs">Sobald Sie Ausschreibungen erstellen oder Angebote erhalten, erscheinen Ihre Aktivitäten hier.</p>
                  </div>
                </Card>
              </div>

            </div>
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

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Bell size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Neue Anfragen</div>
                </div>
                <div className="text-4xl font-black text-navy-950">
                  {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : dealerStats.newRequests}
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-600 group-hover:text-white transition-colors">
                    <TrendingUp size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Offene Angebote</div>
                </div>
                <div className="text-4xl font-black text-navy-950">
                  {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : dealerStats.openOffers}
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Handshake size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Kontaktwünsche</div>
                </div>
                <div className="text-4xl font-black text-navy-950">
                  {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : dealerStats.contactRequests}
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <Star size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Bewertung</div>
                </div>
                <div className="text-4xl font-black text-navy-950">
                  {statsLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : `${dealerStats.dealerRating}%`}
                </div>
              </Card>
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

              {/* Feed (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                <h2 className="text-2xl font-bold text-navy-950">Updates & Events</h2>
                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm bg-white">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                      <InboxIcon size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-navy-950 mb-2">Noch keine Aktivitäten</h4>
                    <p className="text-sm text-slate-500 max-w-xs">Sobald es Neuigkeiten zu Ihren Angeboten oder Ausschreibungen gibt, erscheinen sie hier.</p>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

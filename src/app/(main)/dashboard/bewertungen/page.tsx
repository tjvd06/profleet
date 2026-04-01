"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star, TrendingUp, Building2, User,
  MessageSquare, FileText, Handshake,
  Clock, Loader2, ThumbsUp, Minus, ThumbsDown,
  Pencil, Send, CheckCircle2, XOctagon,
  BarChart3, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { toast } from "sonner";

/* ──────────────────────────────────────────────────────────── */
/*  Helpers                                                      */
/* ──────────────────────────────────────────────────────────── */

function getRatingColor(score: number, total: number) {
  if (total === 0) return "text-slate-400";
  if (score >= 80) return "text-green-600";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(dateStr));
}

type ReviewRow = {
  id: string;
  tender_id: string;
  contact_id: string;
  from_user_id: string;
  to_user_id: string;
  type: "positive" | "neutral" | "negative";
  contract_concluded: boolean;
  comment: string | null;
  created_at: string;
};

type ProfileSnippet = {
  id: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
};

/* ──────────────────────────────────────────────────────────── */
/*  Empty State                                                  */
/* ──────────────────────────────────────────────────────────── */

function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
        <Icon size={36} />
      </div>
      <h3 className="text-xl font-bold text-navy-950 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm">{description}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Stat Card                                                    */
/* ──────────────────────────────────────────────────────────── */

function StatCard({ label, value, sub, icon: Icon, iconColor }: {
  label: string; value: string | number; sub?: string; icon: any; iconColor: string;
}) {
  return (
    <Card className="p-5 rounded-2xl border-slate-200 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="font-black text-2xl text-navy-950">{value}</div>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Main Component                                               */
/* ──────────────────────────────────────────────────────────── */

export default function BewertungenPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(true);

  const isDealer = profile?.role === "anbieter";

  const [receivedReviews, setReceivedReviews] = useState<ReviewRow[]>([]);
  const [givenReviews, setGivenReviews] = useState<ReviewRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileSnippet>>({});

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<"positive" | "neutral" | "negative" | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editContract, setEditContract] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Stats
  const [totalContacts, setTotalContacts] = useState(0);
  const [contacts6m, setContacts6m] = useState(0);
  const [concludedCount, setConcludedCount] = useState(0);
  const [totalContactsForConcluded, setTotalContactsForConcluded] = useState(0);
  const [activeTenderOrOfferCount, setActiveTenderOrOfferCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [cancelled6m, setCancelled6m] = useState(0);

  useEffect(() => {
    if (authLoading || !user) { setLoading(false); return; }

    let cancelled = false;
    setLoading(true);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoISO = sixMonthsAgo.toISOString();
    const contactCol = isDealer ? "dealer_id" : "buyer_id";

    (async () => {
      try {
        const [reviewsRecv, reviewsGiven, contactsRes, tendersRes] = await Promise.all([
          supabase.from("reviews").select("*").eq("to_user_id", user.id),
          supabase.from("reviews").select("*").eq("from_user_id", user.id),
          supabase.from("contacts").select("id, created_at").eq(contactCol, user.id),
          isDealer
            ? supabase.from("offers").select("id, tenders!inner(status)").eq("dealer_id", user.id)
            : supabase.from("tenders").select("id, status").eq("buyer_id", user.id),
        ]);

        if (cancelled) return;

        const recv = (reviewsRecv.data || []) as ReviewRow[];
        const given = (reviewsGiven.data || []) as ReviewRow[];
        setReceivedReviews(recv);
        setGivenReviews(given);

        const userIds = Array.from(new Set([
          ...recv.map(r => r.from_user_id),
          ...given.map(r => r.to_user_id),
        ]));
        if (userIds.length > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, company_name, first_name, last_name, city")
            .in("id", userIds);
          if (profs) {
            const map: Record<string, ProfileSnippet> = {};
            profs.forEach((p: ProfileSnippet) => { map[p.id] = p; });
            setProfiles(map);
          }
        }

        const allContacts = contactsRes.data || [];
        setTotalContacts(allContacts.length);
        setContacts6m(allContacts.filter((c: any) => c.created_at >= sixMonthsAgoISO).length);
        setConcludedCount(given.filter((r: ReviewRow) => r.contract_concluded === true).length);
        setTotalContactsForConcluded(allContacts.length);

        const tData = tendersRes.data || [];
        if (isDealer) {
          setActiveTenderOrOfferCount(tData.filter((o: any) => o.tenders?.status === "active").length);
          setCancelledCount(0); setCancelled6m(0);
        } else {
          setActiveTenderOrOfferCount(tData.filter((t: any) => t.status === "active").length);
          const c = tData.filter((t: any) => t.status === "cancelled");
          setCancelledCount(c.length); setCancelled6m(c.length);
        }
      } catch (e) {
        console.error("[Bewertungen] Error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, user?.id, isDealer]);

  // Computed
  const positive = receivedReviews.filter(r => r.type === "positive").length;
  const neutral = receivedReviews.filter(r => r.type === "neutral").length;
  const negative = receivedReviews.filter(r => r.type === "negative").length;
  const totalBreakdown = positive + neutral + negative;
  const ratingOverall = totalBreakdown > 0 ? Math.round((positive / totalBreakdown) * 100) : 0;
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const reviews6m = receivedReviews.filter(r => new Date(r.created_at) >= sixMonthsAgo).length;
  const posPct = totalBreakdown > 0 ? Math.round((positive / totalBreakdown) * 100) : 0;
  const neuPct = totalBreakdown > 0 ? Math.round((neutral / totalBreakdown) * 100) : 0;
  const negPct = totalBreakdown > 0 ? Math.round((negative / totalBreakdown) * 100) : 0;
  const concludedPct = totalContactsForConcluded > 0 ? Math.round((concludedCount / totalContactsForConcluded) * 100) : 0;
  const ratingsGivenPct = totalContactsForConcluded > 0 ? Math.round((givenReviews.length / totalContactsForConcluded) * 100) : 0;

  // Edit handlers
  const startEdit = (r: ReviewRow) => {
    setEditingId(r.id);
    setEditType(r.type);
    setEditComment(r.comment || "");
    setEditContract(r.contract_concluded);
  };
  const cancelEdit = () => { setEditingId(null); setEditType(null); setEditComment(""); setEditContract(false); };
  const saveEdit = async () => {
    if (!editingId || !editType) return;
    setEditLoading(true);
    const updateData: any = { type: editType, comment: editComment || null };
    if (!isDealer) updateData.contract_concluded = editContract;
    const { error } = await supabase.from("reviews").update(updateData).eq("id", editingId);
    if (error) { toast.error("Fehler: " + error.message); }
    else {
      setGivenReviews(prev => prev.map(r => r.id === editingId ? { ...r, type: editType!, comment: editComment || null, ...(isDealer ? {} : { contract_concluded: editContract }) } : r));
      toast.success("Bewertung aktualisiert!");
      cancelEdit();
    }
    setEditLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  // Review type badge
  const TypeBadge = ({ type }: { type: "positive" | "neutral" | "negative" }) => {
    const cfg = {
      positive: { icon: ThumbsUp, label: "Positiv", cls: "bg-green-50 text-green-700 border border-green-200" },
      neutral: { icon: Minus, label: "Neutral", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
      negative: { icon: ThumbsDown, label: "Negativ", cls: "bg-red-50 text-red-700 border border-red-200" },
    }[type];
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.cls}`}>
        <Icon size={12} /> {cfg.label}
      </span>
    );
  };

  return (
    <div className="min-h-[calc(100vh-80px)] pb-24">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Dashboard</p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-navy-950">Bewertungen & Statistik</h1>
              <p className="text-sm text-slate-500 mt-1">Ihr Profil-Stand und Plattform-Aktivitäten auf einen Blick.</p>
            </div>
            {totalBreakdown > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-navy-950">{totalBreakdown}</span>
                  <span className="text-slate-500">Bewertungen</span>
                </div>
                <div className="w-px h-5 bg-slate-200" />
                <div className="flex items-center gap-2 text-sm">
                  <span className={`font-bold ${getRatingColor(ratingOverall, totalBreakdown)}`}>{ratingOverall}%</span>
                  <span className="text-slate-500">Positiv</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-6 md:mt-8">
        <Tabs defaultValue="overview" className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Sidebar */}
          <div className="w-full lg:w-56 shrink-0">
            <div className="sticky top-28">
              <TabsList className="flex flex-col h-auto bg-transparent w-full p-0 space-y-1">
                <TabsTrigger value="overview" className="w-full justify-between items-center px-4 py-2.5 !rounded-lg !bg-transparent hover:!bg-slate-50 data-[active]:!bg-blue-50 !border-0 !text-slate-400 data-[active]:!text-blue-700 data-[active]:!font-semibold !shadow-none transition-all text-sm font-medium">
                  <span>Übersicht</span>
                </TabsTrigger>
                <TabsTrigger value="received" className="w-full justify-between items-center px-4 py-2.5 !rounded-lg !bg-transparent hover:!bg-slate-50 data-[active]:!bg-blue-50 !border-0 !text-slate-400 data-[active]:!text-blue-700 data-[active]:!font-semibold !shadow-none transition-all text-sm font-medium">
                  <span>Erhaltene</span>
                  <span className="text-xs text-slate-400 font-normal">{receivedReviews.length}</span>
                </TabsTrigger>
                <TabsTrigger value="given" className="w-full justify-between items-center px-4 py-2.5 !rounded-lg !bg-transparent hover:!bg-slate-50 data-[active]:!bg-blue-50 !border-0 !text-slate-400 data-[active]:!text-blue-700 data-[active]:!font-semibold !shadow-none transition-all text-sm font-medium">
                  <span>Abgegebene</span>
                  <span className="text-xs text-slate-400 font-normal">{givenReviews.length}</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">

          {/* ── OVERVIEW TAB ── */}
          <TabsContent value="overview" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">

            {/* Score + Breakdown row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score card */}
              <Card className="p-6 rounded-2xl border-slate-200 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Gesamtbewertung</h3>
                  <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">
                    {isDealer ? <><Building2 size={10} className="mr-1" /> von Nachfragern</> : <><User size={10} className="mr-1" /> von Händlern</>}
                  </Badge>
                </div>
                <div className="flex items-end gap-3 mb-4">
                  <span className={`text-5xl font-black tracking-tight ${getRatingColor(ratingOverall, totalBreakdown)}`}>
                    {totalBreakdown === 0 ? "—" : `${ratingOverall}%`}
                  </span>
                  {totalBreakdown > 0 && (
                    <span className="text-sm font-medium text-slate-400 pb-1.5">positiv</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span><span className="font-bold text-navy-950">{totalBreakdown}</span> gesamt</span>
                  <span className="text-slate-300">|</span>
                  <span><span className="font-bold text-navy-950">{reviews6m}</span> in 6 Mon.</span>
                </div>
              </Card>

              {/* Breakdown bars */}
              <Card className="lg:col-span-2 p-6 rounded-2xl border-slate-200 shadow-sm bg-white">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-5">Aufschlüsselung</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Positiv</span>
                      <span className="text-slate-500 font-medium">{positive} <span className="text-slate-400">({posPct}%)</span></span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${posPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5"><Clock size={14} className="text-amber-500" /> Neutral</span>
                      <span className="text-slate-500 font-medium">{neutral} <span className="text-slate-400">({neuPct}%)</span></span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${neuPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5"><XOctagon size={14} className="text-red-500" /> Negativ</span>
                      <span className="text-slate-500 font-medium">{negative} <span className="text-slate-400">({negPct}%)</span></span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full transition-all duration-700" style={{ width: `${negPct}%` }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* KPI stat cards */}
            <div>
              <h2 className="text-lg font-bold text-navy-950 mb-4">{isDealer ? "Händler-Statistik" : "Aktivitäten"}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard
                  label={isDealer ? "Kontakte" : "Kontakte"}
                  value={totalContacts}
                  sub={`${contacts6m} in 6 Mon.`}
                  icon={MessageSquare}
                  iconColor="bg-blue-50 text-blue-600"
                />
                <StatCard
                  label="Abschlüsse"
                  value={`${concludedPct}%`}
                  sub={`${concludedCount} von ${totalContactsForConcluded}`}
                  icon={Handshake}
                  iconColor="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                  label="Bewertungsquote"
                  value={`${ratingsGivenPct}%`}
                  sub="Anteil bewerteter Partner"
                  icon={Star}
                  iconColor="bg-amber-50 text-amber-600"
                />
                <StatCard
                  label={isDealer ? "Offene Angebote" : "Offene Ausschr."}
                  value={activeTenderOrOfferCount}
                  sub="Ohne Finalisierung"
                  icon={FileText}
                  iconColor="bg-slate-100 text-slate-500"
                />
                <StatCard
                  label="Stornos"
                  value={cancelledCount}
                  sub={`${cancelled6m} in 6 Mon.`}
                  icon={XOctagon}
                  iconColor="bg-red-50 text-red-500"
                />
              </div>
            </div>
          </TabsContent>

          {/* ── RECEIVED TAB ── */}
          <TabsContent value="received" className="m-0 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {receivedReviews.length === 0 ? (
              <EmptyState icon={Star} title="Noch keine Bewertungen erhalten" description="Sobald Sie von Geschäftspartnern bewertet werden, erscheinen die Bewertungen hier." />
            ) : (
              <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-4">Unternehmen</div>
                  <div className="col-span-2">Datum</div>
                  <div className="col-span-2">Bewertung</div>
                  <div className="col-span-2">Vertrag</div>
                  <div className="col-span-2">Kommentar</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {receivedReviews
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((review) => {
                      const from = profiles[review.from_user_id];
                      return (
                        <div key={review.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors items-center">
                          {/* Company */}
                          <div className="col-span-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                              {from?.company_name?.[0] || "?"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-navy-950 truncate">{from?.company_name || "Unbekannt"}</div>
                              {from?.city && <div className="text-xs text-slate-400">{from.city}</div>}
                            </div>
                          </div>
                          {/* Date */}
                          <div className="col-span-2 text-sm text-slate-500">{formatDate(review.created_at)}</div>
                          {/* Type */}
                          <div className="col-span-2">
                            <TypeBadge type={review.type} />
                          </div>
                          {/* Contract */}
                          <div className="col-span-2">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${review.contract_concluded ? "text-green-600" : "text-slate-400"}`}>
                              {review.contract_concluded ? <><CheckCircle2 size={12} /> Ja</> : "Nein"}
                            </span>
                          </div>
                          {/* Comment */}
                          <div className="col-span-2 text-sm text-slate-500 truncate">
                            {review.comment ? `\u201E${review.comment}\u201C` : <span className="text-slate-300">—</span>}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* ── GIVEN TAB ── */}
          <TabsContent value="given" className="m-0 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {givenReviews.length === 0 ? (
              <EmptyState icon={Send} title="Noch keine Bewertungen abgegeben" description="Bewerten Sie Ihre Geschäftspartner nach Abschluss einer Ausschreibung." />
            ) : (
              <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-3">Unternehmen</div>
                  <div className="col-span-2">Datum</div>
                  <div className="col-span-2">Bewertung</div>
                  <div className="col-span-2">Vertrag</div>
                  <div className="col-span-2">Kommentar</div>
                  <div className="col-span-1"></div>
                </div>
                <div className="divide-y divide-slate-100">
                  {givenReviews
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((review) => {
                      const target = profiles[review.to_user_id];
                      const isEditing = editingId === review.id;

                      if (isEditing) {
                        return (
                          <div key={review.id} className="px-6 py-5 bg-blue-50/30">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                {target?.company_name?.[0] || "?"}
                              </div>
                              <div>
                                <div className="font-semibold text-sm text-navy-950">{target?.company_name || "Unbekannt"}</div>
                                <div className="text-xs text-slate-400">{formatDate(review.created_at)}</div>
                              </div>
                            </div>
                            <div className="flex gap-2 mb-3">
                              {(["positive", "neutral", "negative"] as const).map((t) => {
                                const cfg = {
                                  positive: { icon: ThumbsUp, label: "Positiv", active: "border-green-400 bg-green-50 text-green-700 ring-2 ring-green-200", idle: "border-slate-200 bg-white text-slate-500 hover:border-green-300 hover:text-green-600" },
                                  neutral: { icon: Minus, label: "Neutral", active: "border-amber-400 bg-amber-50 text-amber-700 ring-2 ring-amber-200", idle: "border-slate-200 bg-white text-slate-500 hover:border-amber-300 hover:text-amber-600" },
                                  negative: { icon: ThumbsDown, label: "Negativ", active: "border-red-400 bg-red-50 text-red-700 ring-2 ring-red-200", idle: "border-slate-200 bg-white text-slate-500 hover:border-red-300 hover:text-red-600" },
                                }[t];
                                const Icon = cfg.icon;
                                return (
                                  <button key={t} onClick={() => setEditType(t)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${editType === t ? cfg.active : cfg.idle}`}>
                                    <Icon size={14} /> {cfg.label}
                                  </button>
                                );
                              })}
                            </div>
                            {!isDealer && (
                              <div className="mb-3">
                                <div className="text-xs font-semibold text-slate-500 mb-1.5">Vertrag zustande gekommen?</div>
                                <div className="flex gap-2">
                                  <button onClick={() => setEditContract(true)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${editContract ? "border-green-400 bg-green-50 text-green-700 ring-2 ring-green-200" : "border-slate-200 bg-white text-slate-500 hover:border-green-300 hover:text-green-600"}`}>
                                    <CheckCircle2 size={14} /> Ja
                                  </button>
                                  <button onClick={() => setEditContract(false)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${!editContract ? "border-red-400 bg-red-50 text-red-700 ring-2 ring-red-200" : "border-slate-200 bg-white text-slate-500 hover:border-red-300 hover:text-red-600"}`}>
                                    <XOctagon size={14} /> Nein
                                  </button>
                                </div>
                              </div>
                            )}
                            <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} placeholder="Optionaler Kommentar..."
                              rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none mb-3 bg-white" />
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={cancelEdit} className="rounded-lg h-8 text-xs">Abbrechen</Button>
                              <Button onClick={saveEdit} disabled={!editType || editLoading} className="rounded-lg h-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4">
                                {editLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                                Speichern
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={review.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors items-center">
                          {/* Company */}
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                              {target?.company_name?.[0] || "?"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-navy-950 truncate">{target?.company_name || "Unbekannt"}</div>
                              {target?.city && <div className="text-xs text-slate-400">{target.city}</div>}
                            </div>
                          </div>
                          {/* Date */}
                          <div className="col-span-2 text-sm text-slate-500">{formatDate(review.created_at)}</div>
                          {/* Type */}
                          <div className="col-span-2">
                            <TypeBadge type={review.type} />
                          </div>
                          {/* Contract */}
                          <div className="col-span-2">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${review.contract_concluded ? "text-green-600" : "text-slate-400"}`}>
                              {review.contract_concluded ? <><CheckCircle2 size={12} /> Ja</> : "Nein"}
                            </span>
                          </div>
                          {/* Comment */}
                          <div className="col-span-2 text-sm text-slate-500 truncate">
                            {review.comment ? `\u201E${review.comment}\u201C` : <span className="text-slate-300">—</span>}
                          </div>
                          {/* Edit */}
                          <div className="col-span-1 text-right">
                            <button onClick={() => startEdit(review)} className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1">
                              <Pencil size={12} /> Ändern
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            )}
          </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  );
}

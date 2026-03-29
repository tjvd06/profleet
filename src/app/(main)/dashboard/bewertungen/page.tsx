"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Star, TrendingUp, TrendingDown, Building2, User,
  MessageSquare, FileText, CheckCircle2, ShieldCheck, Handshake,
  XOctagon, Clock, Loader2, ThumbsUp, Minus, ThumbsDown,
  Pencil, Send,
} from "lucide-react";
import { toast } from "sonner";

/* ──────────────────────────────────────────────────────────── */
/*  Helpers                                                      */
/* ──────────────────────────────────────────────────────────── */

function getRatingColor(score: number, total: number) {
  if (total === 0) return "text-slate-400";
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function getRatingStrokeColor(score: number, total: number) {
  if (total === 0) return "stroke-slate-200";
  if (score >= 80) return "stroke-green-500";
  if (score >= 50) return "stroke-amber-500";
  return "stroke-red-500";
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

        // Load profiles for all review counterparts
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

        // Stats - contract concluded now comes from reviews, not contacts
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

  const ratingColorClass = getRatingColor(ratingOverall, totalBreakdown);
  const ratingStrokeClass = getRatingStrokeColor(ratingOverall, totalBreakdown);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ratingOverall / 100) * circumference;

  // Edit handlers
  const startEdit = (r: ReviewRow) => {
    setEditingId(r.id);
    setEditType(r.type);
    setEditComment(r.comment || "");
  };
  const cancelEdit = () => { setEditingId(null); setEditType(null); setEditComment(""); };
  const saveEdit = async () => {
    if (!editingId || !editType) return;
    setEditLoading(true);
    const { error } = await supabase.from("reviews").update({ type: editType, comment: editComment || null }).eq("id", editingId);
    if (error) { toast.error("Fehler: " + error.message); }
    else {
      setGivenReviews(prev => prev.map(r => r.id === editingId ? { ...r, type: editType!, comment: editComment || null } : r));
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

  // Render a single review card (for given reviews)
  const renderGivenReviewCard = (review: ReviewRow) => {
    const target = profiles[review.to_user_id];
    const isEditing = editingId === review.id;

    return (
      <Card key={review.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6">
          {/* Target info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
              {(target?.company_name?.[0] || "?")}
            </div>
            <div className="flex-1">
              <div className="font-bold text-navy-950">{target?.company_name || "Unbekannt"}</div>
              <div className="text-xs text-slate-500">
                {target?.city && target.city}
                {" · "}{formatDate(review.created_at)}
              </div>
            </div>
            <Badge className={review.contract_concluded ? "bg-green-100 text-green-700 border-none text-xs" : "bg-slate-100 text-slate-500 border-none text-xs"}>
              {review.contract_concluded ? "Vertrag" : "Kein Vertrag"}
            </Badge>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                {(["positive", "neutral", "negative"] as const).map((t) => {
                  const cfg = {
                    positive: { icon: ThumbsUp, label: "Positiv", active: "border-green-400 bg-green-100 text-green-700 ring-2 ring-green-200", idle: "border-green-200 bg-green-50 text-green-600 hover:bg-green-100" },
                    neutral: { icon: Minus, label: "Neutral", active: "border-amber-400 bg-amber-100 text-amber-700 ring-2 ring-amber-200", idle: "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100" },
                    negative: { icon: ThumbsDown, label: "Negativ", active: "border-red-400 bg-red-100 text-red-700 ring-2 ring-red-200", idle: "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" },
                  }[t];
                  const Icon = cfg.icon;
                  return (
                    <button key={t} onClick={() => setEditType(t)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${editType === t ? cfg.active : cfg.idle}`}>
                      <Icon size={16} /> {cfg.label}
                    </button>
                  );
                })}
              </div>
              <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} placeholder="Optionaler Kommentar..."
                rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
              <div className="flex gap-2">
                <Button variant="outline" onClick={cancelEdit} className="rounded-xl h-9 text-slate-500 text-xs">Abbrechen</Button>
                <Button onClick={saveEdit} disabled={!editType || editLoading} className="rounded-xl h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4">
                  {editLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                  Speichern
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Badge className={
                review.type === "positive" ? "bg-green-100 text-green-700 border-none" :
                review.type === "neutral" ? "bg-amber-100 text-amber-700 border-none" :
                "bg-red-100 text-red-700 border-none"
              }>
                {review.type === "positive" && <><ThumbsUp size={12} className="mr-1" /> Positiv</>}
                {review.type === "neutral" && <><Minus size={12} className="mr-1" /> Neutral</>}
                {review.type === "negative" && <><ThumbsDown size={12} className="mr-1" /> Negativ</>}
              </Badge>
              {review.comment && <span className="text-sm text-slate-500 truncate flex-1">&ldquo;{review.comment}&rdquo;</span>}
              <button onClick={() => startEdit(review)} className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 shrink-0 ml-auto">
                <Pencil size={12} /> Ändern
              </button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Render a single received review card
  const renderReceivedReviewCard = (review: ReviewRow) => {
    const from = profiles[review.from_user_id];
    return (
      <Card key={review.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
              {(from?.company_name?.[0] || "?")}
            </div>
            <div className="flex-1">
              <div className="font-bold text-navy-950">{from?.company_name || "Unbekannt"}</div>
              <div className="text-xs text-slate-500">
                {from?.city && from.city}
                {" · "}{formatDate(review.created_at)}
              </div>
            </div>
            <Badge className={
              review.type === "positive" ? "bg-green-100 text-green-700 border-none" :
              review.type === "neutral" ? "bg-amber-100 text-amber-700 border-none" :
              "bg-red-100 text-red-700 border-none"
            }>
              {review.type === "positive" && <><ThumbsUp size={12} className="mr-1" /> Positiv</>}
              {review.type === "neutral" && <><Minus size={12} className="mr-1" /> Neutral</>}
              {review.type === "negative" && <><ThumbsDown size={12} className="mr-1" /> Negativ</>}
            </Badge>
          </div>
          {review.comment && (
            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">&ldquo;{review.comment}&rdquo;</p>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-32">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white py-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-4">Bewertungen & Statistik</h1>
          <p className="text-lg text-blue-100/80 max-w-2xl leading-relaxed">Ihr Profil-Stand und Plattform-Aktivitäten auf einen Blick.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-8">
        <Tabs defaultValue="overview" className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="sticky top-28">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Kategorien</h3>
              <TabsList className="flex flex-col h-auto bg-transparent w-full p-0 space-y-3">
                <TabsTrigger value="overview" className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold">
                  <div className="flex items-center gap-3">
                    <BarChart3 size={20} className="text-blue-500" />
                    Übersicht
                  </div>
                </TabsTrigger>
                <TabsTrigger value="received" className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold">
                  <div className="flex items-center gap-3">
                    <Star size={20} className="text-amber-500" />
                    Erhaltene
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{receivedReviews.length}</span>
                </TabsTrigger>
                <TabsTrigger value="given" className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold">
                  <div className="flex items-center gap-3">
                    <Send size={20} className="text-green-500" />
                    Abgegebene
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{givenReviews.length}</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0">

            {/* ── OVERVIEW TAB ── */}
            <TabsContent value="overview" className="m-0 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
              {/* Score Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-navy-950">Erhaltene Bewertungen</h2>
                  <Badge variant="outline" className="bg-slate-100 text-slate-500 border-none font-semibold">
                    {isDealer ? <><Building2 size={14} className="mr-1.5 inline" /> von Nachfragern</> : <><User size={14} className="mr-1.5 inline" /> von Händlern</>}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Donut */}
                  <Card className="lg:col-span-5 p-8 rounded-3xl border-slate-200 shadow-sm flex flex-col items-center justify-center text-center bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><ShieldCheck size={120} /></div>
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="96" cy="96" r="80" className="stroke-slate-100" strokeWidth="16" fill="transparent" />
                        <circle cx="96" cy="96" r="80" className={`${ratingStrokeClass} transition-all duration-1000 ease-out`} strokeWidth="16" strokeLinecap="round" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
                      </svg>
                      <div className="flex flex-col items-center z-10">
                        <span className={`text-5xl font-black tracking-tighter ${ratingColorClass}`}>{totalBreakdown === 0 ? "—" : `${ratingOverall}%`}</span>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
                      </div>
                    </div>
                    <p className="mt-6 text-sm font-medium text-slate-500 max-w-[250px]">
                      {totalBreakdown === 0 ? "Noch keine Bewertungen erhalten." : ratingOverall >= 80 ? "Ausgezeichnet!" : ratingOverall >= 50 ? "Gut, mit Raum für Verbesserungen." : "Score ist kritisch."}
                    </p>
                  </Card>

                  {/* Breakdown */}
                  <Card className="lg:col-span-7 p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm flex flex-col justify-between bg-white">
                    <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-6">Sentiment Breakdown</h3>
                    <div className="space-y-5 mb-8">
                      <div>
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-green-700 flex items-center gap-1.5"><CheckCircle2 size={16}/> Positiv</span>
                          <span className="text-slate-500">{positive} ({posPct}%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${posPct}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-slate-600 flex items-center gap-1.5"><Clock size={16}/> Neutral</span>
                          <span className="text-slate-500">{neutral} ({neuPct}%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-400 rounded-full transition-all duration-1000" style={{ width: `${neuPct}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-red-600 flex items-center gap-1.5"><XOctagon size={16}/> Negativ</span>
                          <span className="text-slate-500">{negative} ({negPct}%)</span>
                        </div>
                        <div className="h-3 w-full bg-red-50 rounded-full overflow-hidden border border-red-100">
                          <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${negPct}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200">
                          <tr><th className="px-5 py-3">Metrik</th><th className="px-5 py-3 w-32 border-l border-slate-200">Gesamt</th><th className="px-5 py-3 w-32 border-l border-slate-200 text-navy-900">6 Mon.</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="bg-white">
                            <td className="px-5 py-3 font-semibold text-navy-950 flex items-center gap-2"><Star size={16} className="text-slate-400" /> Bewertungen</td>
                            <td className="px-5 py-3 border-l border-slate-100 font-bold">{totalBreakdown}</td>
                            <td className="px-5 py-3 border-l border-slate-100 font-bold text-navy-900 bg-blue-50/20">{reviews6m}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </section>

              {/* KPIs */}
              <section>
                <h2 className="text-2xl font-bold text-navy-950 mb-6">{isDealer ? "Ihre Händler-Statistik" : "Ihre Aktivitäten"}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">{isDealer ? "Erhaltene Kontakte" : "Anbieter-Kontakte"} <MessageSquare size={16} className="text-blue-500" /></div>
                    <div className="font-black text-3xl text-navy-950 mb-1">{totalContacts}</div>
                    <div className="text-sm font-semibold text-blue-600 flex items-center gap-1.5"><TrendingUp size={14} /> {contacts6m} in 6 M.</div>
                  </Card>
                  <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">Vertragsabschlüsse <Handshake size={16} className="text-emerald-500" /></div>
                    <div className="font-black text-3xl text-navy-950 mb-1">{concludedPct}%</div>
                    <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5"><TrendingUp size={14} /> {concludedCount} von {totalContactsForConcluded}</div>
                  </Card>
                  <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">Eigene Rezensionen <Star size={16} className="text-amber-500" /></div>
                    <div className="font-black text-3xl text-navy-950 mb-1">{ratingsGivenPct}%</div>
                    <div className="text-sm font-semibold text-slate-500 mt-1 border-t border-slate-100 pt-2 text-[11px]">Anteil bewerteter Geschäftspartner.</div>
                  </Card>
                  <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">Offene {isDealer ? "Angebote" : "Ausschr."} <FileText size={16} className="text-slate-400" /></div>
                    <div className="font-black text-3xl text-navy-950 mb-1">{activeTenderOrOfferCount}</div>
                    <div className="text-sm font-semibold text-slate-500 mt-1">Ohne Finalisierung</div>
                  </Card>
                  <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors border-l-4 border-l-red-500">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">Stornos <TrendingDown size={16} className="text-red-500" /></div>
                    <div className="font-black text-3xl text-navy-950 mb-1">{cancelledCount}</div>
                    <div className="text-sm font-semibold text-red-500/80 text-[11px]">{cancelled6m} in letzten 6 Monaten.</div>
                  </Card>
                </div>
              </section>
            </TabsContent>

            {/* ── RECEIVED TAB ── */}
            <TabsContent value="received" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
              {receivedReviews.length === 0 ? (
                <EmptyState icon={Star} title="Noch keine Bewertungen erhalten" description="Sobald Sie von Geschäftspartnern bewertet werden, erscheinen die Bewertungen hier." />
              ) : (
                receivedReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(renderReceivedReviewCard)
              )}
            </TabsContent>

            {/* ── GIVEN TAB ── */}
            <TabsContent value="given" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
              {givenReviews.length === 0 ? (
                <EmptyState icon={Send} title="Noch keine Bewertungen abgegeben" description="Bewerten Sie Ihre Geschäftspartner nach Abschluss einer Ausschreibung." />
              ) : (
                givenReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(renderGivenReviewCard)
              )}
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  );
}

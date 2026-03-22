"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusTracker } from "@/components/ui-custom/StatusTracker";
import { RatingBadge } from "@/components/ui-custom/RatingBadge";
import { Clock, ChevronDown, ChevronUp, MapPin, Building2, CheckCircle2, FileText, Pencil, Trash2, Globe, ArrowUpDown, Activity, FileEdit, Loader2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
type TenderVehicle = {
  id: string;
  brand: string | null;
  model_name: string | null;
  list_price_gross: number | null;
  quantity: number;
};

type Offer = {
  id: string;
  total_price: number | null;
  purchase_price: number | null;
  lease_rate: number | null;
  created_at: string;
};

type Tender = {
  id: string;
  status: string;
  start_at: string | null;
  end_at: string | null;
  delivery_plz: string | null;
  tender_scope: string;
  created_at: string;
  tender_vehicles: TenderVehicle[];
  offers: Offer[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeLeft(endAt: string | null): string {
  if (!endAt) return "—";
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "Abgelaufen";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return days > 0 ? `${days} Tage ${hours} Std.` : `${hours} Std.`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(dateStr));
}

function createdAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Heute";
  if (days === 1) return "Gestern";
  return `Vor ${days} Tagen`;
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, description, cta }: { icon: any, title: string, description: string, cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
        <Icon size={36} />
      </div>
      <h3 className="text-xl font-bold text-navy-950 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-8">{description}</p>
      {cta}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyTendersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [supabase] = useState(() => createClient());

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedTender, setExpandedTender] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'price', direction: 'asc' });

  useEffect(() => {
    console.log("[Ausschreibungen] authLoading:", authLoading, "user:", user?.id ?? "null");
    
    if (authLoading) {
      console.log("[Ausschreibungen] Waiting for auth...");
      return;
    }
    
    if (!user) {
      console.log("[Ausschreibungen] No user, setting loading=false");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    console.log("[Ausschreibungen] Starting Supabase query for user:", user.id);
    
    (async () => {
      try {
        const { data, error } = await supabase
          .from("tenders")
          .select("*, tender_vehicles(*), offers(*)")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false });

        console.log("[Ausschreibungen] Query returned. data:", data?.length ?? "null", "error:", error?.message ?? "none");
        
        if (cancelled) return;
        
        if (error) {
          console.error("[Ausschreibungen] Supabase error:", error);
          setFetchError(error.message);
        } else if (data) {
          setTenders(data as Tender[]);
          if (data.length > 0) setExpandedTender(data[0].id);
        }
      } catch (err: any) {
        console.error("[Ausschreibungen] Exception:", err);
        if (!cancelled) {
          setFetchError(err?.message || "Unbekannter Fehler");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authLoading, user?.id]);

  const activeTenders = tenders.filter(t => t.status === "active");
  const completedTenders = tenders.filter(t => t.status === "completed");
  const draftTenders = tenders.filter(t => t.status === "draft");

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white py-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-4">Meine Ausschreibungen</h1>
            <p className="text-lg text-blue-100/80 max-w-2xl leading-relaxed">Verwalten Sie Ihre aktiven, abgeschlossenen und als Entwurf gespeicherten Ausschreibungen.</p>
          </div>
          <Link href="/dashboard/ausschreibung/neu">
            <Button className="rounded-2xl bg-white text-navy-900 hover:bg-blue-50 font-bold h-12 px-6 shadow-lg flex items-center gap-2 shrink-0">
              <Plus size={18} /> Neue Ausschreibung
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-slate-400">
            <Loader2 className="animate-spin mr-3" size={28} />
            <span className="text-lg font-semibold">Ausschreibungen werden geladen…</span>
          </div>
        ) : fetchError ? (
          <div className="py-16 flex flex-col items-center text-center">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg w-full">
              <h3 className="text-lg font-bold text-red-800 mb-2">Fehler beim Laden</h3>
              <p className="text-red-600 text-sm mb-4">{fetchError}</p>
              <Button variant="outline" className="rounded-xl border-red-200 text-red-700 hover:bg-red-100" onClick={() => window.location.reload()}>
                Erneut versuchen
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Left Sidebar Navigation */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="sticky top-28">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Kategorien</h3>
                <TabsList className="flex flex-col h-auto bg-transparent w-full p-0 space-y-3">
                  <TabsTrigger 
                    value="active" 
                    className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                  >
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-blue-500" />
                      Laufende
                    </div>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{activeTenders.length}</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="completed" 
                    className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-green-500" />
                      Abgeschlossene
                    </div>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{completedTenders.length}</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="drafts" 
                    className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                  >
                    <div className="flex items-center gap-3">
                      <FileEdit size={20} className="text-amber-500" />
                      Entwürfe
                    </div>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{draftTenders.length}</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 min-w-0">
              {/* ACTIVE TENDERS TAB */}
              <TabsContent value="active" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                {activeTenders.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="Noch keine aktiven Ausschreibungen"
                    description="Sobald Sie eine Ausschreibung veröffentlicht haben, erscheint sie hier."
                    cta={
                      <Link href="/dashboard/ausschreibung/neu">
                        <Button className="rounded-xl bg-navy-900 text-white hover:bg-navy-950 font-bold h-12 px-8">
                          <Plus size={16} className="mr-2" /> Erste Ausschreibung erstellen
                        </Button>
                      </Link>
                    }
                  />
                ) : activeTenders.map(tender => {
                  const vehicle = tender.tender_vehicles?.[0];
                  return (
                    <Card key={tender.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden transition-all duration-300">
                      {/* Tender Header */}
                      <div 
                        className={`p-6 md:p-8 cursor-pointer transition-colors ${expandedTender === tender.id ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50/50'}`}
                        onClick={() => setExpandedTender(expandedTender === tender.id ? null : tender.id)}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm text-navy-800">
                              <Building2 size={28} />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <Badge variant="outline" className="text-slate-500 bg-white font-mono text-xs">{tender.id.split('-')[0].toUpperCase()}</Badge>
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3">Aktiv</Badge>
                                {tender.offers.length > 0 ? (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 font-bold">{tender.offers.length} Angebot{tender.offers.length > 1 ? 'e' : ''}</Badge>
                                ) : (
                                  <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-none px-3">Warten auf Angebote</Badge>
                                )}
                              </div>
                              <h3 className="text-2xl font-bold text-navy-950">{vehicle?.brand || 'Fahrzeug'} {vehicle?.model_name || ''}</h3>
                              <p className="text-sm text-slate-500 font-medium mt-1">
                                Erstellt: {createdAgo(tender.created_at)} · Menge: <span className="text-navy-900 font-bold">{vehicle?.quantity ?? 1}x</span>
                                {vehicle?.list_price_gross && <> · Listenpreis: <span className="text-navy-900 font-bold">{vehicle.list_price_gross.toLocaleString('de-DE')} €</span></>}
                                {tender.offers.length > 0 && (() => {
                                  const bestPrice = Math.min(...tender.offers.filter(o => o.total_price).map(o => o.total_price!));
                                  const listPrice = vehicle?.list_price_gross || 0;
                                  const savings = listPrice > 0 ? ((1 - bestPrice / listPrice) * 100).toFixed(1) : null;
                                  return <> · Bester Preis: <span className="text-green-600 font-bold">{bestPrice.toLocaleString('de-DE')} €</span>{savings && <span className="text-green-600 font-bold"> (-{savings}%)</span>}</>;
                                })()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                              <div className="text-sm font-semibold text-slate-500 mb-1">Endet in</div>
                              <div className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
                                <Clock size={16} /> {timeLeft(tender.end_at)}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-navy-900 h-10 w-10 shrink-0">
                              {expandedTender === tender.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded: offers or empty state */}
                      {expandedTender === tender.id && (
                        <div className="bg-white p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
                          {tender.offers.length > 0 ? (
                            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200">
                                  <tr>
                                    <th className="px-6 py-4">#</th>
                                    <th className="px-6 py-4">Barpreis (Brutto)</th>
                                    <th className="px-6 py-4">Leasing p.M.</th>
                                    <th className="px-6 py-4">Gesamtpreis</th>
                                    <th className="px-6 py-4">Datum</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {[...tender.offers]
                                    .sort((a, b) => (a.total_price || Infinity) - (b.total_price || Infinity))
                                    .map((offer, i) => (
                                    <tr key={offer.id} className={`hover:bg-slate-50 transition-colors ${i === 0 ? 'bg-green-50/30' : ''}`}>
                                      <td className="px-6 py-5 font-bold text-slate-500">{i + 1}</td>
                                      <td className="px-6 py-5 font-bold text-navy-950 text-lg">
                                        {offer.purchase_price ? `${offer.purchase_price.toLocaleString('de-DE')} €` : '—'}
                                      </td>
                                      <td className="px-6 py-5 font-semibold text-slate-700">
                                        {offer.lease_rate ? `${offer.lease_rate.toLocaleString('de-DE')} €` : <span className="text-slate-300">K.A.</span>}
                                      </td>
                                      <td className="px-6 py-5 font-bold text-navy-950">
                                        {offer.total_price ? `${offer.total_price.toLocaleString('de-DE')} €` : '—'}
                                      </td>
                                      <td className="px-6 py-5 text-slate-500 text-xs">{formatDate(offer.created_at)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                              <Clock size={48} className="mb-4 opacity-20" />
                              <h4 className="text-lg font-bold text-navy-950 mb-2">Noch keine Angebote</h4>
                              <p className="max-w-md">Die Ausschreibung läuft noch. Wir benachrichtigen Sie per E-Mail, sobald die ersten Händler Angebote abgeben.</p>
                              <p className="text-xs text-slate-400 mt-2">Endet am {formatDate(tender.end_at)}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </TabsContent>

              {/* COMPLETED TENDERS TAB */}
              <TabsContent value="completed" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                {completedTenders.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
                    title="Noch keine abgeschlossenen Ausschreibungen"
                    description="Abgeschlossene Ausschreibungen mit ausgewählten Händlerangeboten erscheinen hier."
                  />
                ) : completedTenders.map(tender => {
                  const vehicle = tender.tender_vehicles?.[0];
                  return (
                    <Card key={tender.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden p-6 md:p-8">
                      <Badge variant="outline" className="mb-3 font-mono text-slate-500 bg-slate-50 text-xs">{tender.id.split('-')[0].toUpperCase()}</Badge>
                      <h3 className="text-2xl font-bold text-navy-950 mb-1">{vehicle?.brand || '—'} {vehicle?.model_name || ''}</h3>
                      <p className="text-sm font-medium text-slate-500">Abgeschlossen am: {formatDate(tender.end_at)}</p>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* DRAFTS TAB */}
              <TabsContent value="drafts" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                {draftTenders.length === 0 ? (
                  <EmptyState
                    icon={FileEdit}
                    title="Keine gespeicherten Entwürfe"
                    description="Wenn Sie einen Wizard zwischenspeichern, erscheint er hier."
                  />
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {draftTenders.map(draft => {
                      const vehicle = draft.tender_vehicles?.[0];
                      return (
                        <Card key={draft.id} className="border-slate-200 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                          <div className="mb-8">
                            <div className="flex justify-between items-start mb-4">
                              <Badge variant="outline" className="font-mono text-slate-500 bg-slate-50 text-xs">{draft.id.split('-')[0].toUpperCase()}</Badge>
                              <Badge className="bg-amber-100 text-amber-700 border-none">Entwurf</Badge>
                            </div>
                            <h3 className="text-2xl font-bold text-navy-950 mb-2">{vehicle?.brand || '—'} {vehicle?.model_name || ''}</h3>
                            <p className="text-sm font-medium text-slate-500">Zuletzt gespeichert: {createdAgo(draft.created_at)}</p>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-auto">
                            <Button variant="outline" className="rounded-xl shadow-sm text-slate-600 hover:text-navy-900 border-slate-300">
                              <Pencil size={16} className="mr-2" /> Bearbeiten
                            </Button>
                            <Button className="rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold">
                              <Globe size={16} className="mr-2" /> Veröffentlichen
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
}

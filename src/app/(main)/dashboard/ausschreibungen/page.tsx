"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock, ChevronDown, ChevronUp, CheckCircle2, FileEdit, Loader2, Plus,
  MoreHorizontal, Pencil, Trash2, AlertTriangle, Globe, XCircle, Building2,
  MessageCircle, ShieldAlert, Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import { StatusTracker } from "@/components/chat/StatusTracker";
import { toast } from "sonner";
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
  dealer_id: string;
  total_price: number | null;
  purchase_price: number | null;
  lease_rate: number | null;
  created_at: string;
};

type Contact = {
  id: string;
  tender_id: string;
  offer_id: string;
  buyer_id: string;
  dealer_id: string;
  status: string;
  dealer_responded: boolean;
  contract_concluded: boolean | null;
  created_at: string;
};

type DealerProfile = {
  id: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
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
function EmptyState({ icon: Icon, title, description, cta }: { icon: any; title: string; description: string; cta?: React.ReactNode }) {
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

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  title, description, confirmLabel, confirmClass, icon, onConfirm, onCancel, loading,
}: {
  title: string; description: string; confirmLabel: string; confirmClass?: string;
  icon?: React.ReactNode; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4 mb-6">
          {icon || (
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-navy-950 mb-1">{title}</h3>
            <p className="text-slate-500 text-sm">{description}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading} className="flex-1 rounded-xl h-12">
            Abbrechen
          </Button>
          <Button onClick={onConfirm} disabled={loading} className={`flex-1 rounded-xl h-12 text-white font-bold ${confirmClass ?? "bg-red-600 hover:bg-red-700"}`}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyTendersPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!authLoading && profile && profile.role !== "nachfrager") {
      router.replace("/dashboard");
    }
  }, [authLoading, profile]);

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dealerProfiles, setDealerProfiles] = useState<Record<string, DealerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedTender, setExpandedTender] = useState<string | null>(null);

  // Action states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);
  const [contactConfirmOffer, setContactConfirmOffer] = useState<{ tenderId: string; offer: Offer } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);



  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    const run = async () => {
      try {
        const [tendersResult, contactsResult] = await Promise.all([
          Promise.race([
            supabase
              .from("tenders")
              .select("*, tender_vehicles(*), offers(id, dealer_id, total_price, purchase_price, lease_rate, created_at)")
              .eq("buyer_id", user.id)
              .order("created_at", { ascending: false }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("TIMEOUT")), 10000)
            ),
          ]),
          supabase.from("contacts").select("*").eq("buyer_id", user.id),
        ]);

        if (cancelled) return;
        const { data, error } = tendersResult as any;
        const { data: contactsData } = contactsResult as any;

        if (error) {
          setFetchError(error.message);
        } else if (data) {
          setTenders(data as Tender[]);
          if (data.length > 0) setExpandedTender(data[0].id);

          const loadedContacts = (contactsData || []) as Contact[];
          setContacts(loadedContacts);

          // Load dealer profiles for all contacted dealers
          const dealerIds = Array.from(new Set(loadedContacts.map((c) => c.dealer_id)));
          if (dealerIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, company_name, first_name, last_name, phone, city")
              .in("id", dealerIds);
            if (profiles) {
              const map: Record<string, DealerProfile> = {};
              profiles.forEach((p: DealerProfile) => { map[p.id] = p; });
              setDealerProfiles(map);
            }
          }
        }
      } catch (err: any) {
        if (cancelled) return;
        const isTimeout = err?.message === "TIMEOUT";
        setFetchError(
          isTimeout
            ? "Daten konnten nicht geladen werden. Bitte Seite neu laden."
            : err?.message || "Unbekannter Fehler"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [authLoading, user?.id]);

  const loadTenders = () => window.location.reload();

  // Contact creation
  const handleCreateContact = async () => {
    if (!contactConfirmOffer || !user) return;
    setActionLoading(true);
    const { tenderId, offer } = contactConfirmOffer;

    const { data, error } = await supabase.from("contacts").insert({
      tender_id: tenderId,
      offer_id: offer.id,
      buyer_id: user.id,
      dealer_id: offer.dealer_id,
    }).select().single();

    if (error) {
      toast.error("Fehler: " + error.message);
    } else if (data) {
      const newContact = data as Contact;
      setContacts((prev) => [...prev, newContact]);

      // Load dealer profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, company_name, first_name, last_name, phone, city")
        .eq("id", offer.dealer_id)
        .single();
      if (prof) {
        setDealerProfiles((prev) => ({ ...prev, [prof.id]: prof as DealerProfile }));
      }

      toast.success("Kontakt erfolgreich aufgenommen!");
    }
    setActionLoading(false);
    setContactConfirmOffer(null);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await supabase.from("tender_vehicles").delete().eq("tender_id", id);
      await supabase.from("tenders").delete().eq("id", id);
      setTenders(prev => prev.filter(t => t.id !== id));
    } finally {
      setActionLoading(false);
      setConfirmDeleteId(null);
    }
  };

  const handleWithdraw = async (id: string) => {
    setActionLoading(true);
    try {
      await supabase.from("tenders").update({ status: "cancelled" }).eq("id", id);
      setTenders(prev => prev.map(t => t.id === id ? { ...t, status: "cancelled" } : t));
    } finally {
      setActionLoading(false);
      setConfirmWithdrawId(null);
    }
  };

  const activeTenders = tenders.filter(t => t.status === "active");
  const completedTenders = tenders.filter(t => t.status === "completed" || t.status === "cancelled");
  const draftTenders = tenders.filter(t => t.status === "draft");

  // Helper: get contact for an offer
  const getContactForOffer = (offerId: string) => contacts.find((c) => c.offer_id === offerId);

  // Render three-dot menu for a tender
  const TenderMenu = ({ tender }: { tender: Tender }) => {
    const hasOffers = tender.offers.length > 0;
    const canEdit = (tender.status === "draft" || tender.status === "active") && !hasOffers;
    const canDelete = !hasOffers;
    const canWithdraw = hasOffers && tender.status === "active";

    if (!canEdit && !canDelete && !canWithdraw) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-full h-9 w-9 flex items-center justify-center text-slate-400 hover:text-navy-900 hover:bg-slate-100 shrink-0 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <MoreHorizontal size={18} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl shadow-xl border-slate-200 p-1.5 min-w-[180px]">
          {canEdit && (
            <DropdownMenuItem
              className="rounded-xl px-4 py-3 font-semibold text-navy-900 cursor-pointer"
              onClick={e => { e.stopPropagation(); router.push(`/dashboard/ausschreibung/${tender.id}/bearbeiten`); }}
            >
              <Pencil size={16} className="mr-2 text-blue-500" /> Bearbeiten
            </DropdownMenuItem>
          )}
          {canWithdraw && (
            <DropdownMenuItem
              className="rounded-xl px-4 py-3 font-semibold text-amber-700 cursor-pointer"
              onClick={e => { e.stopPropagation(); setConfirmWithdrawId(tender.id); }}
            >
              <XCircle size={16} className="mr-2 text-amber-500" /> Zurückziehen
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              className="rounded-xl px-4 py-3 font-semibold text-red-600 cursor-pointer"
              onClick={e => { e.stopPropagation(); setConfirmDeleteId(tender.id); }}
            >
              <Trash2 size={16} className="mr-2" /> Löschen
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Render offer rows with contact functionality
  const renderOffersTable = (tender: Tender) => {
    if (tender.offers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
          <Clock size={48} className="mb-4 opacity-20" />
          <h4 className="text-lg font-bold text-navy-950 mb-2">Noch keine Angebote</h4>
          <p className="max-w-md">Die Ausschreibung läuft noch. Wir benachrichtigen Sie per E-Mail, sobald die ersten Händler Angebote abgeben.</p>
          <p className="text-xs text-slate-400 mt-2">Endet am {formatDate(tender.end_at)}</p>
        </div>
      );
    }

    // Assign stable anonymous IDs based on submission order
    const bySubmission = [...tender.offers].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const anonId = new Map(bySubmission.map((o, i) => [o.id, i + 1]));

    // Display sorted by purchase_price ascending (best first)
    const sorted = [...tender.offers].sort((a, b) => (a.purchase_price ?? Infinity) - (b.purchase_price ?? Infinity));

    return (
      <div className="space-y-4">
        {sorted.map((offer, i) => {
          const contact = getContactForOffer(offer.id);
          const dealerProfile = contact ? dealerProfiles[contact.dealer_id] : null;
          const anonNum = anonId.get(offer.id) ?? 0;
          const isRevealed = !!contact;

          return (
            <div key={offer.id} className={`border rounded-2xl overflow-hidden ${i === 0 ? "border-green-200 bg-green-50/30" : "border-slate-200 bg-white"}`}>
              {/* Offer header row */}
              <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    isRevealed ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {isRevealed ? (dealerProfile?.company_name?.[0] || "H") : `#${anonNum}`}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-navy-950">
                        {isRevealed
                          ? dealerProfile?.company_name || "Händler"
                          : `Anbieter #${anonNum}`
                        }
                      </span>
                      {i === 0 && <Badge className="bg-green-100 text-green-700 border-none text-xs">Bester Preis</Badge>}
                      {isRevealed && (
                        <Badge className="bg-blue-50 text-blue-600 border border-blue-200 text-xs">Kontakt aktiv</Badge>
                      )}
                    </div>
                    {isRevealed && dealerProfile && (
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        {dealerProfile.first_name && (
                          <span>{dealerProfile.first_name} {dealerProfile.last_name}</span>
                        )}
                        {dealerProfile.phone && (
                          <span className="flex items-center gap-1"><Phone size={10} /> {dealerProfile.phone}</span>
                        )}
                        {dealerProfile.city && (
                          <span>{dealerProfile.city}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Kaufpreis</div>
                    <div className="font-bold text-navy-950 text-lg">
                      {offer.purchase_price ? `${offer.purchase_price.toLocaleString("de-DE")} €` : "—"}
                    </div>
                  </div>
                  {offer.lease_rate && (
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Leasing</div>
                      <div className="font-semibold text-slate-700">{offer.lease_rate.toLocaleString("de-DE")} €</div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Gesamt</div>
                    <div className="font-bold text-navy-950">
                      {offer.total_price ? `${offer.total_price.toLocaleString("de-DE")} €` : "—"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Datum</div>
                    <div className="text-slate-500 text-xs">{formatDate(offer.created_at)}</div>
                  </div>
                </div>
              </div>

              {/* Contact/Chat actions */}
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                {!isRevealed ? (
                  <Button
                    size="sm"
                    onClick={() => setContactConfirmOffer({ tenderId: tender.id, offer })}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-9 px-4"
                  >
                    <MessageCircle size={14} className="mr-1.5" /> Kontakt aufnehmen
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/nachrichten?contact=${contact!.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold h-9 px-4"
                      >
                        <MessageCircle size={14} className="mr-1.5" /> Chat öffnen
                      </Button>
                    </Link>
                  </div>
                )}
                <span className="text-[10px] text-slate-400">{isRevealed ? `Kontakt seit ${formatDate(contact!.created_at)}` : "Identität noch verborgen"}</span>
              </div>

              {/* Status tracker for contacted offers */}
              {isRevealed && contact && (
                <div className="px-6 py-4 border-t border-slate-100">
                  <StatusTracker
                    contact={contact}
                    currentUserId={user!.id}
                    onUpdate={(updated) => {
                      setContacts((prev) =>
                        prev.map((c) => c.id === contact.id ? { ...c, ...updated } : c)
                      );
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderActiveCard = (tender: Tender) => {
    const vehicle = tender.tender_vehicles?.[0];
    const bestPrice = tender.offers.length > 0
      ? Math.min(...tender.offers.filter(o => o.purchase_price).map(o => o.purchase_price!))
      : null;
    const savings = bestPrice && vehicle?.list_price_gross
      ? ((1 - bestPrice / vehicle.list_price_gross) * 100).toFixed(1)
      : null;

    return (
      <Card key={tender.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden transition-all duration-300">
        <div
          className={`p-6 md:p-8 cursor-pointer transition-colors ${expandedTender === tender.id ? "bg-slate-50 border-b border-slate-200" : "bg-white hover:bg-slate-50/50"}`}
          onClick={() => setExpandedTender(expandedTender === tender.id ? null : tender.id)}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm text-navy-800">
                <Building2 size={28} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <Badge variant="outline" className="text-slate-500 bg-white font-mono text-xs">{tender.id.split("-")[0].toUpperCase()}</Badge>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3">Aktiv</Badge>
                  {tender.offers.length > 0 ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 font-bold">
                      {tender.offers.length} Angebot{tender.offers.length > 1 ? "e" : ""}
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-none px-3">Warten auf Angebote</Badge>
                  )}
                  {contacts.filter(c => c.tender_id === tender.id).length > 0 && (
                    <Badge className="bg-purple-100 text-purple-700 border-none px-3">
                      {contacts.filter(c => c.tender_id === tender.id).length} Kontakt{contacts.filter(c => c.tender_id === tender.id).length > 1 ? "e" : ""}
                    </Badge>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-navy-950">{vehicle?.brand || "Fahrzeug"} {vehicle?.model_name || ""}</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Erstellt: {createdAgo(tender.created_at)} · Menge: <span className="text-navy-900 font-bold">{vehicle?.quantity ?? 1}x</span>
                  {vehicle?.list_price_gross && <> · Listenpreis: <span className="text-navy-900 font-bold">{vehicle.list_price_gross.toLocaleString("de-DE")} €</span></>}
                  {bestPrice && <> · Bester Preis: <span className="text-green-600 font-bold">{bestPrice.toLocaleString("de-DE")} €</span>{savings && <span className="text-green-600 font-bold"> (-{savings}%)</span>}</>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-500 mb-1">Endet in</div>
                <div className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
                  <Clock size={16} /> {timeLeft(tender.end_at)}
                </div>
              </div>
              <TenderMenu tender={tender} />
              <Button variant="ghost" size="icon" className="rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-navy-900 h-10 w-10 shrink-0">
                {expandedTender === tender.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {expandedTender === tender.id && (
          <div className="bg-white p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
            {renderOffersTable(tender)}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Confirm Dialogs */}
      {confirmDeleteId && (
        <ConfirmDialog
          title="Ausschreibung löschen?"
          description="Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden."
          confirmLabel="Endgültig löschen"
          confirmClass="bg-red-600 hover:bg-red-700"
          loading={actionLoading}
          onConfirm={() => handleDelete(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      {confirmWithdrawId && (
        <ConfirmDialog
          title="Ausschreibung zurückziehen?"
          description="Die Ausschreibung wird auf 'Zurückgezogen' gesetzt. Bestehende Angebote bleiben erhalten."
          confirmLabel="Zurückziehen"
          confirmClass="bg-amber-600 hover:bg-amber-700"
          loading={actionLoading}
          onConfirm={() => handleWithdraw(confirmWithdrawId)}
          onCancel={() => setConfirmWithdrawId(null)}
        />
      )}
      {contactConfirmOffer && (
        <ConfirmDialog
          title="Kontakt aufnehmen?"
          description="Achtung: Mit dem Kontaktklick wird Ihre Identität gegenüber diesem Anbieter offengelegt. Der Anbieter erhält Ihren Firmennamen und Ihre Kontaktdaten."
          confirmLabel="Ja, Kontakt aufnehmen"
          confirmClass="bg-blue-600 hover:bg-blue-700"
          icon={
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert className="text-blue-600" size={24} />
            </div>
          }
          loading={actionLoading}
          onConfirm={handleCreateContact}
          onCancel={() => setContactConfirmOffer(null)}
        />
      )}


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
              <Button variant="outline" className="rounded-xl border-red-200 text-red-700 hover:bg-red-100" onClick={() => loadTenders()}>
                Erneut versuchen
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Sidebar */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="sticky top-28">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Kategorien</h3>
                <TabsList className="flex flex-col h-auto bg-transparent w-full p-0 space-y-3">
                  <TabsTrigger value="active" className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-blue-500" />
                      Laufende
                    </div>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{activeTenders.length}</span>
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-green-500" />
                      Abgeschlossene
                    </div>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{completedTenders.length}</span>
                  </TabsTrigger>
                  <TabsTrigger value="drafts" className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold">
                    <div className="flex items-center gap-3">
                      <FileEdit size={20} className="text-amber-500" />
                      Entwürfe
                    </div>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{draftTenders.length}</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 min-w-0">
              {/* ACTIVE */}
              <TabsContent value="active" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                {activeTenders.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
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
                ) : (
                  activeTenders.map(renderActiveCard)
                )}
              </TabsContent>

              {/* COMPLETED */}
              <TabsContent value="completed" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                {completedTenders.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
                    title="Noch keine abgeschlossenen Ausschreibungen"
                    description="Abgeschlossene oder zurückgezogene Ausschreibungen erscheinen hier."
                  />
                ) : completedTenders.map(tender => {
                  const vehicle = tender.tender_vehicles?.[0];
                  return (
                    <Card key={tender.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden p-6 md:p-8">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="font-mono text-slate-500 bg-slate-50 text-xs">{tender.id.split("-")[0].toUpperCase()}</Badge>
                            <Badge className={tender.status === "cancelled" ? "bg-red-100 text-red-700 border-none" : "bg-green-100 text-green-700 border-none"}>
                              {tender.status === "cancelled" ? "Zurückgezogen" : "Abgeschlossen"}
                            </Badge>
                          </div>
                          <h3 className="text-2xl font-bold text-navy-950 mb-1">{vehicle?.brand || "—"} {vehicle?.model_name || ""}</h3>
                          <p className="text-sm font-medium text-slate-500">
                            {tender.status === "cancelled" ? "Zurückgezogen" : "Abgeschlossen"} am: {formatDate(tender.end_at)}
                          </p>
                        </div>
                        <TenderMenu tender={tender} />
                      </div>
                    </Card>
                  );
                })}
              </TabsContent>

              {/* DRAFTS */}
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
                              <Badge variant="outline" className="font-mono text-slate-500 bg-slate-50 text-xs">{draft.id.split("-")[0].toUpperCase()}</Badge>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-amber-100 text-amber-700 border-none">Entwurf</Badge>
                                <TenderMenu tender={draft} />
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold text-navy-950 mb-2">{vehicle?.brand || "—"} {vehicle?.model_name || ""}</h3>
                            <p className="text-sm font-medium text-slate-500">Zuletzt gespeichert: {createdAgo(draft.created_at)}</p>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-auto">
                            <Button
                              variant="outline"
                              className="rounded-xl shadow-sm text-slate-600 hover:text-navy-900 border-slate-300"
                              onClick={() => router.push(`/dashboard/ausschreibung/${draft.id}/bearbeiten`)}
                            >
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

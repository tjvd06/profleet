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
  MessageCircle, ShieldAlert, Phone, Mail, MapPin, Send, StopCircle, Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import { VehicleDetailSections } from "@/components/tenders/VehicleDetailSections";
import { ConfigFileDownload } from "@/components/tenders/ConfigFileDownload";
import { dbRowToVehicleConfig } from "@/types/vehicle";
import { toast } from "sonner";
import Link from "next/link";
import { ReviewStepper } from "@/components/ui-custom/ReviewStepper";
import { EndTenderWizard } from "@/components/ui-custom/EndTenderWizard";

type ReviewRow = {
  id: string;
  contact_id: string;
  from_user_id: string;
  to_user_id: string;
  type: "positive" | "neutral" | "negative";
  contract_concluded: boolean;
  comment: string | null;
};

// ─── Types ────────────────────────────────────────────────────────────────────
// Broad type – Supabase returns all tender_vehicles columns including equipment JSONB
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TenderVehicle = Record<string, any>;

type Offer = {
  id: string;
  dealer_id: string;
  tender_vehicle_id: string | null;
  total_price: number | null;
  purchase_price: number | null;
  lease_rate: number | null;
  transfer_cost: number | null;
  registration_cost: number | null;
  offered_quantity: number | null;
  delivery_plz: string | null;
  delivery_city: string | null;
  delivery_date: string | null;
  deviation_type: string | null;
  deviation_details: { description?: string } | null;
  offer_details: {
    exactMatch?: boolean;
    dayRegistration?: boolean;
    dayRegistrationDate?: string | null;
    dayRegistrationKm?: string | null;
    listPriceNetConfirm?: number | null;
    hasFleetContract?: boolean;
    fleetContractDiscount?: number | null;
    hasSpecialAgreement?: boolean;
    specialAgreementDiscount?: number | null;
    leasingDuration?: string;
    leasingKmYear?: string;
    leasingDownPayment?: string;
    financingRate?: number | null;
    financingDuration?: string;
    financingDownPayment?: string;
    financingResidual?: string;
  } | null;
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
  dealer_type: string | null;
  zip: string | null;
  city: string | null;
  phone: string | null;
  email_public: string | null;
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

/** Count unique dealers who submitted offers on a tender */
function uniqueDealerCount(offers: Offer[]): number {
  return new Set(offers.map((o) => o.dealer_id)).size;
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

// ─── Offer Row with expandable details ────────────────────────────────────────
function OfferRow({ offer, offerIdx, isMultiVehicle, vehicleLabel, vehicle, d, hasExtras, hasLeasing, hasFinancing, hasCosts, hasDelivery, hasDiscounts, hasDayReg, formatDate }: {
  offer: Offer; offerIdx: number; isMultiVehicle: boolean; vehicleLabel: string;
  vehicle: any; d: Offer["offer_details"]; hasExtras: boolean;
  hasLeasing: boolean; hasFinancing: boolean; hasCosts: boolean;
  hasDelivery: boolean; hasDiscounts: boolean; hasDayReg: boolean;
  formatDate: (s: string | null) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-5 py-3 border-t border-slate-100">
      {/* Vehicle label + key price in one row */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {isMultiVehicle && <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">{offerIdx + 1}</div>}
          <span className="font-bold text-navy-950 text-sm truncate">{vehicleLabel || `Fahrzeug ${offerIdx + 1}`}</span>
          {vehicle && <span className="text-[10px] text-slate-400 shrink-0">{(vehicle as any).quantity || 1}x</span>}
        </div>
        <div className="text-right shrink-0">
          <span className="font-bold text-navy-950">{offer.purchase_price ? `${offer.purchase_price.toLocaleString("de-DE")} €` : "—"}</span>
          <span className="text-[10px] text-slate-400 ml-1">Kaufpreis</span>
        </div>
      </div>

      {/* Compact detail chips */}
      <div className="flex flex-wrap gap-1.5">
        {offer.total_price && offer.total_price !== offer.purchase_price && (
          <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500">Abholpreis: {offer.total_price.toLocaleString("de-DE")} €</Badge>
        )}
        {offer.lease_rate && <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500">Leasing: {offer.lease_rate.toLocaleString("de-DE")} €/Mon.</Badge>}
        {d?.financingRate && <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500">Finanz.: {d.financingRate.toLocaleString("de-DE")} €/Mon.</Badge>}
        {d?.exactMatch ? (
          <Badge className="bg-green-50 text-green-700 border border-green-100 text-[10px]"><CheckCircle2 size={10} className="mr-0.5" /> Exakt</Badge>
        ) : (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px]">Alternativ</Badge>
        )}
        {d?.dayRegistration && <Badge className="bg-slate-100 text-slate-500 border-none text-[10px]">Tageszulassung</Badge>}
        {offer.delivery_date && <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500">Lieferung: {formatDate(offer.delivery_date)}</Badge>}
        {(offer as any).config_file_path && <ConfigFileDownload filePath={(offer as any).config_file_path} label="Konfig-PDF" />}
      </div>

      {/* Deviation — only if present */}
      {offer.deviation_type && offer.deviation_details?.description && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2 border border-amber-100">{offer.deviation_details.description}</p>
      )}

      {/* Expandable details */}
      {hasExtras && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Weniger anzeigen" : "Alle Details anzeigen"}
          </button>

          {expanded && (
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">

              {/* Kosten */}
              {(hasCosts || offer.total_price) && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kosten</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                    {offer.purchase_price && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Kaufpreis netto</span>
                        <span className="font-semibold text-navy-950">{offer.purchase_price.toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                    {offer.transfer_cost != null && offer.transfer_cost > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Überführung</span>
                        <span className="font-semibold text-navy-950">{offer.transfer_cost.toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                    {offer.registration_cost != null && offer.registration_cost > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Zulassung</span>
                        <span className="font-semibold text-navy-950">{offer.registration_cost.toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                    {offer.total_price && (
                      <div className="flex justify-between text-xs col-span-full pt-1 border-t border-slate-200 mt-1">
                        <span className="text-slate-500 font-semibold">Abholpreis netto</span>
                        <span className="font-bold text-navy-950">{offer.total_price.toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Leasing */}
              {hasLeasing && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Leasing</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                    {offer.lease_rate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Rate / Monat netto</span>
                        <span className="font-semibold text-navy-950">{offer.lease_rate.toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                    {d?.leasingDuration && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Laufzeit</span>
                        <span className="font-semibold text-navy-950">{d.leasingDuration} Monate</span>
                      </div>
                    )}
                    {d?.leasingKmYear && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">km / Jahr</span>
                        <span className="font-semibold text-navy-950">{Number(d.leasingKmYear).toLocaleString("de-DE")} km</span>
                      </div>
                    )}
                    {d?.leasingDownPayment != null && d.leasingDownPayment !== "" && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Anzahlung netto</span>
                        <span className="font-semibold text-navy-950">{Number(d.leasingDownPayment).toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Finanzierung */}
              {hasFinancing && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Finanzierung</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                    {d?.financingRate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Rate / Monat</span>
                        <span className="font-semibold text-navy-950">{d.financingRate.toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                    {d?.financingDuration && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Laufzeit</span>
                        <span className="font-semibold text-navy-950">{d.financingDuration} Monate</span>
                      </div>
                    )}
                    {d?.financingDownPayment != null && d.financingDownPayment !== "" && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Anzahlung</span>
                        <span className="font-semibold text-navy-950">{Number(d.financingDownPayment).toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                    {d?.financingResidual != null && d.financingResidual !== "" && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Restwert</span>
                        <span className="font-semibold text-navy-950">{Number(d.financingResidual).toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lieferung */}
              {hasDelivery && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lieferung</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                    {(offer.delivery_plz || offer.delivery_city) && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Abholort</span>
                        <span className="font-semibold text-navy-950">{offer.delivery_plz || ""} {offer.delivery_city || ""}</span>
                      </div>
                    )}
                    {offer.delivery_date && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Liefertermin</span>
                        <span className="font-semibold text-navy-950">{formatDate(offer.delivery_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rabatte */}
              {hasDiscounts && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Rabatte</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                    {d?.hasFleetContract && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Großkundenrabatt</span>
                        <span className="font-semibold text-green-700">{d.fleetContractDiscount ? `${d.fleetContractDiscount}%` : "Ja"}</span>
                      </div>
                    )}
                    {d?.hasSpecialAgreement && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Sondervereinbarung</span>
                        <span className="font-semibold text-green-700">{d.specialAgreementDiscount ? `${d.specialAgreementDiscount}%` : "Ja"}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tageszulassung */}
              {hasDayReg && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tageszulassung</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
                    {d?.dayRegistrationDate && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Datum</span>
                        <span className="font-semibold text-navy-950">{formatDate(d.dayRegistrationDate)}</span>
                      </div>
                    )}
                    {d?.dayRegistrationKm && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">km-Stand</span>
                        <span className="font-semibold text-navy-950">{Number(d.dayRegistrationKm).toLocaleString("de-DE")} km</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* UVP Bestätigung */}
              {d?.listPriceNetConfirm && (
                <div className="flex justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-500">UVP netto (Händler bestätigt)</span>
                  <span className="font-semibold text-navy-950">{d.listPriceNetConfirm.toLocaleString("de-DE")} €</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
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

  const [reviews, setReviews] = useState<ReviewRow[]>([]);

  // Action states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmWithdrawId, setConfirmWithdrawId] = useState<string | null>(null);
  const [endTenderWizard, setEndTenderWizard] = useState<Tender | null>(null);
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
        const [tendersResult, contactsResult, reviewsResult] = await Promise.all([
          Promise.race([
            supabase
              .from("tenders")
              .select("*, tender_vehicles(*), offers(*)")
              .eq("buyer_id", user.id)
              .order("created_at", { ascending: false }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("TIMEOUT")), 10000)
            ),
          ]),
          supabase.from("contacts").select("*").eq("buyer_id", user.id),
          supabase.from("reviews").select("*").eq("from_user_id", user.id),
        ]);

        if (cancelled) return;
        const { data, error } = tendersResult as any;
        const { data: contactsData } = contactsResult as any;
        const { data: reviewsData } = reviewsResult as any;

        if (error) {
          setFetchError(error.message);
        } else if (data) {
          setTenders(data as Tender[]);
          if (data.length > 0) setExpandedTender(data[0].id);

          const loadedContacts = (contactsData || []) as Contact[];
          setContacts(loadedContacts);
          setReviews((reviewsData || []) as ReviewRow[]);

          // Load dealer profiles for ALL dealers who submitted offers (full transparency)
          const allDealerIds = Array.from(new Set([
            ...loadedContacts.map((c) => c.dealer_id),
            ...(data as Tender[]).flatMap((t) => t.offers.map((o) => o.dealer_id)),
          ]));
          if (allDealerIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, company_name, first_name, last_name, dealer_type, zip, city, phone, email_public")
              .in("id", allDealerIds);
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
        .select("id, company_name, first_name, last_name, dealer_type, zip, city, phone, email_public")
        .eq("id", offer.dealer_id)
        .single();
      if (prof) {
        setDealerProfiles((prev) => ({ ...prev, [prof.id]: prof as DealerProfile }));
      }

      router.push(`/dashboard/nachrichten?contact=${newContact.id}`);
      return;
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

  const handleEndTender = async (id: string) => {
    await supabase.from("tenders").update({ status: "completed" }).eq("id", id);
    setTenders(prev => prev.map(t => t.id === id ? { ...t, status: "completed" } : t));
  };

  const handleSubmitReview = async (contactId: string, type: "positive" | "neutral" | "negative", contractConcluded: boolean, comment: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact || !user) return;
    const { data, error } = await supabase.from("reviews").insert({
      tender_id: contact.tender_id,
      contact_id: contactId,
      from_user_id: user.id,
      to_user_id: contact.dealer_id,
      type,
      contract_concluded: contractConcluded,
      comment: comment || null,
    }).select().single();
    if (error) {
      toast.error("Fehler: " + error.message);
    } else if (data) {
      setReviews(prev => [...prev, data as ReviewRow]);
      toast.success("Bewertung abgegeben!");
    }
  };

  const handleUpdateReview = async (reviewId: string, type: "positive" | "neutral" | "negative", contractConcluded: boolean, comment: string) => {
    const { error } = await supabase.from("reviews").update({ type, contract_concluded: contractConcluded, comment: comment || null }).eq("id", reviewId);
    if (error) {
      toast.error("Fehler: " + error.message);
    } else {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, type, contract_concluded: contractConcluded, comment: comment || null } : r));
      toast.success("Bewertung aktualisiert!");
    }
  };

  const activeTenders = tenders.filter(t => t.status === "active");
  const completedTenders = tenders.filter(t => t.status === "completed" || t.status === "cancelled");
  const draftTenders = tenders.filter(t => t.status === "draft");

  // Helper: get contact for a dealer on a tender (contact is per-dealer, not per-vehicle-offer)
  const getContactForDealer = (tenderId: string, dealerId: string) =>
    contacts.find((c) => c.tender_id === tenderId && c.dealer_id === dealerId);
  // Kept for backward compat with single-vehicle contacts linked by offer_id
  const getContactForOffer = (offerId: string) => contacts.find((c) => c.offer_id === offerId);

  // Render three-dot menu for a tender
  const TenderMenu = ({ tender }: { tender: Tender }) => {
    const hasOffers = tender.offers.length > 0;
    const canEdit = (tender.status === "draft" || tender.status === "active") && !hasOffers;
    const canDelete = !hasOffers;
    const canWithdraw = hasOffers && tender.status === "active";
    const canEnd = tender.status === "active";

    if (!canEdit && !canDelete && !canWithdraw && !canEnd) return null;

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
          {canEnd && (
            <DropdownMenuItem
              className="rounded-xl px-4 py-3 font-semibold text-green-700 cursor-pointer"
              onClick={e => { e.stopPropagation(); setEndTenderWizard(tender); }}
            >
              <StopCircle size={16} className="mr-2 text-green-500" /> Ausschreibung beenden
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

  // Render offer rows grouped by dealer
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

    // Group offers by dealer_id
    const dealerGroups: Record<string, Offer[]> = {};
    tender.offers.forEach((offer) => {
      if (!dealerGroups[offer.dealer_id]) dealerGroups[offer.dealer_id] = [];
      dealerGroups[offer.dealer_id].push(offer);
    });

    // Sort dealer groups by their total price (sum of all vehicle offers) ascending
    const sortedDealerIds = Object.keys(dealerGroups).sort((a, b) => {
      const totalA = dealerGroups[a].reduce((s, o) => s + (o.total_price ?? 0), 0);
      const totalB = dealerGroups[b].reduce((s, o) => s + (o.total_price ?? 0), 0);
      return totalA - totalB;
    });

    const isMultiVehicle = tender.tender_vehicles.length > 1;

    return (
      <div className="space-y-4">
        {sortedDealerIds.map((dealerId, groupIndex) => {
          const dealerOffers = dealerGroups[dealerId];
          const dealerProfile = dealerProfiles[dealerId] || null;
          const contact = getContactForDealer(tender.id, dealerId) || dealerOffers.map(o => getContactForOffer(o.id)).find(Boolean);
          const hasContact = !!contact;
          const grandTotal = dealerOffers.reduce((s, o) => s + (o.total_price ?? 0), 0);
          const firstOffer = dealerOffers[0];
          const getVehicleForOffer = (offer: Offer) =>
            tender.tender_vehicles.find((v: TenderVehicle) => v.id === offer.tender_vehicle_id);

          return (
            <div key={dealerId} className={`border rounded-2xl overflow-hidden ${groupIndex === 0 ? "border-green-200 bg-green-50/20" : "border-slate-200 bg-white"}`}>
              {/* Dealer header — compact, only company name + location */}
              <div className="px-5 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-blue-100 text-blue-700">
                    {(dealerProfile?.company_name?.[0] || "H")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-navy-950 text-sm">{dealerProfile?.company_name || "Händler"}</span>
                      {dealerProfile?.dealer_type && <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400">{dealerProfile.dealer_type}</Badge>}
                      {groupIndex === 0 && <Badge className="bg-green-100 text-green-700 border-none text-[10px]">Bester Preis</Badge>}
                    </div>
                    {dealerProfile?.city && (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                        <MapPin size={10} /> {dealerProfile.zip || ""} {dealerProfile.city}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {/* Show grand total prominently */}
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{isMultiVehicle ? "Gesamt netto" : "Abholpreis netto"}</div>
                    <div className="font-black text-blue-700">{grandTotal.toLocaleString("de-DE")} €</div>
                  </div>
                </div>
              </div>

              {/* Contact info — only shown after contact is established */}
              {hasContact && dealerProfile && (dealerProfile.email_public || dealerProfile.phone) && (
                <div className="px-5 py-2 border-t border-slate-100 bg-blue-50/30 flex items-center gap-4 text-xs">
                  {dealerProfile.email_public && <a href={`mailto:${dealerProfile.email_public}`} className="flex items-center gap-1 text-blue-600"><Mail size={10} /> {dealerProfile.email_public}</a>}
                  {dealerProfile.phone && <a href={`tel:${dealerProfile.phone}`} className="flex items-center gap-1 text-blue-600"><Phone size={10} /> {dealerProfile.phone}</a>}
                </div>
              )}

              {/* Compact per-vehicle price rows */}
              {dealerOffers.map((offer, offerIdx) => {
                const vehicle = getVehicleForOffer(offer);
                const d = offer.offer_details;
                const vehicleLabel = vehicle ? `${(vehicle as any).brand || ""} ${(vehicle as any).model_name || ""}`.trim() : "";

                const hasLeasing = !!(offer.lease_rate);
                const hasFinancing = !!(d?.financingRate);
                const hasCosts = !!((offer.transfer_cost && offer.transfer_cost > 0) || (offer.registration_cost && offer.registration_cost > 0));
                const hasDelivery = !!(offer.delivery_plz || offer.delivery_city || offer.delivery_date);
                const hasDiscounts = !!(d?.hasFleetContract || d?.hasSpecialAgreement);
                const hasDayReg = !!(d?.dayRegistration && (d?.dayRegistrationDate || d?.dayRegistrationKm));
                const hasExtras = hasLeasing || hasFinancing || hasCosts || hasDelivery || hasDiscounts || hasDayReg;

                return (
                  <OfferRow
                    key={offer.id}
                    offer={offer}
                    offerIdx={offerIdx}
                    isMultiVehicle={isMultiVehicle}
                    vehicleLabel={vehicleLabel}
                    vehicle={vehicle}
                    d={d}
                    hasExtras={hasExtras}
                    hasLeasing={hasLeasing}
                    hasFinancing={hasFinancing}
                    hasCosts={hasCosts}
                    hasDelivery={hasDelivery}
                    hasDiscounts={hasDiscounts}
                    hasDayReg={hasDayReg}
                    formatDate={formatDate}
                  />
                );
              })}

              {/* Action bar */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                {!hasContact ? (
                  <Button size="sm" onClick={() => setContactConfirmOffer({ tenderId: tender.id, offer: firstOffer })}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-4">
                    <Send size={12} className="mr-1.5" /> Kontakt aufnehmen
                  </Button>
                ) : (
                  <Link href={`/dashboard/nachrichten?contact=${contact!.id}`}>
                    <Button size="sm" variant="outline" className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold h-8 px-4">
                      <MessageCircle size={12} className="mr-1.5" /> Nachrichten öffnen
                    </Button>
                  </Link>
                )}
                <span className="text-[10px] text-slate-400">
                  {hasContact ? `Kontakt seit ${formatDate(contact!.created_at)}` : formatDate(firstOffer.created_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderActiveCard = (tender: Tender) => {
    const vehicles = tender.tender_vehicles || [];
    const vehicle = vehicles[0];
    const vehicleConfigs = vehicles.map((v: Record<string, unknown>) => dbRowToVehicleConfig(v));
    const totalQty = vehicles.reduce((s: number, v: TenderVehicle) => s + (v.quantity || 1), 0);
    const isMulti = vehicleConfigs.length > 1;
    // Best price: for multi-vehicle, use the lowest total per dealer; for single, use lowest purchase_price
    const bestPrice = (() => {
      if (tender.offers.length === 0) return null;
      if (isMulti) {
        // Group by dealer, sum total_price per dealer, take the min
        const dealerTotals: Record<string, number> = {};
        tender.offers.forEach(o => {
          dealerTotals[o.dealer_id] = (dealerTotals[o.dealer_id] || 0) + (o.total_price ?? 0);
        });
        const totals = Object.values(dealerTotals).filter(t => t > 0);
        return totals.length > 0 ? Math.min(...totals) : null;
      }
      const prices = tender.offers.filter(o => o.purchase_price).map(o => o.purchase_price!);
      return prices.length > 0 ? Math.min(...prices) : null;
    })();
    const savings = !isMulti && bestPrice && vehicle?.list_price_gross
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
                  {uniqueDealerCount(tender.offers) > 0 ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 font-bold">
                      {uniqueDealerCount(tender.offers)} Angebot{uniqueDealerCount(tender.offers) > 1 ? "e" : ""}
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
                <h3 className="text-2xl font-bold text-navy-950">
                  {isMulti
                    ? `${vehicleConfigs.length} Konfigurationen · ${totalQty} Fahrzeuge`
                    : `${vehicle?.brand || "Fahrzeug"} ${vehicle?.model_name || ""}`}
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Erstellt: {createdAgo(tender.created_at)}
                  {!isMulti && <> · Menge: <span className="text-navy-900 font-bold">{vehicle?.quantity ?? 1}x</span></>}
                  {!isMulti && vehicle?.list_price_gross && <> · Listenpreis: <span className="text-navy-900 font-bold">{vehicle.list_price_gross.toLocaleString("de-DE")} €</span></>}
                  {bestPrice && <> · {isMulti ? "Bestes Gesamtangebot" : "Bester Preis"}: <span className="text-green-600 font-bold">{bestPrice.toLocaleString("de-DE")} €</span>{savings && <span className="text-green-600 font-bold"> (-{savings}%)</span>}</>}
                </p>
                {isMulti && (
                  <p className="text-xs text-slate-400 mt-1">
                    {vehicleConfigs.map((c: any) => `${c.quantity}x ${c.brand || "—"} ${c.model || ""}`).join(" · ")}
                  </p>
                )}
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
            {/* Per-vehicle detail cards – same as DealerTenderCard */}
            <div className="space-y-4 mb-8">
              {vehicleConfigs.map((config: any, i: number) => {
                const raw = vehicles[i];
                return (
                  <div key={config.id || i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-navy-950 text-base">
                        {isMulti && <span className="text-blue-600 mr-1">Fahrzeug {i + 1}:</span>}
                        {config.brand || "—"} {config.model || ""} {raw?.trim_level || ""}
                        <span className="text-slate-500 font-normal ml-2">· {config.quantity} Stück</span>
                      </h3>
                      <div className="flex items-center gap-3 shrink-0">
                        {config.method === "upload" && raw?.config_file_path && (
                          <ConfigFileDownload filePath={raw.config_file_path} />
                        )}
                        {config.listPriceGross != null && (
                          <span className="text-sm font-bold text-navy-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                            {config.listPriceNet ? `${config.listPriceNet.toLocaleString("de-DE")} € netto` : "—"}
                          </span>
                        )}
                      </div>
                    </div>
                    <VehicleDetailSections vehicle={config} viewerRole="nachfrager" />
                  </div>
                );
              })}
            </div>

            {/* Summary row for multi-vehicle */}
            {isMulti && (
              <div className="flex items-center justify-between bg-navy-950 text-white px-5 py-3 rounded-xl mb-8 text-sm">
                <span className="font-bold">Gesamt: {totalQty} Fahrzeug{totalQty !== 1 ? "e" : ""}</span>
                <span className="font-bold text-amber-400">
                  Gesamt: {vehicles.reduce((s: number, v: TenderVehicle) => s + (v.quantity || 1), 0)} Fahrzeuge
                </span>
              </div>
            )}

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
      {endTenderWizard && (() => {
        const t = endTenderWizard;
        const tenderContacts = contacts.filter(c => c.tender_id === t.id);
        const wizardDealers = tenderContacts.map(c => {
          const dp = dealerProfiles[c.dealer_id];
          return {
            contactId: c.id,
            dealerId: c.dealer_id,
            companyName: dp?.company_name || "Händler",
            city: dp?.city,
          };
        });
        return (
          <EndTenderWizard
            tenderIdShort={t.id.split("-")[0].toUpperCase()}
            dealers={wizardDealers}
            onConfirmEnd={() => handleEndTender(t.id)}
            onSubmitReview={handleSubmitReview}
            onClose={() => setEndTenderWizard(null)}
          />
        );
      })()}
      {contactConfirmOffer && (
        <ConfirmDialog
          title="Kontakt aufnehmen?"
          description="Sie nehmen Kontakt mit diesem Händler auf. Die Ausschreibung läuft weiter."
          confirmLabel="Ja, Kontakt aufnehmen"
          confirmClass="bg-blue-600 hover:bg-blue-700"
          icon={
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
              <Send className="text-blue-600" size={24} />
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
                  const vehicles = tender.tender_vehicles || [];
                  const vehicle = vehicles[0];
                  const vehicleConfigs = vehicles.map((v: Record<string, unknown>) => dbRowToVehicleConfig(v));
                  const totalQty = vehicles.reduce((s: number, v: TenderVehicle) => s + (v.quantity || 1), 0);
                  const isMulti = vehicleConfigs.length > 1;
                  return (
                    <Card key={tender.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                      <div
                        className={`p-6 md:p-8 cursor-pointer transition-colors ${expandedTender === tender.id ? "bg-slate-50 border-b border-slate-200" : "bg-white hover:bg-slate-50/50"}`}
                        onClick={() => setExpandedTender(expandedTender === tender.id ? null : tender.id)}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className="font-mono text-slate-500 bg-slate-50 text-xs">{tender.id.split("-")[0].toUpperCase()}</Badge>
                              <Badge className={tender.status === "cancelled" ? "bg-red-100 text-red-700 border-none" : "bg-green-100 text-green-700 border-none"}>
                                {tender.status === "cancelled" ? "Zurückgezogen" : "Abgeschlossen"}
                              </Badge>
                            </div>
                            <h3 className="text-2xl font-bold text-navy-950 mb-1">
                              {isMulti
                                ? `${vehicleConfigs.length} Konfigurationen · ${totalQty} Fahrzeuge`
                                : `${vehicle?.brand || "—"} ${vehicle?.model_name || ""}`}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                              {tender.status === "cancelled" ? "Zurückgezogen" : "Abgeschlossen"} am: {formatDate(tender.end_at)}
                            </p>
                            {isMulti && (
                              <p className="text-xs text-slate-400 mt-1">
                                {vehicleConfigs.map((c: any) => `${c.quantity}x ${c.brand || "—"} ${c.model || ""}`).join(" · ")}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <TenderMenu tender={tender} />
                            <Button variant="ghost" size="icon" className="rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-navy-900 h-10 w-10 shrink-0">
                              {expandedTender === tender.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      {expandedTender === tender.id && (
                        <div className="bg-white p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
                          <div className="space-y-4 mb-6">
                            {vehicleConfigs.map((config: any, i: number) => {
                              const raw = vehicles[i];
                              return (
                                <div key={config.id || i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-navy-950 text-base">
                                      {isMulti && <span className="text-blue-600 mr-1">Fahrzeug {i + 1}:</span>}
                                      {config.brand || "—"} {config.model || ""} {raw?.trim_level || ""}
                                      <span className="text-slate-500 font-normal ml-2">· {config.quantity} Stück</span>
                                    </h3>
                                    {config.listPriceGross != null && (
                                      <span className="text-sm font-bold text-navy-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shrink-0">
                                        {config.listPriceNet ? `${config.listPriceNet.toLocaleString("de-DE")} € netto` : "—"}
                                      </span>
                                    )}
                                  </div>
                                  <VehicleDetailSections vehicle={config} viewerRole="nachfrager" />
                                </div>
                              );
                            })}
                          </div>
                          {isMulti && (
                            <div className="flex items-center justify-between bg-navy-950 text-white px-5 py-3 rounded-xl mb-6 text-sm">
                              <span className="font-bold">Gesamt: {totalQty} Fahrzeug{totalQty !== 1 ? "e" : ""}</span>
                              <span className="font-bold text-amber-400">
                                Gesamt: {vehicles.reduce((s: number, v: TenderVehicle) => s + (v.quantity || 1), 0)} Fahrzeuge
                              </span>
                            </div>
                          )}

                          {/* Review Steppers for each contact */}
                          {(() => {
                            const tenderContacts = contacts.filter(c => c.tender_id === tender.id);
                            if (tenderContacts.length === 0) return null;
                            return (
                              <div className="space-y-6">
                                <h4 className="text-lg font-bold text-navy-950 flex items-center gap-2">
                                  <Star size={18} className="text-amber-500" /> Bewertungen abgeben
                                </h4>
                                {tenderContacts.map((contact) => {
                                  const dealer = dealerProfiles[contact.dealer_id];
                                  const existingReview = reviews.find(r => r.contact_id === contact.id);
                                  return (
                                    <div key={contact.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/30">
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                          {(dealer?.company_name?.[0] || "H")}
                                        </div>
                                        <div>
                                          <span className="font-bold text-navy-950">{dealer?.company_name || "Händler"}</span>
                                          {dealer && (
                                            <div className="text-xs text-slate-500">
                                              {dealer.city ? `${dealer.zip} ${dealer.city}` : ""}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <ReviewStepper
                                        contactId={contact.id}
                                        counterpartName={dealer?.company_name || "Händler"}
                                        existingReview={existingReview ? { id: existingReview.id, type: existingReview.type, contract_concluded: existingReview.contract_concluded, comment: existingReview.comment } : null}
                                        onSubmitReview={handleSubmitReview}
                                        onUpdateReview={handleUpdateReview}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      )}
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
                  <div className="space-y-6">
                    {draftTenders.map(draft => {
                      const vehicles = draft.tender_vehicles || [];
                      const vehicle = vehicles[0];
                      const vehicleConfigs = vehicles.map((v: Record<string, unknown>) => dbRowToVehicleConfig(v));
                      const totalQty = vehicles.reduce((s: number, v: TenderVehicle) => s + (v.quantity || 1), 0);
                      const isMulti = vehicleConfigs.length > 1;
                      return (
                        <Card key={draft.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                          <div
                            className={`p-6 md:p-8 cursor-pointer transition-colors ${expandedTender === draft.id ? "bg-slate-50 border-b border-slate-200" : "bg-white hover:bg-slate-50/50"}`}
                            onClick={() => setExpandedTender(expandedTender === draft.id ? null : draft.id)}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <Badge variant="outline" className="font-mono text-slate-500 bg-slate-50 text-xs">{draft.id.split("-")[0].toUpperCase()}</Badge>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-amber-100 text-amber-700 border-none">Entwurf</Badge>
                                <TenderMenu tender={draft} />
                                <Button variant="ghost" size="icon" className="rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-navy-900 h-10 w-10 shrink-0">
                                  {expandedTender === draft.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </Button>
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold text-navy-950 mb-2">
                              {isMulti
                                ? `${vehicleConfigs.length} Konfigurationen · ${totalQty} Fahrzeuge`
                                : `${vehicle?.brand || "—"} ${vehicle?.model_name || ""}`}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">Zuletzt gespeichert: {createdAgo(draft.created_at)}</p>
                            {isMulti && (
                              <p className="text-xs text-slate-400 mt-1">
                                {vehicleConfigs.map((c: any) => `${c.quantity}x ${c.brand || "—"} ${c.model || ""}`).join(" · ")}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-6">
                              <Button
                                variant="outline"
                                className="rounded-xl shadow-sm text-slate-600 hover:text-navy-900 border-slate-300"
                                onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/ausschreibung/${draft.id}/bearbeiten`); }}
                              >
                                <Pencil size={16} className="mr-2" /> Bearbeiten
                              </Button>
                              <Button className="rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={(e) => e.stopPropagation()}>
                                <Globe size={16} className="mr-2" /> Veröffentlichen
                              </Button>
                            </div>
                          </div>
                          {expandedTender === draft.id && (
                            <div className="bg-white p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
                              <div className="space-y-4">
                                {vehicleConfigs.map((config: any, i: number) => {
                                  const raw = vehicles[i];
                                  return (
                                    <div key={config.id || i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative overflow-hidden">
                                      <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-navy-950 text-base">
                                          {isMulti && <span className="text-blue-600 mr-1">Fahrzeug {i + 1}:</span>}
                                          {config.brand || "—"} {config.model || ""} {raw?.trim_level || ""}
                                          <span className="text-slate-500 font-normal ml-2">· {config.quantity} Stück</span>
                                        </h3>
                                        {config.listPriceGross != null && (
                                          <span className="text-sm font-bold text-navy-900 bg-white px-3 py-1 rounded-lg border border-slate-200 shrink-0">
                                            {config.listPriceNet ? `${config.listPriceNet.toLocaleString("de-DE")} € netto` : "—"}
                                          </span>
                                        )}
                                      </div>
                                      <VehicleDetailSections vehicle={config} viewerRole="nachfrager" />
                                    </div>
                                  );
                                })}
                              </div>
                              {isMulti && (
                                <div className="flex items-center justify-between bg-navy-950 text-white px-5 py-3 rounded-xl mt-4 text-sm">
                                  <span className="font-bold">Gesamt: {totalQty} Fahrzeug{totalQty !== 1 ? "e" : ""}</span>
                                  <span className="font-bold text-amber-400">
                                    Gesamt: {vehicles.reduce((s: number, v: TenderVehicle) => s + (v.quantity || 1), 0)} Fahrzeuge
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
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

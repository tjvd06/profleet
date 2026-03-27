"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Save,
  Loader2,
  Check,
  Circle,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import { dbRowToVehicleConfig } from "@/types/vehicle";
import type { VehicleConfig } from "@/types/vehicle";
import { VehicleDetailSections } from "@/components/tenders/VehicleDetailSections";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TenderVehicleRow = Record<string, unknown> & {
  id: string;
  quantity: number;
  brand: string | null;
  model_name: string | null;
  list_price_gross: number | null;
  list_price_net: number | null;
  fleet_discount: number | null;
  leasing: any;
  financing: any;
  alt_preferences: any;
  config_method: string | null;
  equipment: any;
};

type TenderData = {
  id: string;
  delivery_plz: string | null;
  delivery_city: string | null;
  tender_scope: string;
  end_at: string | null;
  tender_vehicles: TenderVehicleRow[];
};

type VehicleOfferForm = {
  exactMatch: boolean;
  deviationDesc: string;
  dayRegistration: boolean;
  dayRegistrationDate: string;
  dayRegistrationKm: string;
  listPriceNetConfirm: string;

  deliveryZip: string;
  deliveryCity: string;
  deliveryDate: string;

  hasFleetContract: boolean;
  fleetContractDiscount: string;
  hasSpecialAgreement: boolean;
  specialAgreementDiscount: string;
  offeredQuantity: string;

  purchasePriceNet: string;

  leasingRateNet: string;
  leasingDuration: string;
  leasingKmYear: string;
  leasingDownPayment: string;

  financingRateNet: string;
  financingDuration: string;
  financingDownPayment: string;
  financingResidual: string;

  transferCostNet: string;
  registrationCostNet: string;
  totalPriceNetOverride: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeLeft(endAt: string | null): string {
  if (!endAt) return "—";
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "Abgelaufen";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return days > 0 ? `${days} Tage ${hours} Std.` : `${hours} Std.`;
}

function createEmptyOfferForm(vehicle: TenderVehicleRow): VehicleOfferForm {
  return {
    exactMatch: true,
    deviationDesc: "",
    dayRegistration: false,
    dayRegistrationDate: "",
    dayRegistrationKm: "",
    listPriceNetConfirm: vehicle.list_price_net ? String(vehicle.list_price_net) : "",

    deliveryZip: "",
    deliveryCity: "",
    deliveryDate: "",

    hasFleetContract: !!(vehicle.fleet_discount && vehicle.fleet_discount > 0),
    fleetContractDiscount: vehicle.fleet_discount ? String(vehicle.fleet_discount) : "",
    hasSpecialAgreement: false,
    specialAgreementDiscount: "",
    offeredQuantity: String(vehicle.quantity),

    purchasePriceNet: "",

    leasingRateNet: "",
    leasingDuration: vehicle.leasing?.duration || "36",
    leasingKmYear: vehicle.leasing?.km_year || "15000",
    leasingDownPayment: vehicle.leasing?.down_payment || "0",

    financingRateNet: "",
    financingDuration: vehicle.financing?.duration || "48",
    financingDownPayment: vehicle.financing?.down_payment || "0",
    financingResidual: vehicle.financing?.residual || "",

    transferCostNet: "",
    registrationCostNet: "",
    totalPriceNetOverride: "",
  };
}

function isFormFilled(f: VehicleOfferForm): boolean {
  return parseFloat(f.purchasePriceNet) > 0;
}

function calcBrutto(netto: string): number {
  const n = parseFloat(netto) || 0;
  return Math.round(n * 1.19 * 100) / 100;
}

function calcTotalNetto(f: VehicleOfferForm): number {
  const purchase = parseFloat(f.purchasePriceNet) || 0;
  const transfer = parseFloat(f.transferCostNet) || 0;
  const reg = parseFloat(f.registrationCostNet) || 0;
  return purchase + transfer + reg;
}

function fmt(n: number): string {
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ------------------------------------------------------------------ */
/*  Vehicle Tab Button                                                 */
/* ------------------------------------------------------------------ */

function VehicleTab({
  index,
  vehicle,
  active,
  filled,
  onClick,
}: {
  index: number;
  vehicle: TenderVehicleRow;
  active: boolean;
  filled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {filled ? (
        <Check size={16} className={active ? "text-white" : "text-green-500"} />
      ) : (
        <Circle size={16} className={active ? "text-blue-200" : "text-slate-300"} />
      )}
      <span>Fzg. {index + 1}: {vehicle.brand || "—"} {vehicle.model_name || ""}</span>
      <span className={`text-xs ${active ? "text-blue-200" : "text-slate-400"}`}>({vehicle.quantity} Stk.)</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary Tab Button                                                 */
/* ------------------------------------------------------------------ */

function SummaryTab({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
        active
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20"
          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      <ClipboardList size={16} />
      Zusammenfassung
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function OfferCreationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [supabase] = useState(() => createClient());

  const [tender, setTender] = useState<TenderData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Per-vehicle form state
  const [forms, setForms] = useState<VehicleOfferForm[]>([]);
  const [activeTab, setActiveTab] = useState(0); // index into vehicles, or vehicles.length = summary
  const [isEdit, setIsEdit] = useState(false);

  // Load tender data + existing offers
  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      try {
        const [tenderResult, offersResult] = await Promise.all([
          supabase
            .from("tenders")
            .select("*, tender_vehicles(*)")
            .eq("id", params.id)
            .single(),
          supabase
            .from("offers")
            .select("*")
            .eq("tender_id", params.id)
            .eq("dealer_id", user.id),
        ]);

        if (tenderResult.error) {
          setPageError(tenderResult.error.message);
          return;
        }

        const t = tenderResult.data as TenderData;
        setTender(t);

        const existingOffers = (offersResult.data || []) as any[];

        if (existingOffers.length > 0) {
          setIsEdit(true);
          // Pre-fill forms from existing offers
          const formsByVehicle = new Map(existingOffers.map((o: any) => [o.tender_vehicle_id, o]));
          setForms(t.tender_vehicles.map((v) => {
            const existing = formsByVehicle.get(v.id);
            if (!existing) return createEmptyOfferForm(v);
            const d = existing.offer_details || {};
            return {
              exactMatch: d.exactMatch ?? true,
              deviationDesc: existing.deviation_details?.description || "",
              dayRegistration: d.dayRegistration ?? false,
              dayRegistrationDate: d.dayRegistrationDate || "",
              dayRegistrationKm: d.dayRegistrationKm || "",
              listPriceNetConfirm: d.listPriceNetConfirm ? String(d.listPriceNetConfirm) : (v.list_price_net ? String(v.list_price_net) : ""),
              deliveryZip: existing.delivery_plz || "",
              deliveryCity: existing.delivery_city || "",
              deliveryDate: existing.delivery_date || "",
              hasFleetContract: d.hasFleetContract ?? false,
              fleetContractDiscount: d.fleetContractDiscount ? String(d.fleetContractDiscount) : "",
              hasSpecialAgreement: d.hasSpecialAgreement ?? false,
              specialAgreementDiscount: d.specialAgreementDiscount ? String(d.specialAgreementDiscount) : "",
              offeredQuantity: existing.offered_quantity ? String(existing.offered_quantity) : String(v.quantity),
              purchasePriceNet: existing.purchase_price ? String(existing.purchase_price) : "",
              leasingRateNet: existing.lease_rate ? String(existing.lease_rate) : "",
              leasingDuration: d.leasingDuration || v.leasing?.duration || "36",
              leasingKmYear: d.leasingKmYear || v.leasing?.km_year || "15000",
              leasingDownPayment: d.leasingDownPayment || v.leasing?.down_payment || "0",
              financingRateNet: d.financingRate ? String(d.financingRate) : "",
              financingDuration: d.financingDuration || v.financing?.duration || "48",
              financingDownPayment: d.financingDownPayment || v.financing?.down_payment || "0",
              financingResidual: d.financingResidual || v.financing?.residual || "",
              transferCostNet: existing.transfer_cost ? String(existing.transfer_cost) : "",
              registrationCostNet: existing.registration_cost ? String(existing.registration_cost) : "",
              totalPriceNetOverride: "",
            };
          }));
        } else {
          setForms(t.tender_vehicles.map((v) => createEmptyOfferForm(v)));
        }
      } catch (e: any) {
        setPageError(e?.message || "Fehler beim Laden");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [authLoading, user?.id, params.id]);

  const vehicles = tender?.tender_vehicles || [];
  const vehicleConfigs: VehicleConfig[] = useMemo(
    () => vehicles.map((v) => dbRowToVehicleConfig(v as Record<string, unknown>)),
    [vehicles]
  );

  const isSummary = activeTab === vehicles.length;
  const currentVehicle = !isSummary ? vehicles[activeTab] : null;
  const currentConfig = !isSummary ? vehicleConfigs[activeTab] : null;
  const currentForm = !isSummary ? forms[activeTab] : null;

  const hasLeasing = vehicles.some((v) => v.leasing?.requested);
  const hasFinancing = vehicles.some((v) => v.financing?.requested);
  const vehicleHasLeasing = currentVehicle?.leasing?.requested;
  const vehicleHasFinancing = currentVehicle?.financing?.requested;

  // Update form helper
  const updateForm = (patch: Partial<VehicleOfferForm>) => {
    setForms((prev) => prev.map((f, i) => (i === activeTab ? { ...f, ...patch } : f)));
  };

  // Total across all vehicles
  const grandTotalNetto = forms.reduce((sum, f) => sum + calcTotalNetto(f) * (parseInt(f.offeredQuantity) || 1), 0);
  const totalVehicleCount = forms.reduce((sum, f) => sum + (parseInt(f.offeredQuantity) || 0), 0);

  /* ---------------------------------------------------------------- */
  /*  Submit                                                           */
  /* ---------------------------------------------------------------- */

  const handleSubmitOffer = async (draft = false) => {
    if (!user || !tender) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const inserts = vehicles.map((v, i) => {
        const f = forms[i];
        const perVehicleNetto =
          f.totalPriceNetOverride && parseFloat(f.totalPriceNetOverride) > 0
            ? parseFloat(f.totalPriceNetOverride)
            : calcTotalNetto(f);
        const qty = parseInt(f.offeredQuantity) || v.quantity;
        const totalNetto = perVehicleNetto * qty;

        return {
          tender_id: tender.id,
          tender_vehicle_id: v.id,
          dealer_id: user.id,
          status: draft ? "draft" : "active",
          purchase_price: parseFloat(f.purchasePriceNet) || 0,
          lease_rate: v.leasing?.requested ? parseFloat(f.leasingRateNet) || null : null,
          transfer_cost: parseFloat(f.transferCostNet) || 0,
          registration_cost: parseFloat(f.registrationCostNet) || 0,
          total_price: totalNetto,
          offered_quantity: qty,
          delivery_plz: f.deliveryZip || null,
          delivery_city: f.deliveryCity || null,
          delivery_date: f.deliveryDate || null,
          deviation_type: f.exactMatch ? null : "alternative",
          deviation_details: f.exactMatch
            ? null
            : { description: f.deviationDesc },
          offer_details: {
            exactMatch: f.exactMatch,
            dayRegistration: f.dayRegistration,
            dayRegistrationDate: f.dayRegistrationDate || null,
            dayRegistrationKm: f.dayRegistrationKm || null,
            listPriceNetConfirm: parseFloat(f.listPriceNetConfirm) || null,
            hasFleetContract: f.hasFleetContract,
            fleetContractDiscount: parseFloat(f.fleetContractDiscount) || null,
            hasSpecialAgreement: f.hasSpecialAgreement,
            specialAgreementDiscount: parseFloat(f.specialAgreementDiscount) || null,
            leasingDuration: f.leasingDuration,
            leasingKmYear: f.leasingKmYear,
            leasingDownPayment: f.leasingDownPayment,
            financingRate: parseFloat(f.financingRateNet) || null,
            financingDuration: f.financingDuration,
            financingDownPayment: f.financingDownPayment,
            financingResidual: f.financingResidual,
          },
        };
      });

      const { error } = await supabase.from("offers").upsert(inserts, {
        onConflict: "tender_id,tender_vehicle_id,dealer_id",
      });
      if (error) throw error;

      router.push("/dashboard/angebote");
    } catch (e: any) {
      console.error("Offer submit error:", e);
      setSubmitError(e?.message || "Fehler beim Absenden");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Loading / Error states                                           */
  /* ---------------------------------------------------------------- */

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        <Loader2 className="animate-spin mr-3" size={28} />
        <span className="text-lg font-semibold">Ausschreibung wird geladen…</span>
      </div>
    );
  }

  if (pageError || !tender) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg text-center">
          <h3 className="text-lg font-bold text-red-800 mb-2">Fehler</h3>
          <p className="text-red-600 text-sm mb-4">{pageError || "Ausschreibung nicht gefunden."}</p>
          <Link href="/dashboard/eingang">
            <Button variant="outline" className="rounded-xl border-red-200 text-red-700">Zurück zum Eingang</Button>
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Top Banner */}
      <div className="bg-navy-950 text-white py-4 sticky top-0 z-40 shadow-md">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/eingang">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-8 w-8">
                <ChevronLeft size={20} />
              </Button>
            </Link>
            <h1 className="font-bold text-lg md:text-xl flex items-center gap-3">
              Angebot abgeben{" "}
              <Badge className="bg-white/20 text-blue-200 border-none px-2 rounded-md font-mono text-xs">
                {tender.id.split("-")[0].toUpperCase()}
              </Badge>
            </h1>
          </div>
          <div className="hidden md:flex items-center text-sm font-medium text-blue-200">
            Endet in:{" "}
            <span className="text-amber-400 ml-2 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md">
              {timeLeft(tender.end_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Tabs */}
      {vehicles.length > 1 && (
        <div className="bg-white border-b border-slate-200 sticky top-[64px] z-30">
          <div className="container mx-auto max-w-7xl px-4 md:px-8 py-3 flex gap-2 overflow-x-auto">
            {vehicles.map((v, i) => (
              <VehicleTab
                key={v.id}
                index={i}
                vehicle={v}
                active={activeTab === i}
                filled={isFormFilled(forms[i])}
                onClick={() => setActiveTab(i)}
              />
            ))}
            <SummaryTab active={isSummary} onClick={() => setActiveTab(vehicles.length)} />
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-7xl px-4 md:px-8 py-8">
        {/* ============================================================ */}
        {/*  SUMMARY VIEW                                                 */}
        {/* ============================================================ */}
        {isSummary ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-navy-950 mb-2">Zusammenfassung Ihres Angebots</h2>

            {vehicles.map((v, i) => {
              const f = forms[i];
              const total = calcTotalNetto(f);
              const qty = parseInt(f.offeredQuantity) || v.quantity;
              return (
                <div key={v.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-navy-950 flex items-center gap-2">
                      {isFormFilled(f) ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <Circle size={18} className="text-slate-300" />
                      )}
                      Fahrzeug {i + 1}: {v.brand} {v.model_name} · {qty} Stück
                    </h3>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => setActiveTab(i)}>
                      Bearbeiten
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400 font-semibold text-xs uppercase">Kaufpreis netto</div>
                      <div className="font-bold text-navy-950">{f.purchasePriceNet ? `${fmt(parseFloat(f.purchasePriceNet))} €` : "—"}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-semibold text-xs uppercase">Überführung</div>
                      <div className="font-bold text-navy-950">{f.transferCostNet ? `${fmt(parseFloat(f.transferCostNet))} €` : "—"}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-semibold text-xs uppercase">Zulassung</div>
                      <div className="font-bold text-navy-950">{f.registrationCostNet ? `${fmt(parseFloat(f.registrationCostNet))} €` : "—"}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-semibold text-xs uppercase">Gesamt netto</div>
                      <div className="font-bold text-blue-700">{fmt(total)} €</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Grand total */}
            <div className="bg-navy-950 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between shadow-xl shadow-navy-900/20">
              <div>
                <h3 className="text-lg text-blue-200 font-semibold mb-1">Gesamtangebot</h3>
                <p className="text-sm text-slate-400">{totalVehicleCount} Fahrzeuge · Kaufpreis gesamt netto</p>
              </div>
              <div className="text-4xl md:text-5xl font-black tracking-tight mt-4 md:mt-0 text-amber-400">
                {fmt(grandTotalNetto)} €
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="tos" className="scale-125 border-slate-300" />
              <Label htmlFor="tos" className="text-sm text-slate-500 leading-relaxed cursor-pointer">
                Ich bestätige die Vertragsbedingungen. Diese Angaben sind rechtlich bindend. Bei Zustandekommen eines Vertrages berechnet proFleet eine Vermittlungspauschale.
              </Label>
            </div>

            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold">
                {submitError}
              </div>
            )}

            {/* Actions */}
            <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border border-slate-200 sticky bottom-6 z-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button
                variant="outline"
                onClick={() => handleSubmitOffer(true)}
                disabled={submitting}
                className="w-full sm:w-auto rounded-xl hover:bg-slate-100 h-14 px-6 text-slate-600 font-semibold text-lg border-slate-300"
              >
                <Save className="mr-2" size={20} /> Als Entwurf speichern
              </Button>
              <Button
                onClick={() => handleSubmitOffer(false)}
                disabled={submitting}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-blue-500/20 px-10 h-14 text-lg font-bold transition-transform hover:scale-105"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} /> Wird gesendet…
                  </>
                ) : (
                  <>
                    <Mail className="mr-2" size={20} /> Angebot verbindlich abgeben
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /*  PER-VEHICLE FORM VIEW                                        */
          /* ============================================================ */
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT SIDE: Read-Only Details (Sticky) */}
            <div className="lg:w-[45%] lg:sticky lg:top-[130px] h-fit flex flex-col gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-navy-950 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  Besonderheiten & Regeln <ShieldCheck className="text-green-500" />
                </h2>
                <ul className="space-y-4 text-slate-600">
                  <li className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                    <p><strong className="text-navy-900">Anonymität wahren:</strong> Versuchen Sie nicht, Kontaktinformationen im Angebot zu platzieren.</p>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                    <p><strong className="text-navy-900">Endpreisgarantie:</strong> Kalkulieren Sie ehrlich inklusive aller Nebenkosten.</p>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-navy-950 border-b border-slate-100 pb-4 mb-4">Nachfrager-Profil</h2>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Standort</div>
                    <div className="font-semibold text-navy-900">{tender.delivery_city || "—"} ({tender.delivery_plz || "—"})</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Radius</div>
                    <div className="font-semibold text-navy-900">{tender.tender_scope === "bundesweit" ? "Bundesweit" : "Lokal"}</div>
                  </div>
                </div>
              </div>

              {/* Vehicle Details — Collapsible Sections */}
              {currentConfig && (
                <div className="bg-slate-100 border border-slate-200 rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-navy-950">
                      Fahrzeug {activeTab + 1}: {currentVehicle!.brand} {currentVehicle!.model_name}
                    </h2>
                    <Badge className="bg-navy-100 text-navy-800 border-none font-bold">{currentVehicle!.quantity}x</Badge>
                  </div>
                  <VehicleDetailSections vehicle={currentConfig} />
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Interactive Form */}
            <div className="lg:w-[55%] flex flex-col gap-6">
              {/* Single vehicle header */}
              {vehicles.length === 1 && (
                <div className="bg-slate-100 rounded-2xl px-5 py-3 border border-slate-200 font-bold text-navy-950 text-lg">
                  {currentVehicle!.brand} {currentVehicle!.model_name} · {currentVehicle!.quantity} Stück
                </div>
              )}

              {/* Section 1: Fahrzeug-Konfiguration */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm text-left">
                <h2 className="text-2xl font-bold text-navy-950 mb-8 border-b border-slate-100 pb-4">1. Fahrzeug-Konfiguration</h2>

                <div className="flex items-start gap-4 mb-6">
                  <Switch checked={currentForm!.exactMatch} onCheckedChange={(c) => updateForm({ exactMatch: c })} className="scale-125 mt-1" />
                  <div>
                    <Label className="text-lg font-bold text-navy-950 cursor-pointer block mb-2" onClick={() => updateForm({ exactMatch: !currentForm!.exactMatch })}>
                      Bieten Sie exakt die nachgefragte Konfiguration an?
                    </Label>
                    <p className="text-slate-500">Wenn Sie alternative Fahrzeuge anbieten, schalten Sie diesen Punkt aus.</p>
                  </div>
                </div>

                {currentForm!.exactMatch ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-slate-700">Netto-Listenpreis bestätigen (€)</Label>
                      <Input
                        type="number"
                        value={currentForm!.listPriceNetConfirm}
                        onChange={(e) => updateForm({ listPriceNetConfirm: e.target.value })}
                        className="rounded-xl h-14 bg-slate-50 border-slate-200 text-lg focus-visible:ring-blue-500"
                        placeholder="Listenpreis netto bestätigen"
                      />
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Switch checked={currentForm!.dayRegistration} onCheckedChange={(c) => updateForm({ dayRegistration: c })} className="mt-1" />
                      <div className="flex-grow">
                        <Label className="font-semibold text-navy-950 block mb-1">Tageszulassung</Label>
                        {currentForm!.dayRegistration && (
                          <div className="grid grid-cols-2 gap-4 mt-3 animate-in fade-in">
                            <div className="space-y-2">
                              <Label className="text-sm text-slate-600">Datum</Label>
                              <Input type="date" value={currentForm!.dayRegistrationDate} onChange={(e) => updateForm({ dayRegistrationDate: e.target.value })} className="rounded-xl h-12" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-slate-600">km-Stand</Label>
                              <Input type="number" value={currentForm!.dayRegistrationKm} onChange={(e) => updateForm({ dayRegistrationKm: e.target.value })} className="rounded-xl h-12" placeholder="z.B. 50" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
                    <Label className="text-base font-semibold text-amber-700 block mb-3">Beschreibung der Abweichungen</Label>
                    <Textarea
                      placeholder="z.B. Fahrzeug ist weiß statt schwarz, dafür sofort verfügbar..."
                      value={currentForm!.deviationDesc}
                      onChange={(e) => updateForm({ deviationDesc: e.target.value })}
                      className="min-h-[120px] rounded-2xl bg-amber-50/30 border-amber-200 focus-visible:ring-amber-500 text-base p-4"
                    />
                    <p className="text-sm text-slate-500">Optional: Sie können eine Konfigurationsdatei als Anhang hochladen.</p>
                  </div>
                )}
              </div>

              {/* Section 2: Lieferung */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
                <h2 className="text-2xl font-bold text-navy-950 mb-8 border-b border-slate-100 pb-4">2. Lieferung</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-700">PLZ</Label>
                    <Input value={currentForm!.deliveryZip} onChange={(e) => updateForm({ deliveryZip: e.target.value })} className="rounded-xl h-14 bg-slate-50 border-slate-200 text-lg" placeholder="z.B. 80331" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-700">Ort</Label>
                    <Input value={currentForm!.deliveryCity} onChange={(e) => updateForm({ deliveryCity: e.target.value })} className="rounded-xl h-14 bg-slate-50 border-slate-200 text-lg" placeholder="z.B. München" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-700">Frühester Liefertermin</Label>
                    <Input type="date" value={currentForm!.deliveryDate} onChange={(e) => updateForm({ deliveryDate: e.target.value })} className="rounded-xl h-14 bg-slate-50 border-slate-200 text-lg" />
                  </div>
                </div>
              </div>

              {/* Section 3: Vertragsdaten */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
                <h2 className="text-2xl font-bold text-navy-950 mb-8 border-b border-slate-100 pb-4">3. Vertragsdaten</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Switch checked={currentForm!.hasFleetContract} onCheckedChange={(c) => updateForm({ hasFleetContract: c })} className="mt-1" />
                    <div className="flex-grow">
                      <Label className="font-semibold text-navy-950 block mb-1">Großkundenvertrag</Label>
                      {currentForm!.hasFleetContract && (
                        <div className="mt-3 animate-in fade-in">
                          <Label className="text-sm text-slate-600 mb-2 block">Rabatt in %</Label>
                          <Input type="number" step="0.1" value={currentForm!.fleetContractDiscount} onChange={(e) => updateForm({ fleetContractDiscount: e.target.value })} className="rounded-xl h-12 w-40" placeholder="z.B. 15.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Switch checked={currentForm!.hasSpecialAgreement} onCheckedChange={(c) => updateForm({ hasSpecialAgreement: c })} className="mt-1" />
                    <div className="flex-grow">
                      <Label className="font-semibold text-navy-950 block mb-1">Sondervereinbarungen</Label>
                      {currentForm!.hasSpecialAgreement && (
                        <div className="mt-3 animate-in fade-in">
                          <Label className="text-sm text-slate-600 mb-2 block">Rabatt in %</Label>
                          <Input type="number" step="0.1" value={currentForm!.specialAgreementDiscount} onChange={(e) => updateForm({ specialAgreementDiscount: e.target.value })} className="rounded-xl h-12 w-40" placeholder="z.B. 5" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-slate-700">Angebotene Anzahl</Label>
                    <Input type="number" min={1} value={currentForm!.offeredQuantity} onChange={(e) => updateForm({ offeredQuantity: e.target.value })} className="rounded-xl h-14 bg-slate-50 border-slate-200 text-lg w-40" />
                    <p className="text-xs text-slate-400">Vorausgefüllt mit der angeforderten Stückzahl ({currentVehicle!.quantity})</p>
                  </div>
                </div>
              </div>

              {/* Section 4: Preise */}
              <div className="bg-white border-2 border-blue-200 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 to-transparent opacity-50 pointer-events-none" />

                <h2 className="text-2xl font-bold text-navy-950 mb-8 border-b border-blue-100 pb-4">4. Preise</h2>

                <div className="space-y-8">
                  {/* Purchase */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <h3 className="text-lg font-bold text-navy-950 mb-6 flex items-center gap-2">
                      Kaufpreis <Badge className="bg-blue-100 text-blue-700 border-none">Pflicht</Badge>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-slate-700">Kaufpreis netto pro Fahrzeug (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={currentForm!.purchasePriceNet}
                          onChange={(e) => updateForm({ purchasePriceNet: e.target.value })}
                          className="rounded-xl h-14 border-blue-200 bg-white text-xl font-bold text-blue-700 focus-visible:ring-blue-500"
                          placeholder="0,00"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-base font-semibold text-slate-700">Kaufpreis brutto (€)</Label>
                        <Input
                          readOnly
                          value={currentForm!.purchasePriceNet ? fmt(calcBrutto(currentForm!.purchasePriceNet)) : ""}
                          className="rounded-xl h-14 bg-slate-200 border-transparent text-xl font-bold text-slate-500"
                          placeholder="Auto-berechnet"
                        />
                        <p className="text-xs text-slate-400">Auto-berechnet (×1,19)</p>
                      </div>
                    </div>
                  </div>

                  {/* Leasing */}
                  {vehicleHasLeasing && (
                    <div className="bg-white border-2 border-dashed border-slate-300 p-6 rounded-3xl">
                      <h3 className="text-lg font-bold text-navy-950 mb-6 flex items-center gap-2">
                        Leasing <Badge variant="outline" className="border-slate-300 text-slate-500">Vom Nachfrager gewünscht</Badge>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-slate-700">Leasingrate monatlich netto (€)</Label>
                          <Input type="number" step="0.01" value={currentForm!.leasingRateNet} onChange={(e) => updateForm({ leasingRateNet: e.target.value })} className="rounded-xl h-14 text-lg border-slate-300" placeholder="0,00" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-slate-700">Laufzeit (Monate)</Label>
                          <Input type="number" value={currentForm!.leasingDuration} onChange={(e) => updateForm({ leasingDuration: e.target.value })} className="rounded-xl h-14 text-lg border-slate-300" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-slate-700">KM / Jahr</Label>
                          <Input type="number" value={currentForm!.leasingKmYear} onChange={(e) => updateForm({ leasingKmYear: e.target.value })} className="rounded-xl h-14 text-lg border-slate-300" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-slate-700">Anzahlung (€)</Label>
                          <Input type="number" value={currentForm!.leasingDownPayment} onChange={(e) => updateForm({ leasingDownPayment: e.target.value })} className="rounded-xl h-14 text-lg border-slate-300" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Financing */}
                  {vehicleHasFinancing && (
                    <div className="bg-white border-2 border-dashed border-slate-300 p-6 rounded-3xl">
                      <h3 className="text-lg font-bold text-navy-950 mb-6 flex items-center gap-2">
                        Finanzierung <Badge variant="outline" className="border-slate-300 text-slate-500">Vom Nachfrager gewünscht</Badge>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-slate-700">Finanzierungsrate monatlich netto (€)</Label>
                          <Input type="number" step="0.01" value={currentForm!.financingRateNet} onChange={(e) => updateForm({ financingRateNet: e.target.value })} className="rounded-xl h-14 text-lg border-slate-300" placeholder="0,00" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-slate-700">Laufzeit (Monate)</Label>
                          <Input type="number" value={currentForm!.financingDuration} onChange={(e) => updateForm({ financingDuration: e.target.value })} className="rounded-xl h-14 text-lg border-slate-300" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-slate-700">Anzahlung (€)</Label>
                          <Input type="number" value={currentForm!.financingDownPayment} onChange={(e) => updateForm({ financingDownPayment: e.target.value })} className="rounded-xl h-14 text-lg border-slate-300" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-slate-700">Restzahlung (€)</Label>
                          <Input type="number" value={currentForm!.financingResidual} onChange={(e) => updateForm({ financingResidual: e.target.value })} className="rounded-xl h-14 text-lg border-slate-300" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: Zusatzkosten */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
                <h2 className="text-2xl font-bold text-navy-950 mb-8 border-b border-slate-100 pb-4">5. Zusatzkosten</h2>

                <div className="space-y-6 mb-8">
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <Label className="text-lg font-bold text-navy-950 block">Überführungskosten netto (€)</Label>
                      <span className="text-slate-500 text-sm">inkl. Reinigung, Matten, Übergabe</span>
                    </div>
                    <Input type="number" value={currentForm!.transferCostNet} onChange={(e) => updateForm({ transferCostNet: e.target.value })} className="w-36 rounded-xl h-12 text-right text-lg font-bold focus-visible:ring-blue-500 bg-white" placeholder="0" />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <Label className="text-lg font-bold text-navy-950 block">Zulassungskosten netto (€)</Label>
                      <span className="text-slate-500 text-sm">inkl. Wunschkennzeichen</span>
                    </div>
                    <Input type="number" value={currentForm!.registrationCostNet} onChange={(e) => updateForm({ registrationCostNet: e.target.value })} className="w-36 rounded-xl h-12 text-right text-lg font-bold focus-visible:ring-blue-500 bg-white" placeholder="0" />
                  </div>
                </div>

                {/* Total for this vehicle */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-lg font-bold text-navy-950 block">Gesamtpreis netto (Abholpreis)</Label>
                      <span className="text-slate-400 text-xs">Kaufpreis + Überführung + Zulassung (editierbar)</span>
                    </div>
                    <Input
                      type="number"
                      value={currentForm!.totalPriceNetOverride || (currentForm!.purchasePriceNet ? String(calcTotalNetto(currentForm!)) : "")}
                      onChange={(e) => updateForm({ totalPriceNetOverride: e.target.value })}
                      className="w-44 rounded-xl h-14 text-right text-xl font-black text-blue-700 focus-visible:ring-blue-500 bg-white border-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation: Next vehicle or Summary */}
              <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border border-slate-200 sticky bottom-6 z-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleSubmitOffer(true)}
                  disabled={submitting}
                  className="w-full sm:w-auto rounded-xl hover:bg-slate-100 h-14 px-6 text-slate-600 font-semibold text-lg border-slate-300"
                >
                  <Save className="mr-2" size={20} /> Entwurf speichern
                </Button>

                {activeTab < vehicles.length - 1 ? (
                  <Button
                    onClick={() => setActiveTab(activeTab + 1)}
                    className="w-full sm:w-auto rounded-xl bg-navy-800 hover:bg-navy-950 text-white shadow-lg h-14 px-8 text-lg font-bold"
                  >
                    Weiter zu Fahrzeug {activeTab + 2} →
                  </Button>
                ) : (
                  <Button
                    onClick={() => setActiveTab(vehicles.length)}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-blue-500/20 px-10 h-14 text-lg font-bold transition-transform hover:scale-105"
                  >
                    <ClipboardList className="mr-2" size={20} /> Zur Zusammenfassung
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, CheckCircle2, ShieldCheck, Mail, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";

type TenderVehicle = {
  quantity: number;
  brand: string | null;
  model_name: string | null;
  trim_level: string | null;
  list_price_gross: number | null;
  fleet_discount: number | null;
  leasing: any;
  financing: any;
  alt_preferences: any;
};

type TenderData = {
  id: string;
  delivery_plz: string | null;
  delivery_city: string | null;
  tender_scope: string;
  end_at: string | null;
  tender_vehicles: TenderVehicle[];
};

function timeLeft(endAt: string | null): string {
  if (!endAt) return "—";
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "Abgelaufen";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return days > 0 ? `${days} Tage ${hours} Std.` : `${hours} Std.`;
}

export default function OfferCreationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [supabase] = useState(() => createClient());

  const [tender, setTender] = useState<TenderData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load tender data
  useEffect(() => {
    if (authLoading) return;

    (async () => {
      try {
        const { data, error } = await supabase
          .from("tenders")
          .select("*, tender_vehicles(*)")
          .eq("id", params.id)
          .single();

        if (error) {
          setPageError(error.message);
        } else {
          setTender(data as TenderData);
        }
      } catch (e: any) {
        setPageError(e?.message || "Fehler beim Laden");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [authLoading, params.id]);

  // Form state
  const [exactMatch, setExactMatch] = useState(true);
  const [deviationDesc, setDeviationDesc] = useState("");
  const [deliveryWeeks, setDeliveryWeeks] = useState("12");
  const [purchaseDiscount, setPurchaseDiscount] = useState("18.5");
  const [leasingRate, setLeasingRate] = useState("549");
  const [transferCosts, setTransferCosts] = useState("990");
  const [registrationCosts, setRegistrationCosts] = useState("150");

  // Derived values
  const vehicles = tender?.tender_vehicles || [];
  const totalBasePrice = vehicles.reduce((acc, v) => acc + ((v.list_price_gross || 0) * v.quantity), 0);
  const discountAmount = totalBasePrice * (parseFloat(purchaseDiscount) / 100 || 0);
  const discountedPrice = totalBasePrice - discountAmount;
  const finalPrice = discountedPrice + parseFloat(transferCosts || "0") + parseFloat(registrationCosts || "0");

  const hasLeasing = vehicles.some(v => v.leasing?.requested);
  const hasFinancing = vehicles.some(v => v.financing?.requested);
  const hasFleetDiscount = vehicles.some(v => v.fleet_discount && v.fleet_discount > 0);

  const handleSubmitOffer = async () => {
    if (!user || !tender) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase.from("offers").insert({
        tender_id: tender.id,
        dealer_id: user.id,
        status: "active",
        purchase_price: discountedPrice,
        lease_rate: hasLeasing ? parseFloat(leasingRate) || null : null,
        transfer_cost: parseFloat(transferCosts) || 0,
        registration_cost: parseFloat(registrationCosts) || 0,
        total_price: finalPrice,
        deviation_type: exactMatch ? null : "alternative",
        deviation_details: exactMatch ? null : { description: deviationDesc },
      });

      if (error) throw error;

      router.push("/dashboard/eingang");
    } catch (e: any) {
      console.error("Offer submit error:", e);
      setSubmitError(e?.message || "Fehler beim Absenden");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading / Error states
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
              Angebot abgeben <Badge className="bg-white/20 text-blue-200 border-none px-2 rounded-md font-mono text-xs">{tender.id.split('-')[0].toUpperCase()}</Badge>
            </h1>
          </div>
          <div className="hidden md:flex items-center text-sm font-medium text-blue-200">
            Endet in: <span className="text-amber-400 ml-2 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md">{timeLeft(tender.end_at)}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT SIDE: Read-Only Rules & Details (Sticky) */}
          <div className="lg:w-[45%] lg:sticky lg:top-[88px] h-fit flex flex-col gap-6">
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
                  <div className="font-semibold text-navy-900">{tender.tender_scope === 'bundesweit' ? 'Bundesweit' : 'Lokal'}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Verträge</div>
                  <div className="font-semibold text-navy-900">{hasFleetDiscount ? 'Großkundenvertrag' : 'Keine vorhanden'}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6">
              <h2 className="text-lg font-bold text-navy-950 mb-4">Fahrzeugkonfiguration</h2>
              {vehicles.map((v, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden mb-3 last:mb-0">
                  <div className="absolute top-0 right-0 bg-navy-100 text-navy-800 font-bold px-4 py-1.5 rounded-bl-xl border-b border-l border-navy-200">{v.quantity}x</div>
                  <div className="font-bold text-navy-950 text-xl">{v.brand || "—"} {v.model_name || ""} {v.trim_level || ""}</div>
                  {v.list_price_gross && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm flex justify-between items-center mt-3">
                      <span className="font-medium text-slate-500">Listenpreis Brutto ca.</span>
                      <span className="font-bold text-navy-900">{v.list_price_gross.toLocaleString('de-DE')} €</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Form */}
          <div className="lg:w-[55%] flex flex-col gap-6">
            
            {/* Section 1: Match */}
            <div className="bg-white border text-left border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-navy-950 mb-8 border-b border-slate-100 pb-4">1. Konfiguration bestätigen</h2>
              <div className="flex items-start gap-4 mb-6">
                <Switch checked={exactMatch} onCheckedChange={setExactMatch} className="scale-125 mt-1" />
                <div>
                  <Label className="text-lg font-bold text-navy-950 cursor-pointer block mb-2" onClick={() => setExactMatch(!exactMatch)}>Exakte Konfiguration vorhanden / lieferbar</Label>
                  <p className="text-slate-500">Wenn Sie alternative Fahrzeuge anbieten, schalten Sie diesen Punkt aus.</p>
                </div>
              </div>
              
              {!exactMatch && (
                <div className="animate-in fade-in slide-in-from-top-4">
                  <Label className="text-base font-semibold text-amber-700 block mb-3">Welche Abweichungen gibt es?</Label>
                  <Textarea 
                    placeholder="z.B. Fahrzeug ist weiß statt schwarz, dafür sofort verfügbar..."
                    value={deviationDesc}
                    onChange={(e) => setDeviationDesc(e.target.value)}
                    className="min-h-[120px] rounded-2xl bg-amber-50/30 border-amber-200 focus-visible:ring-amber-500 text-base p-4"
                  />
                </div>
              )}
            </div>

            {/* Section 2: Delivery */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-navy-950 mb-8 border-b border-slate-100 pb-4">2. Lieferdetails</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-700">Lieferzeit in Wochen</Label>
                  <Input type="number" value={deliveryWeeks} onChange={(e) => setDeliveryWeeks(e.target.value)} className="rounded-xl h-14 bg-slate-50 border-slate-200 text-lg focus-visible:ring-blue-500" />
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-700">Abholung / Lieferung</Label>
                  <select className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-base focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Nur Werksabholung / Händler (Inkl.)</option>
                    <option>Lieferung möglich (Gegen Aufpreis)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Pricing */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-navy-950 mb-8 border-b border-slate-100 pb-4">3. Preise kalkulieren</h2>
              
              <div className="space-y-10">
                <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-navy-950">Kaufangebot (Obligatorisch)</h3>
                    <Badge className="bg-blue-100 text-blue-700 border-none px-3">Standard</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 items-end">
                    <div className="w-full sm:w-1/2 space-y-3">
                      <Label className="text-base font-semibold text-slate-700 flex items-center justify-between">Nachlass auf den UPE <span className="text-blue-600 font-bold">%</span></Label>
                      <Input 
                        type="number" step="0.1" 
                        value={purchaseDiscount} 
                        onChange={(e) => setPurchaseDiscount(e.target.value)} 
                        className="rounded-xl h-14 border-blue-200 bg-white text-xl font-bold text-blue-700 focus-visible:ring-blue-500" 
                      />
                    </div>
                    <div className="w-full sm:w-1/2 space-y-3">
                      <Label className="text-base font-semibold text-slate-700">Reduzierter Fahrzeugpreis (€)</Label>
                      <Input 
                        readOnly 
                        value={discountedPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                        className="rounded-xl h-14 bg-slate-200 border-transparent text-xl font-bold text-slate-500" 
                      />
                    </div>
                  </div>
                </div>

                {hasLeasing && (
                  <div className="bg-white border-2 border-dashed border-slate-300 p-6 sm:p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={true} disabled className="scale-125 border-slate-300" />
                        <h3 className="text-xl font-bold text-navy-950 cursor-pointer">Leasingangebot abgegeben</h3>
                      </div>
                    </div>
                    <div className="pl-8 pt-4 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-slate-700">Leasingrate p.M. Netto (€)</Label>
                          <Input value={leasingRate} onChange={(e) => setLeasingRate(e.target.value)} className="rounded-xl h-14 text-lg border-slate-300 focus-visible:ring-blue-500" />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-base font-semibold text-slate-700">Leasingfaktor</Label>
                          <div className="h-14 bg-slate-100 rounded-xl border border-transparent flex items-center px-4 font-bold text-navy-600 text-lg">
                            {totalBasePrice > 0 ? ((parseFloat(leasingRate) / (totalBasePrice / 1.19)) * 100).toFixed(2) : "0.00"} % 
                            <span className="text-xs font-normal text-slate-400 ml-2">Auto-berechnet</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 italic flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Ohne Leasingsonderzahlung / Anzahlung laut Anfrage.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Extra Costs & Finish */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 to-transparent opacity-50 pointer-events-none" />
              
              <h2 className="text-2xl font-bold text-navy-950 mb-8 border-b border-slate-100 pb-4">4. Zusatzkosten & Endsumme</h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <Label className="text-lg font-bold text-navy-950 block">Überführungs- & Abholkosten Brutto (€)</Label>
                    <span className="text-slate-500 text-sm">inkl. Reinigung, Matten, Übergabe</span>
                  </div>
                  <Input type="number" value={transferCosts} onChange={(e) => setTransferCosts(e.target.value)} className="w-32 rounded-xl h-12 text-right text-lg font-bold focus-visible:ring-blue-500 bg-white" />
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <Label className="text-lg font-bold text-navy-950 block">Zulassungskosten Brutto (€)</Label>
                    <span className="text-slate-500 text-sm">inkl. Wunschkennzeichen</span>
                  </div>
                  <Input type="number" value={registrationCosts} onChange={(e) => setRegistrationCosts(e.target.value)} className="w-32 rounded-xl h-12 text-right text-lg font-bold focus-visible:ring-blue-500 bg-white" />
                </div>
              </div>

              <div className="bg-navy-950 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between shadow-xl shadow-navy-900/20">
                <div>
                  <h3 className="text-lg text-blue-200 font-semibold mb-1">Finaler Angebotspreis</h3>
                  <p className="text-sm text-slate-400">Brutto inkl. aller Nebenkosten (Barzahlung)</p>
                </div>
                <div className="text-4xl md:text-5xl font-black tracking-tight mt-4 md:mt-0 text-amber-400">
                  {finalPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Checkbox id="tos" className="scale-125 border-slate-300" />
                <Label htmlFor="tos" className="text-sm text-slate-500 leading-relaxed cursor-pointer">
                  Ich bestätige die Vertragsbedingungen. Diese Angaben sind rechtlich bindend. Bei Zustandekommen eines Vertrages berechnet proFleet eine Vermittlungspauschale.
                </Label>
              </div>

              {submitError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-semibold">
                  {submitError}
                </div>
              )}
            </div>

            {/* Actions Sticky Bar */}
            <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border border-slate-200 mt-4 sticky bottom-6 z-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button variant="outline" className="w-full sm:w-auto rounded-xl hover:bg-slate-100 h-14 px-6 text-slate-600 font-semibold text-lg border-slate-300">
                <Save className="mr-2" size={20} /> Entwurf speichern
              </Button>
              <Button
                onClick={handleSubmitOffer}
                disabled={submitting}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-blue-500/20 px-10 h-14 text-lg font-bold transition-transform hover:scale-105"
              >
                {submitting ? (
                  <><Loader2 className="animate-spin mr-2" size={20} /> Wird gesendet…</>
                ) : (
                  <><Mail className="mr-2" size={20} /> Angebot verbindlich abgeben</>
                )}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

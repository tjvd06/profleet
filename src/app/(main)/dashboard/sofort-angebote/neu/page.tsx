"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, CheckCircle2, CloudUpload, Key, Save, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";

export default function CreateInstantOfferPage() {
  const [method, setMethod] = useState<string>("configurator");
  const [quantity, setQuantity] = useState(1);
  const [duration, setDuration] = useState(14); // 7, 14, 30

  // Optional modales
  const [offerPurchase, setOfferPurchase] = useState(true);
  const [offerLeasing, setOfferLeasing] = useState(false);
  const [offerFinance, setOfferFinance] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Top Banner */}
      <div className="bg-navy-950 text-white py-4 sticky top-0 z-40 shadow-md">
        <div className="container mx-auto max-w-4xl px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/sofort-angebote">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-8 w-8">
                <ChevronLeft size={20} />
              </Button>
            </Link>
            <h1 className="font-bold text-lg md:text-xl">Neues Sofort-Angebot erstellen</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 md:px-8 py-8 md:py-12 space-y-10">
        
        {/* Method Selection */}
        <section>
          <h2 className="text-2xl font-bold text-navy-950 mb-6 border-b border-slate-200 pb-2">1. Konfigurations-Methode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => setMethod('configurator')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${method === 'configurator' ? 'border-blue-500 bg-blue-50/50 shadow-md ring-4 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <Key className={method === 'configurator' ? 'text-blue-600 mb-3' : 'text-slate-400 mb-3'} size={28} />
              <h3 className="font-bold text-navy-950">Manuelle Eingabe</h3>
              <p className="text-xs text-slate-500 mt-1">Geben Sie Marke, Modell und Pakete manuell ein.</p>
            </div>
            <div 
              onClick={() => setMethod('upload')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${method === 'upload' ? 'border-blue-500 bg-blue-50/50 shadow-md ring-4 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
               <CloudUpload className={method === 'upload' ? 'text-blue-600 mb-3' : 'text-slate-400 mb-3'} size={28} />
              <h3 className="font-bold text-navy-950">PDF Upload</h3>
              <p className="text-xs text-slate-500 mt-1">Lassen Sie unsere KI das Hersteller-PDF auslesen.</p>
            </div>
            <div 
              onClick={() => setMethod('saved')}
              className={`p-5 rounded-2xl border-2 cursor-pointer opacity-50 transition-all ${method === 'saved' ? 'border-blue-500 bg-blue-50/50 shadow-md ring-4 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
               <Save className={method === 'saved' ? 'text-blue-600 mb-3' : 'text-slate-400 mb-3'} size={28} />
              <h3 className="font-bold text-navy-950">Aus Vorlage</h3>
              <p className="text-xs text-slate-500 mt-1">Ein bereits gespeichertes Layout verwenden.</p>
            </div>
          </div>
        </section>

        {/* Vehicle Details */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-navy-950 mb-6">2. Fahrzeug-Datenbank</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-slate-700">Marke</Label>
              <Input placeholder="z.B. VW" className="rounded-xl h-12 bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold text-slate-700">Modell / Linie</Label>
              <Input placeholder="z.B. Tiguan R-Line" className="rounded-xl h-12 bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label className="text-base font-semibold text-slate-700">Specs Header (Kurz)</Label>
              <Input placeholder="z.B. 150 kW (204 PS) · Automatik · Diesel" className="rounded-xl h-12 bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold text-slate-700">Listenpreis Brutto (€)</Label>
              <Input type="number" placeholder="z.B. 53400" className="rounded-xl h-12 bg-slate-50 border-slate-200" />
            </div>
            <div className="space-y-3">
              <Label className="text-base font-semibold text-slate-700">Verfügbarkeit</Label>
              <select className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 focus:ring-2 focus:ring-blue-500 outline-none">
                <option>Sofort verfügbar (Lager)</option>
                <option>Im Zulauf (1-2 Wochen)</option>
                <option>Im Zulauf (3-4 Wochen)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Pricing & Offer Types */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-navy-950 mb-6">3. Preise & Konditionen</h2>
          <p className="text-slate-500 text-sm mb-8">Wählen Sie, auf welchen Wegen Kunden das Fahrzeug bei Ihnen beschaffen können. Mindestens ein Modus ist erforderlich.</p>
          
          <div className="space-y-8">
            {/* Purchase Form */}
            <div className="border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-100 px-4 py-2 rounded-bl-2xl">
                <Switch checked={offerPurchase} onCheckedChange={setOfferPurchase} className="scale-125" />
              </div>
              <h3 className={`font-bold text-lg mb-6 ${offerPurchase ? 'text-navy-950' : 'text-slate-400'}`}>Barkauf ermöglichen</h3>
              {offerPurchase && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                  <div className="space-y-3">
                    <Label>Nachlass in %</Label>
                    <Input type="number" placeholder="20.0" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Label>Daraus resultierender Aktionspreis (€)</Label>
                    <Input readOnly placeholder="z.B. 42.720" className="h-12 rounded-xl bg-slate-100 border-transparent font-bold" />
                  </div>
                </div>
              )}
            </div>

            {/* Leasing Form */}
            <div className="border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-100 px-4 py-2 rounded-bl-2xl">
                <Switch checked={offerLeasing} onCheckedChange={setOfferLeasing} className="scale-125" />
              </div>
              <h3 className={`font-bold text-lg mb-6 ${offerLeasing ? 'text-navy-950' : 'text-slate-400'}`}>Leasing ermöglichen</h3>
              {offerLeasing && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                  <div className="space-y-3">
                    <Label>Laufzeit (Monate)</Label>
                    <select className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4">
                      <option>36</option>
                      <option>48</option>
                      <option>24</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label>Kilometer p.a.</Label>
                    <select className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4">
                      <option>10.000 km</option>
                      <option>15.000 km</option>
                      <option>20.000 km</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label>Rate Netto p.M. (€)</Label>
                    <Input type="number" placeholder="z.B. 429" className="h-12 rounded-xl border-blue-200 focus-visible:ring-blue-500 font-bold" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Finance Form */}
            <div className="border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-slate-100 px-4 py-2 rounded-bl-2xl">
                <Switch checked={offerFinance} onCheckedChange={setOfferFinance} className="scale-125" />
              </div>
              <h3 className={`font-bold text-lg ${offerFinance ? 'text-navy-950' : 'text-slate-400'}`}>Finanzierung ermöglichen</h3>
            </div>
          </div>
        </section>

        {/* Quantity & Publish Options */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-100 to-transparent opacity-50 pointer-events-none" />
          
          <h2 className="text-xl font-bold text-navy-950 mb-8">4. Inventar & Veröffentlichung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Quantity Stepper */}
            <div>
              <Label className="text-base font-semibold text-slate-700 mb-3 block">Freie Stückzahl im Lager</Label>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full w-12 h-12 bg-slate-50 hover:bg-slate-100 text-slate-500"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus />
                </Button>
                <div className="text-3xl font-black text-navy-950 w-16 text-center">{quantity}</div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full w-12 h-12 bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus />
                </Button>
                <span className="text-slate-500 ml-2 font-medium">Fahrzeuge</span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <Label className="text-base font-semibold text-slate-700 mb-3 block">Sichtbarkeit Dauer (Tage)</Label>
              <div className="flex gap-3">
                {[7, 14, 30].map(days => (
                  <div 
                    key={days}
                    onClick={() => setDuration(days)}
                    className={`cursor-pointer px-6 py-3 rounded-2xl border-2 font-bold transition-all text-center
                      ${duration === days ? 'bg-navy-950 text-white border-navy-950 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}
                    `}
                  >
                    {days}
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Fees */}
            <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50">
                <div>
                  <Label className="text-base font-bold text-navy-950 block">Überführungs- & Abholkosten Brutto (€)</Label>
                  <span className="text-slate-500 text-xs">Werden dem Käufer als separate Pflichtgebühr angezeigt.</span>
                </div>
                <Input type="number" placeholder="z.B. 990" className="w-32 rounded-xl h-12 text-right text-lg font-bold focus-visible:ring-blue-500 bg-white" />
              </div>
            </div>

          </div>
        </section>

        {/* Sticky Actions */}
        <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border border-slate-200 sticky bottom-6 z-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button variant="outline" className="w-full sm:w-auto rounded-xl hover:bg-slate-100 h-14 px-8 text-slate-600 font-semibold text-lg border-slate-300">
            Als Entwurf speichern
          </Button>
          <Button className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-blue-500/20 px-10 h-14 text-lg font-bold transition-transform hover:scale-105">
            Inserat live schalten
          </Button>
        </div>

      </div>
    </div>
  );
}

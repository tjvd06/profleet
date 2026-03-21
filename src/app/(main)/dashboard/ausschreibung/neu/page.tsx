"use client";

import { useState } from "react";
import { WizardStepper } from "@/components/ui-custom/WizardStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ChevronLeft, Settings2, UploadCloud, ListChecks, CheckCircle2, PartyPopper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = ["Fahrzeug", "Details", "Leasing & Finanzen", "Lieferung", "Starten"];

export default function NewTenderWizard() {
  const [step, setStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    method: "configurator",
    brand: "",
    model: "",
    price: "",
    quantity: 1,
    fleetDiscount: false,
    fleetDiscountPercent: "",
    acceptOtherColor: false,
    types: { purchase: true, leasing: false, financing: false },
    zipCode: "",
    radius: "nationwide"
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handlePublish = () => {
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in fade-in zoom-in duration-500">
        <div className="w-28 h-28 bg-gradient-to-tr from-green-400 to-green-500 text-white rounded-[2rem] shadow-xl flex items-center justify-center mb-10 rotate-12 hover:rotate-0 transition-transform duration-500">
          <PartyPopper size={56} className="drop-shadow-md" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-navy-950 mb-6">Ihre Ausschreibung ist live!</h2>
        <p className="text-xl text-slate-500 max-w-lg mx-auto mb-12 leading-relaxed">Lehnen Sie sich zurück. Wir benachrichtigen Sie per E-Mail, sobald die ersten Angebote von unseren Händlern eintreffen.</p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button variant="outline" className="rounded-xl border-slate-200 h-14 px-8 text-lg font-semibold text-slate-600 hover:text-navy-950 hover:bg-slate-50">Zur Übersicht</Button>
          <Button className="rounded-xl bg-navy-900 hover:bg-navy-950 text-white h-14 px-8 text-lg font-semibold shadow-lg shadow-navy-900/20" onClick={() => { setIsSuccess(false); setStep(0); }}>Weitere Ausschreibung anlegen</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 min-h-screen">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-navy-950 mb-4 text-center">Neue Ausschreibung erstellen</h1>
        <WizardStepper steps={STEPS} currentStep={step} />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-12 mb-8 min-h-[450px]">
        { step === 0 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-navy-950 mb-8">Konfigurationsmethode wählen</h2>
            <RadioGroup 
              value={formData.method} 
              onValueChange={(v) => setFormData({ ...formData, method: v })}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              {[
                { id: "configurator", icon: Settings2, title: "Konfigurator", desc: "Schritt für Schritt" },
                { id: "upload", icon: UploadCloud, title: "Datei Upload", desc: "PDF, DOC, TXT" },
                { id: "min-specs", icon: ListChecks, title: "Zusammenfassung", desc: "Nur das Wichtigste" },
              ].map((opt) => (
                <div key={opt.id} className="relative">
                  <RadioGroupItem value={opt.id} id={opt.id} className="peer sr-only" />
                  <Label
                    htmlFor={opt.id}
                    className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 hover:border-blue-300 peer-data-[state=checked]:border-2 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:shadow-md transition-all text-center h-full group"
                  >
                    <div className="h-16 w-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white transition-colors">
                      <opt.icon size={28} className="text-slate-500 group-hover:text-blue-500 peer-data-[state=checked]:text-white transition-colors" />
                    </div>
                    <span className="font-bold text-navy-950 text-lg block mb-2">{opt.title}</span>
                    <span className="text-sm font-normal text-slate-500">{opt.desc}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <h3 className="text-xl font-bold text-navy-950 border-b border-slate-100 pb-3 mb-8">Fahrzeug Grunddaten</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-base text-slate-600 font-semibold">Marke</Label>
                <Input placeholder="z.B. Audi" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="rounded-xl h-12 bg-slate-50 border-slate-200 text-lg focus-visible:ring-blue-500" />
              </div>
              <div className="space-y-3">
                <Label className="text-base text-slate-600 font-semibold">Modell</Label>
                <Input placeholder="z.B. A4 Avant" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="rounded-xl h-12 bg-slate-50 border-slate-200 text-lg focus-visible:ring-blue-500" />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label className="text-base text-slate-600 font-semibold">Listenpreis Brutto (€)</Label>
                <Input type="number" placeholder="z.B. 45000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="rounded-xl h-12 bg-slate-50 border-slate-200 text-lg focus-visible:ring-blue-500 w-full md:w-1/2" />
              </div>
            </div>
            
            { formData.method === 'upload' && (
              <div className="mt-10 border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-3xl p-12 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer group">
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <UploadCloud size={32} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <h4 className="text-lg font-bold text-navy-900 mb-2">Konfiguration hochladen</h4>
                <p className="text-slate-500 text-sm mb-6 max-w-xs text-center">Ziehen Sie Ihre PDF, DOC oder TXT Datei in diesen Bereich oder klicken Sie hier.</p>
                <Button variant="outline" className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50">Datei auswählen</Button>
              </div>
            )}
          </div>
        )}

        { step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-navy-950 mb-8">Details & Vereinbarungen</h2>
            
            <Card className="mb-8 border-slate-200 shadow-none bg-slate-50/50 rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-lg font-bold text-navy-950 block mb-1">Anzahl identischer Fahrzeuge</Label>
                    <p className="text-base text-slate-500">Wie viele dieser Fahrzeuge benötigen Sie?</p>
                  </div>
                  <Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })} className="w-24 text-center font-bold text-xl rounded-xl h-14 bg-white border-slate-300 focus-visible:ring-blue-500" />
                </div>
                
                <div className="border-t border-slate-200 pt-8 flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-lg font-bold text-navy-950 block mb-1">Großkundenvertrag vorhanden</Label>
                    <p className="text-base text-slate-500">Haben Sie bereits verhandelte Konditionen beim Hersteller?</p>
                  </div>
                  <Switch checked={formData.fleetDiscount} onCheckedChange={(c) => setFormData({ ...formData, fleetDiscount: c })} className="scale-125" />
                </div>
                
                {formData.fleetDiscount && (
                  <div className="pt-4 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-base font-semibold text-blue-800 block mb-3">Rabatt in %</Label>
                    <Input placeholder="z.B. 15.5" className="rounded-xl h-14 text-lg border-blue-200 bg-blue-50/50 w-full md:w-1/3 focus-visible:ring-blue-500" value={formData.fleetDiscountPercent} onChange={(e) => setFormData({ ...formData, fleetDiscountPercent: e.target.value })} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-none bg-white rounded-3xl">
              <CardContent className="p-8 space-y-8">
                <h3 className="text-xl font-bold text-navy-950 border-b border-slate-100 pb-3">Alternative Angebote akzeptieren</h3>
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium text-slate-700 cursor-pointer">Andere Farbe akzeptabel</Label>
                  <Switch checked={formData.acceptOtherColor} onCheckedChange={(c) => setFormData({ ...formData, acceptOtherColor: c })} className="scale-110" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium text-slate-700 cursor-pointer">Höhere Ausstattung akzeptabel</Label>
                  <Switch defaultChecked className="scale-110" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium text-slate-700 cursor-pointer">Tageszulassung akzeptabel</Label>
                  <Switch className="scale-110" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        { step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-navy-950 mb-4">Leasing & Finanzierung</h2>
            <p className="text-lg text-slate-500 mb-10 leading-relaxed">Für welche Angebotsarten interessieren Sie sich? Händler können Ihnen individuelle Berechnungen für Ihre Auswahl erstellen.</p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 border-2 border-blue-100 bg-blue-50/40 rounded-3xl">
                <Checkbox id="purchase" checked={formData.types.purchase} disabled className="mt-1 scale-125 border-slate-300" />
                <div>
                  <Label htmlFor="purchase" className="font-bold text-navy-950 text-xl block mb-2 cursor-pointer">Barkauf (Immer aktiv)</Label>
                  <p className="text-base text-slate-600">Zur Vergleichbarkeit der Angebote wird der Barkaufpreis (Abholpreis) standardmäßig immer angefragt.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 border-2 border-slate-200 rounded-3xl data-[active=true]:border-blue-400 data-[active=true]:bg-blue-50/30 transition-all duration-300 shadow-sm" data-active={formData.types.leasing}>
                <Checkbox id="leasing" checked={formData.types.leasing} onCheckedChange={(c) => setFormData({ ...formData, types: { ...formData.types, leasing: c === true } })} className="mt-1 scale-125 border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" />
                <div className="w-full">
                  <Label htmlFor="leasing" className="font-bold text-navy-950 text-xl block cursor-pointer transition-colors">Leasing-Angebote einholen</Label>
                  {formData.types.leasing && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200">
                      <div className="space-y-3">
                        <Label className="text-slate-600 font-semibold text-base">Laufzeit</Label>
                        <select className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow">
                          <option>36 Monate</option>
                          <option>48 Monate</option>
                          <option>24 Monate</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-slate-600 font-semibold text-base">Laufleistung pro Jahr</Label>
                        <select className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow">
                          <option>10.000 km</option>
                          <option>15.000 km</option>
                          <option>20.000 km</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 border-2 border-slate-200 rounded-3xl data-[active=true]:border-blue-400 data-[active=true]:bg-blue-50/30 transition-all duration-300 shadow-sm" data-active={formData.types.financing}>
                <Checkbox id="financing" checked={formData.types.financing} onCheckedChange={(c) => setFormData({ ...formData, types: { ...formData.types, financing: c === true } })} className="mt-1 scale-125 border-slate-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" />
                <div className="w-full">
                  <Label htmlFor="financing" className="font-bold text-navy-950 text-xl block cursor-pointer transition-colors">Finanzierungs-Angebote einholen</Label>
                  {formData.types.financing && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-200">
                      <div className="space-y-3">
                        <Label className="text-slate-600 font-semibold text-base">Laufzeit</Label>
                        <select className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow">
                          <option>48 Monate</option>
                          <option>60 Monate</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-slate-600 font-semibold text-base">Gewerbliche Anzahlung (€)</Label>
                        <Input type="number" placeholder="z.B. 5000" className="rounded-xl h-12 bg-white border-slate-300 focus-visible:ring-blue-500 text-base" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        { step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-navy-950 mb-8">Auslieferung & Region</h2>
            
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 border border-slate-100 rounded-3xl">
                <div className="space-y-3">
                  <Label className="text-base text-slate-700 font-semibold">PLZ Auslieferung</Label>
                  <Input placeholder="z.B. 80331" value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} className="rounded-xl text-xl font-bold h-14 bg-white border-slate-300 focus-visible:ring-blue-500" />
                </div>
                <div className="space-y-3">
                  <Label className="text-base text-slate-700 font-semibold">Ort (Autom. erkannt)</Label>
                  <Input placeholder="Ort" className="rounded-xl text-xl font-semibold h-14 bg-slate-100 border-transparent text-slate-500" readOnly value={formData.zipCode.length >= 5 ? "München" : ""} />
                </div>
              </div>

              <div>
                <Label className="text-xl font-bold text-navy-950 mb-6 block">In welchem Radius sollen wir Händler anfragen?</Label>
                <RadioGroup 
                  value={formData.radius} 
                  onValueChange={(v) => setFormData({ ...formData, radius: v })}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-4 p-6 border-2 border-blue-200 bg-blue-50/40 rounded-3xl relative overflow-hidden transition-all hover:bg-blue-50/60 cursor-pointer">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[11px] uppercase tracking-wider font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">Empfohlen</div>
                    <RadioGroupItem value="nationwide" id="r-nationwide" className="scale-125 border-slate-400" />
                    <Label htmlFor="r-nationwide" className="font-bold text-navy-950 text-lg cursor-pointer flex-grow pl-2">
                      Bundesweit 
                      <span className="text-slate-500 font-normal block text-sm mt-1.5 leading-relaxed">Maximale Ersparnis durch den größten Händler-Pool in ganz Deutschland.</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-4 p-6 border-2 border-slate-200 rounded-3xl transition-all hover:bg-slate-50 cursor-pointer data-[state=checked]:border-blue-500">
                    <RadioGroupItem value="local" id="r-local" className="scale-125 border-slate-400" />
                    <Label htmlFor="r-local" className="font-bold text-navy-950 text-lg cursor-pointer flex-grow pl-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <span>Lokal im Umkreis</span>
                      {formData.radius === 'local' && (
                        <select className="h-12 w-full md:w-64 rounded-xl border border-slate-300 bg-white px-4 text-base focus:ring-2 focus:ring-blue-500 outline-none animate-in fade-in">
                          <option>50 km Umgebung</option>
                          <option>100 km Umgebung</option>
                          <option>200 km Umgebung</option>
                        </select>
                      )}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Card className="border-green-200 bg-green-50 rounded-2xl">
                <CardContent className="p-6 flex gap-5">
                  <CheckCircle2 size={24} className="text-green-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-900 text-lg mb-1">Inklusivleistungen sind Standard</h4>
                    <p className="text-base text-green-800/80 leading-relaxed">Alle Preise auf unserer Plattform verstehen sich als garantierte Abholpreise für das fertig zugelassene Fahrzeug (inklusive Überführung, Übergabeinspektion und amtlichen Zulassungskosten).</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        { step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-bold text-navy-950 mb-8 border-b border-slate-100 pb-6">Zusammenfassung prüfen & Veröffentlichen</h2>
            
            <div className="bg-white border-2 border-slate-100 shadow-sm rounded-3xl p-8 mb-10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 to-transparent opacity-50 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row justify-between md:items-start border-b border-slate-200 pb-6 mb-6 gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-navy-950 mb-2">{formData.brand || 'Marke'} {formData.model || 'Modell'}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-slate-500">Listenpreis: <span className="font-semibold text-navy-900">{formData.price ? `${parseInt(formData.price).toLocaleString('de-DE')} €` : 'N/A'}</span></span>
                  </div>
                </div>
                <div className="bg-blue-50 text-blue-700 font-bold px-4 py-2 rounded-xl text-lg shrink-0 border border-blue-100">
                  {formData.quantity} Fahrzeug{formData.quantity > 1 ? 'e' : ''}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Methode</dt>
                  <dd className="font-bold text-navy-950 text-lg">{formData.method === 'configurator' ? 'Konfigurator' : formData.method === 'upload' ? 'Datei-Upload' : 'Mindestausstattung'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Angebotsarten</dt>
                  <dd className="font-bold text-navy-950 text-lg flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg whitespace-nowrap">Kauf</span>
                    {formData.types.leasing && <span className="px-3 py-1 bg-slate-100 rounded-lg whitespace-nowrap">Leasing</span>}
                    {formData.types.financing && <span className="px-3 py-1 bg-slate-100 rounded-lg whitespace-nowrap">Finanz.</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Lieferort</dt>
                  <dd className="font-bold text-navy-950 text-lg">{formData.zipCode || 'Nicht angegeben'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Ausschreibungsradius</dt>
                  <dd className="font-bold text-navy-950 text-lg">{formData.radius === 'nationwide' ? 'Bundesweit' : 'Lokal'}</dd>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
              <h3 className="text-xl font-bold text-navy-950 mb-6">Wie lange soll die Ausschreibung laufen?</h3>
              <RadioGroup defaultValue="14" className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex items-center p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all [&:has([data-state=checked])]:border-blue-500 [&:has([data-state=checked])]:bg-blue-50">
                  <RadioGroupItem value="7" id="p-7" className="scale-125 mr-4" />
                  <Label htmlFor="p-7" className="text-lg font-bold cursor-pointer w-full">7 Tage</Label>
                </div>
                <div className="flex-1 flex flex-col justify-center p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all [&:has([data-state=checked])]:border-blue-500 [&:has([data-state=checked])]:bg-blue-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">Empfohlen</div>
                  <div className="flex items-center">
                    <RadioGroupItem value="14" id="p-14" className="scale-125 mr-4" />
                    <Label htmlFor="p-14" className="text-lg font-bold cursor-pointer w-full text-blue-700">14 Tage</Label>
                  </div>
                </div>
                <div className="flex-1 flex items-center p-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all [&:has([data-state=checked])]:border-blue-500 [&:has([data-state=checked])]:bg-blue-50">
                  <RadioGroupItem value="30" id="p-30" className="scale-125 mr-4" />
                  <Label htmlFor="p-30" className="text-lg font-bold cursor-pointer w-full">30 Tage</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-[2rem] border border-slate-200 shadow-xl sticky bottom-6 z-50">
        <Button variant="ghost" onClick={prevStep} disabled={step === 0} className="rounded-xl text-slate-500 hover:text-navy-950 font-semibold text-base h-12 px-6">
          <ChevronLeft className="mr-2" size={18} /> Zurück
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={nextStep} className="rounded-xl bg-navy-800 hover:bg-navy-950 text-white shadow-lg h-12 px-10 text-lg font-bold transition-all hover:pr-8 hover:pl-12 group">
            Weiter <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
          </Button>
        ) : (
          <Button onClick={handlePublish} className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/30 h-14 px-10 text-lg font-bold transition-transform hover:scale-105 active:scale-95 group">
            Jetzt veröffentlichen <CheckCircle2 className="ml-3 drop-shadow-sm" size={22} />
          </Button>
        )}
      </div>
    </div>
  );
}

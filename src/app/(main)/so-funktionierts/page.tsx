"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CarFront, FileText, BarChart3, MessageCircle, Star,
  Settings, Handshake, Zap, ArrowRight, ShieldCheck, CheckCircle2,
  Search, Package, UserPlus, Crown
} from "lucide-react";
import Link from "next/link";
import { HeroSection } from "@/components/ui-custom/HeroSection";

const buyerSteps = [
  {
    icon: <Settings size={32} className="text-blue-600" />,
    title: "1. Konfigurieren",
    description: "Erstellen Sie Ihr Wunschfahrzeug in unserem detaillierten Online-Konfigurator — passgenau für Ihren Fuhrpark."
  },
  {
    icon: <FileText size={32} className="text-blue-600" />,
    title: "2. Ausschreibung starten",
    description: "Nutzen Sie Ihre Konfiguration als Basis für eine Ausschreibung. Bestimmen Sie Volumen, Vertragsart (Kauf/Leasing/Finanzierung) und Lieferort."
  },
  {
    icon: <BarChart3 size={32} className="text-blue-600" />,
    title: "3. Angebote vergleichen",
    description: "Lehnen Sie sich zurück. Das System benachrichtigt Händler in Ihrer Region, und Sie erhalten vergleichbare, verbindliche Bestpreis-Angebote."
  },
  {
    icon: <Handshake size={32} className="text-blue-600" />,
    title: "4. Anfrage senden",
    description: "Wählen Sie das attraktivste Angebot aus und senden Sie eine Anfrage. Alle Händlerdaten sind bereits sichtbar, sodass Sie fundiert entscheiden können."
  },
  {
    icon: <Star size={32} className="text-blue-600" />,
    title: "5. Bewerten",
    description: "Nach erfolgreichem Abschluss bewerten Sie den Händler, um die Plattform transparent und professionell für alle zu halten."
  }
];

const dealerSteps = [
  {
    icon: <UserPlus size={32} className="text-navy-900" />,
    title: "1. Registrieren & Abo wählen",
    description: "Erstellen Sie Ihr Händlerprofil und wählen Sie das passende Abo — vom kostenlosen Starter-Paket bis zum Premium-Tarif mit unbegrenzten Möglichkeiten."
  },
  {
    icon: <Zap size={32} className="text-navy-900" />,
    title: "2. Ausschreibungen erhalten",
    description: "Sie werden automatisch über fabrikatsbezogene Anfragen aus Ihrer Region informiert, passend zu Ihrem Profil und Ihren Marken."
  },
  {
    icon: <FileText size={32} className="text-navy-900" />,
    title: "3. Angebot erstellen",
    description: "Mit unserem digitalen Wizard kalkulieren Sie in Sekunden Ihr Gegenangebot. Ihr Angebot tritt im Ranking gegen Wettbewerber an."
  },
  {
    icon: <MessageCircle size={32} className="text-navy-900" />,
    title: "4. Kundenkontakt",
    description: "Entscheidet sich der Interessent für Ihr Angebot, erhalten Sie die Kontaktdaten. Nur bei erfolgreicher Vermittlung wird eine Gebühr von 30\u00A0€ fällig."
  },
  {
    icon: <CarFront size={32} className="text-navy-900" />,
    title: "5. Sofort-Angebote einstellen",
    description: "Zusätzlich zu Ausschreibungen listen Sie Lagerfahrzeuge, Vorführwagen oder Tageszulassungen direkt auf dem Marktplatz — mit Festpreis, sofort sichtbar für Käufer."
  }
];

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"buyer" | "dealer">("buyer");

  return (
    <div className="bg-slate-50 min-h-screen">
      <HeroSection
        badge="Der proFleet Prozess"
        badgeIcon={<Settings size={14} />}
        title="So einfach funktioniert's"
        subtitle="Von der Konfiguration bis zum abgeschlossenen Vertrag — oder direkt zum verfügbaren Fahrzeug. Entdecken Sie den perfekten Ablauf für Einkäufer und Händler."
      />

      <div className="container mx-auto max-w-5xl px-4 md:px-8 pt-12">

        {/* Tabs */}
        <div className="w-full">
          <div className="flex justify-center mb-16">
            <div className="flex w-full max-w-md p-1.5 rounded-full bg-slate-200/50 shadow-inner">
              <button
                onClick={() => setActiveTab("buyer")}
                className={`flex-1 rounded-full py-3 font-bold text-base transition-all duration-300 ${
                  activeTab === "buyer"
                    ? "bg-white text-blue-600 shadow-md scale-100"
                    : "text-slate-500 hover:text-slate-700 scale-[0.98]"
                }`}
              >
                Für Nachfrager
              </button>
              <button
                onClick={() => setActiveTab("dealer")}
                className={`flex-1 rounded-full py-3 font-bold text-base transition-all duration-300 ${
                  activeTab === "dealer"
                    ? "bg-navy-950 text-white shadow-md scale-100"
                    : "text-slate-500 hover:text-slate-700 scale-[0.98]"
                }`}
              >
                Für Händler
              </button>
            </div>
          </div>

          {/* ===================== BUYER TAB ===================== */}
          {activeTab === "buyer" && (
            <div className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-100 via-blue-200 to-transparent -translate-x-1/2 hidden md:block rounded-full" />

            <div className="space-y-12 md:space-y-24">
              {buyerSteps.map((step, idx) => {
                const isEven = idx % 2 !== 0;
                return (
                  <div key={idx} className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    {/* Node in center */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-4 border-blue-500 shadow-md hidden md:flex items-center justify-center font-black text-blue-600 z-10">
                      {idx + 1}
                    </div>

                    {/* Content Card */}
                    <div className={`w-full md:w-1/2 flex ${isEven ? 'justify-start md:pl-8' : 'justify-end md:pr-8'}`}>
                      <Card className="p-8 rounded-3xl border-transparent bg-white shadow-xl shadow-slate-200/40 w-full hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                          {step.icon}
                        </div>
                        <h3 className="text-2xl font-black text-navy-950 mb-3">{step.title}</h3>
                        <p className="text-slate-500 leading-relaxed font-medium">{step.description}</p>
                      </Card>
                    </div>
                    {/* Empty placeholder for grid balance on desktop */}
                    <div className="hidden md:block w-1/2" />
                  </div>
                );
              })}
            </div>

            {/* Sofort-Angebote Section for Buyers */}
            <div className="mt-24 max-w-3xl mx-auto">
              <Card className="p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-16 -top-16 opacity-10 blur-sm pointer-events-none">
                  <Package size={260} />
                </div>
                <div className="relative z-10">
                  <Badge className="bg-white/20 text-white border-white/20 mb-6 font-bold text-sm">
                    <Zap size={14} className="mr-1" /> Alternative
                  </Badge>
                  <h3 className="text-3xl font-black mb-4">Sofort-Angebote: Direkt verfügbare Fahrzeuge</h3>
                  <p className="text-blue-100 font-medium leading-relaxed mb-8">
                    Keine Zeit für eine Ausschreibung? Durchstöbern Sie unseren Marktplatz mit sofort verfügbaren
                    Lagerfahrzeugen, Vorführwagen und Tageszulassungen — mit transparenten Festpreisen und direkter Kontaktaufnahme zum Händler.
                  </p>
                  <ul className="space-y-3 mb-10 text-blue-100">
                    <li className="flex gap-3 items-start font-medium">
                      <CheckCircle2 className="text-emerald-300 shrink-0 mt-0.5" size={20} />
                      Sofort verfügbare Fahrzeuge — keine Wartezeit auf Angebote
                    </li>
                    <li className="flex gap-3 items-start font-medium">
                      <CheckCircle2 className="text-emerald-300 shrink-0 mt-0.5" size={20} />
                      Feste Preise mit Rabatt gegenüber der UVP — transparent einsehbar
                    </li>
                    <li className="flex gap-3 items-start font-medium">
                      <CheckCircle2 className="text-emerald-300 shrink-0 mt-0.5" size={20} />
                      Filtern nach Marke, Modell, Ausstattung, Standort und Preis
                    </li>
                    <li className="flex gap-3 items-start font-medium">
                      <CheckCircle2 className="text-emerald-300 shrink-0 mt-0.5" size={20} />
                      Kauf, Leasing oder Finanzierung — alle Optionen direkt vergleichbar
                    </li>
                  </ul>
                  <Link href="/sofort-angebote">
                    <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold h-14 px-8 rounded-2xl shadow-lg">
                      Sofort-Angebote durchstöbern <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Fair-Play Rules */}
            <div className="mt-12 max-w-3xl mx-auto">
              <Card className="p-8 md:p-12 rounded-[2.5rem] bg-navy-950 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-20 -top-20 opacity-10 blur-sm pointer-events-none">
                  <ShieldCheck size={300} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-6">Fair-Play Regeln</h3>
                  <ul className="space-y-4 mb-10 text-slate-300">
                    <li className="flex gap-3 items-start font-medium">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-1" size={20} />
                      Die Nutzung von proFleet ist für einkaufende Unternehmen zu 100% kostenlos — Ausschreibungen und Sofort-Angebote inklusive.
                    </li>
                    <li className="flex gap-3 items-start font-medium">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-1" size={20} />
                      Alle Händlerdaten sind von Anfang an sichtbar — vollständige Transparenz für fundierte Entscheidungen.
                    </li>
                    <li className="flex gap-3 items-start font-medium">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-1" size={20} />
                      Fake-Anfragen werden über unser internes Ratingsystem sanktioniert, um den Markt professionell zu halten.
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/registrieren">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-2xl w-full sm:w-auto shadow-lg shadow-blue-500/25">
                        Jetzt kostenlos registrieren <ArrowRight className="ml-2" size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
            </div>
          )}

          {/* ===================== DEALER TAB ===================== */}
          {activeTab === "dealer" && (
            <div className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full relative">
            <div className="absolute left-1/2 top-0 bottom-[400px] w-1 bg-gradient-to-b from-slate-200 via-slate-300 to-transparent -translate-x-1/2 hidden md:block rounded-full" />

            <div className="space-y-12 md:space-y-24 mb-24">
              {dealerSteps.map((step, idx) => {
                const isEven = idx % 2 !== 0;
                return (
                  <div key={idx} className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border-4 border-navy-950 shadow-md hidden md:flex items-center justify-center font-black text-navy-950 z-10">
                      {idx + 1}
                    </div>

                    <div className={`w-full md:w-1/2 flex ${isEven ? 'justify-start md:pl-8' : 'justify-end md:pr-8'}`}>
                      <Card className="p-8 rounded-3xl border-slate-200 bg-white shadow-xl shadow-slate-200/40 w-full hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                          {step.icon}
                        </div>
                        <h3 className="text-2xl font-black text-navy-950 mb-3">{step.title}</h3>
                        <p className="text-slate-500 leading-relaxed font-medium">{step.description}</p>

                        {/* Subscription hint on step 1 */}
                        {idx === 0 && (
                          <div className="mt-6 flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs font-bold border-slate-300 text-slate-600">Starter — kostenlos</Badge>
                            <Badge variant="outline" className="text-xs font-bold border-blue-300 text-blue-600">Pro — 99€/Monat</Badge>
                            <Badge variant="outline" className="text-xs font-bold border-amber-300 text-amber-700">Premium — 249€/Monat</Badge>
                          </div>
                        )}

                        {/* Cost hint on step 4 */}
                        {idx === 3 && (
                          <div className="mt-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl font-bold flex items-center gap-3 border border-emerald-100 text-sm">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                            Kosten fallen nur bei erfolgreicher Vermittlung (30€) an.
                          </div>
                        )}

                        {/* Sofort-Angebote explainer on step 5 */}
                        {idx === 4 && (
                          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-2xl font-bold flex items-center gap-3 border border-blue-100 text-sm">
                            <Package size={18} className="text-blue-500" />
                            Je nach Abo bis zu unbegrenzt viele Inserate gleichzeitig aktiv.
                          </div>
                        )}
                      </Card>
                    </div>
                    <div className="hidden md:block w-1/2" />
                  </div>
                );
              })}
            </div>

            {/* Sofort-Angebote Deep Dive for Dealers */}
            <div className="mt-12 max-w-3xl mx-auto">
              <Card className="p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-navy-950 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-16 -top-16 opacity-10 blur-sm pointer-events-none">
                  <CarFront size={260} />
                </div>
                <div className="relative z-10">
                  <Badge className="bg-white/15 text-white border-white/20 mb-6 font-bold text-sm">
                    <Package size={14} className="mr-1" /> Marktplatz
                  </Badge>
                  <h3 className="text-3xl font-black mb-4">Sofort-Angebote: Ihr digitales Schaufenster</h3>
                  <p className="text-slate-300 font-medium leading-relaxed mb-8">
                    Neben Ausschreibungen bietet proFleet Ihnen einen vollwertigen Marktplatz für sofort verfügbare Fahrzeuge.
                    Listen Sie Lagerfahrzeuge, Vorführwagen und Tageszulassungen mit Festpreis — Käufer finden Sie über Suche und Filter.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                      <span className="text-slate-300 font-medium text-sm">Lagerfahrzeuge mit allen Ausstattungsdetails präsentieren</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                      <span className="text-slate-300 font-medium text-sm">Kauf-, Leasing- und Finanzierungspreise hinterlegen</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                      <span className="text-slate-300 font-medium text-sm">Vorführwagen und Tageszulassungen vermarkten</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                      <span className="text-slate-300 font-medium text-sm">Bilder und Konfigurationsdokumente hochladen</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Pricing & Subscription Area */}
            <div className="mt-12 max-w-3xl mx-auto text-center">
              <h3 className="text-3xl md:text-4xl font-black text-navy-950 mb-6">Abo-Modelle & Preise</h3>
              <p className="text-lg text-slate-500 font-medium mb-12">
                Starten Sie kostenlos und skalieren Sie mit Ihrem Geschäft. Zusätzlich zahlen Sie 30€ pro vermitteltem Kontakt bei Ausschreibungen.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left">
                <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm">
                  <div className="mb-4">
                    <h4 className="font-black text-navy-950 text-lg">Starter</h4>
                    <p className="text-2xl font-black text-navy-950 mt-1">Kostenlos</p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-500 font-medium">
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      Max. 3 Angebote / Monat
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      1 aktives Sofort-Angebot
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 rounded-3xl border-blue-200 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20">
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-navy-950 text-lg">Pro</h4>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-bold">Beliebt</Badge>
                    </div>
                    <p className="text-2xl font-black text-navy-950 mt-1">99€ <span className="text-sm font-bold text-slate-400">/ Monat</span></p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-500 font-medium">
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      Unbegrenzte Angebote
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      Bis zu 10 Sofort-Angebote
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      E-Mail-Benachrichtigungen
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      Statistik-Dashboard
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 rounded-3xl border-amber-200 bg-amber-50/30 shadow-sm">
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-navy-950 text-lg">Premium</h4>
                      <Crown size={16} className="text-amber-500" />
                    </div>
                    <p className="text-2xl font-black text-navy-950 mt-1">249€ <span className="text-sm font-bold text-slate-400">/ Monat</span></p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-500 font-medium">
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      Alles aus Pro
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      Unbegrenzte Sofort-Angebote
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      Bevorzugte Platzierung
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      Erweiterte Marktanalysen
                    </li>
                    <li className="flex gap-2 items-start">
                      <CheckCircle2 size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      Persönlicher Support
                    </li>
                  </ul>
                </Card>
              </div>

              <div className="flex justify-center">
                <Link href="/fuer-haendler">
                  <Button size="lg" className="bg-navy-950 hover:bg-navy-900 text-white font-bold h-14 px-10 rounded-2xl w-full sm:w-auto shadow-lg shadow-navy-900/25">
                    Mehr Details zur Anbieter-Registrierung
                  </Button>
                </Link>
              </div>
            </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

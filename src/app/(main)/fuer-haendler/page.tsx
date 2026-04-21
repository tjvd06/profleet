"use client";

import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { 
  Building2, Globe, TrendingUp, Handshake, Star, 
  MapPin, CheckCircle2, ArrowRight, ShieldCheck, Zap
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { HeroSection } from "@/components/ui-custom/HeroSection";

export default function ForDealersLandingPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* 1. HERO SECTION */}
      <HeroSection
        badge="Der B2B Leasing Marktplatz"
        badgeIcon={<Building2 size={14} />}
        title={<>Mehr Reichweite. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Null Risiko für Sie.</span></>}
        subtitle="proFleet verbindet deutsche Vertragshändler mit einem gigantischen Netzwerk an B2B-Flottenmanagern und KMUs, die konkret nach Fahrzeugen suchen."
      >
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-16">
          <Button size="lg" className="bg-white text-navy-950 hover:bg-slate-100 font-black h-14 px-8 rounded-2xl shadow-xl shadow-black/20">
            Jetzt als Anbieter registrieren
          </Button>
          <Button size="lg" variant="outline" className="border-blue-400/30 text-white hover:bg-blue-500/20 hover:text-white font-bold h-14 px-8 rounded-2xl bg-transparent backdrop-blur-md">
            Pricing ansehen
          </Button>
        </div>

        {/* Hero Sub-Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12 w-full max-w-4xl text-left">
          <div>
            <div className="text-3xl font-black text-white mb-1">10.000+</div>
            <div className="text-sm text-blue-200/70 font-bold uppercase tracking-widest">Kombinierte Leads/Monat</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white mb-1">~ 12h</div>
            <div className="text-sm text-blue-200/70 font-bold uppercase tracking-widest">Ø Zeit für Gegengebot</div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400 mb-1">0 €</div>
            <div className="text-sm text-blue-200/70 font-bold uppercase tracking-widest">Starter kostenlos</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white mb-1">98%</div>
            <div className="text-sm text-blue-200/70 font-bold uppercase tracking-widest">Händler Zufriedenheit</div>
          </div>
        </div>
      </HeroSection>

      {/* 2. ADVANTAGES FEATURE GRID */}
      <section className="py-24 container mx-auto max-w-6xl px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-navy-950 mb-4">Warum proFleet?</h2>
          <p className="text-lg text-slate-500 font-medium">Ihre Vertriebskanäle in den B2B Markt, ohne kaltes Telefonieren.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-8 rounded-3xl border-transparent bg-white shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Globe size={28} />
            </div>
            <h3 className="text-xl font-bold text-navy-950 mb-3">Bundesweite Reichweite</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Erhalten Sie Ausschreibungen von Unternehmen aus dem gesamten Bundesgebiet, ohne vor Ort präsent sein zu müssen.
            </p>
          </Card>

          <Card className="p-8 rounded-3xl border-transparent bg-white shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-navy-950 mb-3">Flexibles Abo-Modell</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Starten Sie kostenlos mit dem Starter-Tarif. Upgraden Sie bei Bedarf auf Pro (99 €/Monat) oder Premium (249 €/Monat) fuer mehr Funktionen.
            </p>
          </Card>

          <Card className="p-8 rounded-3xl border-transparent bg-white shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
              <Zap size={28} />
            </div>
            <h3 className="text-xl font-bold text-navy-950 mb-3">Einfache Angebotserstellung</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Dank standardisierter Formulare erstellen Sie Bestpreis-Angebote oder inserieren Tageszulassungen in unter 2 Minuten.
            </p>
          </Card>

          <Card className="p-8 rounded-3xl border-transparent bg-white shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Star size={28} />
            </div>
            <h3 className="text-xl font-bold text-navy-950 mb-3">Faires Bewertungssystem</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Punkten Sie durch Leistung. Zeigen Sie Käufern durch Ihren 5-Sterne-Score, dass Sie ein exzellenter und verlässlicher Partner sind.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. TESTIMONIALS */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-navy-950 mb-4">Das sagen unsere Partner</h2>
            <p className="text-lg text-slate-500 font-medium">Referenzen, die für sich sprechen.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 rounded-3xl border-slate-200 bg-slate-50">
              <div className="flex text-amber-400 mb-6">
                {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="text-navy-950 font-medium italic mb-8 leading-relaxed">
                "Dank proFleet konnten wir unseren B2B Leasing Absatz im letzten Quartal um 40% verdoppeln. Der Aufwand pro Pitch hat sich massiv reduziert."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center font-bold text-white">MK</div>
                <div>
                  <div className="font-bold text-navy-950">Max Krüger</div>
                  <div className="text-sm text-slate-500">Fleet Manager, Autozentrum Krüger</div>
                </div>
              </div>
            </Card>

            <Card className="p-8 rounded-3xl border-slate-200 bg-slate-50">
              <div className="flex text-amber-400 mb-6">
                {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="text-navy-950 font-medium italic mb-8 leading-relaxed">
                "Das Abo-Modell ist super fair und transparent. Besonders die Qualitaet der Anfragen ist immens hoch — das Pro-Abo hat sich fuer uns sofort gelohnt."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white">SW</div>
                <div>
                  <div className="font-bold text-navy-950">Sarah Weber</div>
                  <div className="text-sm text-slate-500">Vertriebsleitung, Audi Zentrum Süd</div>
                </div>
              </div>
            </Card>

            <Card className="p-8 rounded-3xl border-slate-200 bg-slate-50">
              <div className="flex text-amber-400 mb-6">
                {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="text-navy-950 font-medium italic mb-8 leading-relaxed">
                "Das Sofort-Angebote Feature hilft uns enorm, unsere Tageszulassungen schnell an Gewerbetreibende deutschlandweit loszuwerden."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white">LM</div>
                <div>
                  <div className="font-bold text-navy-950">Lukas Meyer</div>
                  <div className="text-sm text-slate-500">Inhaber, Auto Meyer GmbH</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-24 container mx-auto max-w-3xl px-4 md:px-8">
        <div className="text-center mb-16">
          <Badge className="bg-slate-200 text-slate-600 border-none font-bold mb-4">FAQ</Badge>
          <h2 className="text-3xl md:text-5xl font-black text-navy-950 mb-4">Noch Fragen?</h2>
        </div>

        <Accordion className="w-full bg-white rounded-3xl border border-slate-200 p-2 shadow-sm">
          <AccordionItem value="item-1" className="border-b-0 px-4">
            <AccordionTrigger className="text-lg font-bold text-navy-950 hover:no-underline py-6">Ist die Registrierung kostenlos?</AccordionTrigger>
            <AccordionContent className="text-slate-500 font-medium text-base leading-relaxed pb-6">
              Ja, mit dem Starter-Tarif ist die Nutzung komplett kostenlos. Sie koennen bis zu 3 Angebote pro Monat abgeben und 1 Sofort-Angebot aktiv halten — ohne Kreditkarte.
            </AccordionContent>
          </AccordionItem>
          <div className="h-px bg-slate-100 mx-4" />
          <AccordionItem value="item-2" className="border-b-0 px-4">
            <AccordionTrigger className="text-lg font-bold text-navy-950 hover:no-underline py-6">Wann entstehen Kosten?</AccordionTrigger>
            <AccordionContent className="text-slate-500 font-medium text-base leading-relaxed pb-6">
              Mit dem Pro-Abo (99 €/Monat netto) erhalten Sie unbegrenzte Angebote, bis zu 10 Sofort-Angebote, E-Mail-Benachrichtigungen und ein Statistik-Dashboard. Das Premium-Abo (249 €/Monat netto) bietet zusaetzlich bevorzugte Platzierung, erweiterte Statistiken und persoenlichen Support.
            </AccordionContent>
          </AccordionItem>
          <div className="h-px bg-slate-100 mx-4" />
          <AccordionItem value="item-3" className="border-b-0 px-4">
            <AccordionTrigger className="text-lg font-bold text-navy-950 hover:no-underline py-6">Sind die Anfragen geprüft?</AccordionTrigger>
            <AccordionContent className="text-slate-500 font-medium text-base leading-relaxed pb-6">
              Absolut. Alle einkaufenden Unternehmen müssen sich verifizieren lassen (Handelsregister etc.), bevor sie Ausschreibungen starten können. Wir sperren zudem Käufer rigoros, die nach aufgedeckten Kontaktdaten den Vertragsabschluss systematisch verweigern.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* 5. BOTTOM CTA */}
      <section className="bg-navy-950 text-white py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-blue-600/30 blur-[120px] pointer-events-none rounded-full" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8">Starten Sie jetzt durch.</h2>
          <p className="text-xl text-blue-100/80 mb-12 max-w-2xl mx-auto">
            Registrieren Sie Ihr Autohaus in 3 Minuten und stellen Sie sofort Ihre ersten Angebote ein.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-black h-16 px-12 rounded-2xl shadow-xl shadow-blue-500/20 text-lg">
            Kostenlos registrieren
          </Button>
        </div>
      </section>

    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs uppercase tracking-widest ${className || ''}`}>
      {children}
    </span>
  );
}

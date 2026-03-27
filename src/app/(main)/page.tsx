import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/tenders/VehicleCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Star, Zap } from "lucide-react";

const mockSavings = [
  { brand: 'Audi', model: 'A4 Avant RS4', specs: '420 PS · shadowgrey metallic', listPrice: 89138, finalPrice: 75411, savings: 15.4, dealerRating: 95, location: 'München · 100 km' },
  { brand: 'BMW', model: '530d xDrive', specs: '286 PS · saphirschwarz', listPrice: 75200, finalPrice: 63920, savings: 15.0, leasing: 499, dealerRating: 88, location: 'Berlin · 50 km' },
  { brand: 'Mercedes-Benz', model: 'C 300 e T-Modell', specs: '313 PS · hightechsilber', listPrice: 62500, finalPrice: 53125, savings: 15.0, dealerRating: 98, location: 'Hamburg · 20 km' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-navy-950 px-4 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-navy-950 to-navy-950" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

        <div className="container relative mx-auto max-w-7xl flex flex-col items-center text-center">
          <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 mb-8 px-4 py-1.5 text-sm">
            Soon Coming<Zap size={14} className="inline ml-1 text-cyan-400" />
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl" style={{ fontFamily: 'var(--font-heading)' }}>
            Neuwagen einkaufen wie die Großen.
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
            Die Ausschreibungsplattform für Unternehmen. Konfigurieren Sie Ihr Wunschauto, erhalten Sie Top-Angebote von Händlern aus ganz Deutschland — kostenlos und transparent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button size="lg" className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 text-white font-semibold px-8 h-14 text-lg">
              Jetzt Ausschreibung starten
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 h-14 px-8 text-lg backdrop-blur-sm">
              So funktioniert's
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-slate-400 text-sm font-medium">
            <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Kostenlos für Nachfrager</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Über 2.500 verifizierte Händler</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Ø 14% Ersparnis</span>
          </div>
        </div>
      </section>

      {/* 2. Logos/Social Proof */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="container mx-auto max-w-7xl text-center px-4">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">Vertraut von innovativen Unternehmen</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logo placeholders */}
            <div className="text-xl font-bold font-mono">COMPANY A</div>
            <div className="text-xl font-bold font-mono">ENTERPRISE B</div>
            <div className="text-xl font-bold font-mono">STARTUP C</div>
            <div className="text-xl font-bold font-mono">GROUP D</div>
          </div>
        </div>
      </section>

      {/* 3. So funktioniert's */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-navy-950 mb-4">In 3 Schritten zum Bestpreis</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Einfach, transparent und unverbindlich. So beschaffen clevere Flottenmanager heute Fahrzeuge.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Fahrzeug konfigurieren', desc: 'Wählen Sie Marke, Modell und Ausstattung — oder laden Sie eine fertige Konfiguration hoch.' },
              { step: 2, title: 'Angebote erhalten', desc: 'Händler aus ganz Deutschland bieten auf Ihre Ausschreibung. Alle Daten sind sofort sichtbar.' },
              { step: 3, title: 'Bestes Angebot wählen', desc: 'Vergleichen Sie Preise, Leasing- und Finanzierungsraten. Kontaktieren Sie Ihren Wunschhändler.' }
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative group hover:shadow-md transition-shadow">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-navy-950 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Aktuelle Ersparnisse */}
      <section className="bg-white py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-950 mb-4">Aktuelle Ersparnisse auf proFleet <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none text-xs ml-2 align-middle">Demo-Daten</Badge></h2>
              <p className="text-lg text-slate-500">Das haben andere Unternehmen in den letzten 48 Stunden gespart.</p>
            </div>
            <Link href="/ausschreibungen" className="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Alle Ergebnisse ansehen <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {mockSavings.map((data, i) => (
              <VehicleCard key={i} {...data} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="w-full">
              Alle Ergebnisse ansehen
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Für Händler CTA */}
      <section className="relative bg-navy-900 py-24 overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/20 to-transparent blur-3xl" />
        <div className="container mx-auto max-w-7xl px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Sie sind Händler, Leasingfirma oder Bank?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-lg leading-relaxed">
              Erreichen Sie kaufbereite Geschäftskunden aus ganz Deutschland. Sie zahlen nur bei erfolgreichem Kundenkontakt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-navy-900 hover:bg-slate-100 text-lg h-14 px-8 rounded-xl font-bold shadow-lg">
                Als Anbieter registrieren
              </Button>
            </div>
            <ul className="mt-8 space-y-3 text-blue-200">
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-cyan-400" /> 30€ pro qualifiziertem Kontakt</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-cyan-400" /> Bundesweite Reichweite</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-cyan-400" /> Keine Grundgebühr, kein Risiko</li>
            </ul>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* Abstract Graphic */}
            <div className="relative w-full max-w-md aspect-square rounded-full border border-blue-500/20 flex items-center justify-center auto-pulse">
              <div className="absolute w-3/4 h-3/4 rounded-full border border-cyan-400/30"></div>
              <div className="absolute w-1/2 h-1/2 rounded-full border border-blue-400/40 bg-blue-500/10 backdrop-blur-xl flex items-center justify-center">
                <span className="text-white font-bold text-3xl">proFleet</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Erfahrungsberichte */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-navy-950 mb-16">Erfahrungsberichte <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none text-xs ml-2 align-middle">Demo-Daten</Badge></h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-left">
              <div className="flex gap-1 mb-6 text-amber-500">
                <Star className="fill-current" /> <Star className="fill-current" /> <Star className="fill-current" /> <Star className="fill-current" /> <Star className="fill-current" />
              </div>
              <p className="text-xl font-medium text-navy-900 mb-8 italic">"Wir haben für unsere neue Flotte von 5 VW Passats eine Ausschreibung gestartet. Am Ende haben wir uns für einen Händler aus 200km Entfernung entschieden, der 18% günstiger war als unser Hausdeal."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">MS</div>
                <div>
                  <h4 className="font-bold text-navy-950">Michael S.</h4>
                  <p className="text-sm text-slate-500">Geschäftsführer, IT-Systemhaus</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-left">
              <div className="flex gap-1 mb-6 text-amber-500">
                <Star className="fill-current" /> <Star className="fill-current" /> <Star className="fill-current" /> <Star className="fill-current" /> <Star className="fill-current" />
              </div>
              <p className="text-xl font-medium text-navy-900 mb-8 italic">"Der Prozess ist sensationell einfach. Die vollständige Transparenz gibt uns das Gefühl, wirklich fundierte Entscheidungen treffen zu können."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold">JW</div>
                <div>
                  <h4 className="font-bold text-navy-950">Julia W.</h4>
                  <p className="text-sm text-slate-500">Fuhrparkmanagerin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="bg-white py-24">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-navy-950 mb-12 text-center">Häufige Fragen</h2>
          {/* @ts-ignore */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold text-navy-900">Ist proFleet wirklich kostenlos?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Ja, für Nachfrager (Käufer) ist die Nutzung von proFleet komplett kostenlos. Wir finanzieren uns über eine kleine Pauschale, die Händler bei erfolgreicher Kontaktvermittlung zahlen.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold text-navy-900">Wer sieht meine Daten?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Auf proFleet setzen wir auf vollständige Transparenz. Eingeloggte Händler sehen Ihr Firmenprofil, Ihren Namen und Ihre Kontaktdaten direkt bei der Ausschreibung. Ebenso sehen Sie alle Daten der Händler, die Angebote abgeben. So können beide Seiten fundierte Entscheidungen treffen.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold text-navy-900">Welche Händler nehmen teil?</AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Auf proFleet sind deutschlandweit über 2.500 verifizierte Vertragshändler, namhafte Autohäuser, Leasinggesellschaften und Banken registriert.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/tenders/VehicleCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HeroSection } from "@/components/ui-custom/HeroSection";
import { ArrowRight, CheckCircle2, Clock, Gavel, Package, Search, ShieldCheck, ShoppingCart, Star, TrendingDown, Users, Zap } from "lucide-react";

const mockSavings = [
  { brand: 'Audi', model: 'A4 Avant RS4', specs: '420 PS · shadowgrey metallic', listPrice: 89138, finalPrice: 75411, savings: 15.4, dealerRating: 0, location: 'München · 100 km' },
  { brand: 'BMW', model: '530d xDrive', specs: '286 PS · saphirschwarz', listPrice: 75200, finalPrice: 63920, savings: 15.0, leasing: 499, dealerRating: 0, location: 'Berlin · 50 km' },
  { brand: 'Mercedes-Benz', model: 'C 300 e T-Modell', specs: '313 PS · hightechsilber', listPrice: 62500, finalPrice: 53125, savings: 15.0, dealerRating: 0, location: 'Hamburg · 20 km' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection
        badge="Soon Coming"
        badgeIcon={<Zap size={14} className="text-cyan-400" />}
        title="Neuwagen einkaufen wie die Großen."
        subtitle="Stöbern Sie in Sofort-Angeboten von Händlern oder starten Sie eine Ausschreibung und lassen Sie Händler um Ihren Auftrag bieten."
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/sofort-angebote">
            <Button size="lg" className="rounded-xl bg-white text-navy-900 hover:bg-slate-100 font-semibold px-8 h-14 text-lg shadow-lg w-full">
              <ShoppingCart size={20} className="mr-2" />
              Sofort-Angebote entdecken
            </Button>
          </Link>
          <Link href="/dashboard/ausschreibung/neu">
            <Button size="lg" className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 text-white font-semibold px-8 h-14 text-lg w-full">
              <Gavel size={20} className="mr-2" />
              Ausschreibung starten
            </Button>
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-slate-400 text-sm font-medium">
          <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Kostenlos für Unternehmen</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Nur verifizierte User</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-400" /> Reine B2B Plattform</span>
        </div>
      </HeroSection>

      {/* 2. Zwei Wege – Sofort-Angebote vs. Ausschreibung */}
      <section className="bg-white py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-navy-950 mb-4">Zwei Wege zum besten Deal</h2>
            <p className="text-lg text-slate-500 max-w-3xl mx-auto">Ob Sie sofort zuschlagen oder Händler gegeneinander bieten lassen — proFleet gibt Ihnen die Wahl.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Sofort-Angebote */}
            <div className="relative bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-8 md:p-10 border-2 border-emerald-200 group hover:shadow-lg transition-all">
              <div className="absolute top-6 right-6">
                <Badge className="bg-emerald-100 text-emerald-700 border-none font-semibold text-sm px-3 py-1">Sofort verfügbar</Badge>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <ShoppingCart size={28} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-navy-950 mb-3">Sofort-Angebote</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Händler stellen fertig konfigurierte Fahrzeuge mit Festpreis ein. Sie stöbern, vergleichen und schlagen sofort zu — ohne Wartezeit.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-950">Sofort verfügbar</p>
                    <p className="text-sm text-slate-500">Fahrzeuge ab Lager oder kurzfristig lieferbar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-950">Festpreis</p>
                    <p className="text-sm text-slate-500">Transparente Preise mit Ersparnis zur UVP</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Search size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-950">Marktplatz durchsuchen</p>
                    <p className="text-sm text-slate-500">Filtern nach Marke, Modell, Preis und Ausstattung</p>
                  </div>
                </div>
              </div>

              <Link href="/sofort-angebote">
                <Button size="lg" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-14 text-lg">
                  Angebote durchstöbern <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>

            {/* Ausschreibung / Reverse-Auction */}
            <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 md:p-10 border-2 border-blue-200 group hover:shadow-lg transition-all">
              <div className="absolute top-6 right-6">
                <Badge className="bg-blue-100 text-blue-700 border-none font-semibold text-sm px-3 py-1">Reverse-Auction</Badge>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Gavel size={28} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-navy-950 mb-3">Ausschreibung</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Sie beschreiben Ihr Wunschfahrzeug — Händler unterbieten sich gegenseitig um Ihren Auftrag. Je mehr bieten, desto besser Ihr Preis.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingDown size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-950">Händler unterbieten sich</p>
                    <p className="text-sm text-slate-500">Wettbewerb sorgt für den bestmöglichen Preis</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-950">Mehrere Angebote</p>
                    <p className="text-sm text-slate-500">Durchschnittlich 5+ Händler bieten pro Ausschreibung</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-950">Ihre Konfiguration</p>
                    <p className="text-sm text-slate-500">Exakt das Fahrzeug, das Sie brauchen — individuell konfiguriert</p>
                  </div>
                </div>
              </div>

              <Link href="/dashboard/ausschreibung/neu">
                <Button size="lg" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white font-semibold h-14 text-lg">
                  Ausschreibung starten <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Logos/Social Proof */}
      <section className=" hidden bg-white py-12 border-b border-slate-100">
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

      {/* 5. Aktuelle Ersparnisse */}
      <section className="bg-slate-50 py-24">
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
              Erreichen Sie kaufbereite Geschäftskunden aus ganz Deutschland.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-navy-900 hover:bg-slate-100 text-lg h-14 px-8 rounded-xl font-bold shadow-lg">
                Als Anbieter registrieren
              </Button>
            </div>
            <ul className="mt-8 space-y-3 text-blue-200">
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-cyan-400" /> Einfaches Abomodell, keine versteckten Kosten</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-cyan-400" /> Bundesweite Reichweite</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={18} className="text-cyan-400" /> Nur verifizierte Unternehmen</li>
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

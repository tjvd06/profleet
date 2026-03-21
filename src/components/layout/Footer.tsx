import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-400 py-16 text-sm">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <span className="text-xl font-bold tracking-tight text-white mb-4 block">proFleet</span>
            <p className="mb-4">Die moderne Ausschreibungsplattform für Unternehmen. Fahrzeuge beschaffen wie die Großen.</p>
          </div>
          {/* Column 2 */}
          <div>
            <h3 className="text-white font-semibold mb-4">Plattform</h3>
            <ul className="space-y-3">
              <li><Link href="/ausschreibungen" className="hover:text-white transition-colors">Ausschreibungen</Link></li>
              <li><Link href="/sofort-angebote" className="hover:text-white transition-colors">Sofort-Angebote</Link></li>
              <li><Link href="/so-funktionierts" className="hover:text-white transition-colors">Für Nachfrager</Link></li>
              <li><Link href="/fuer-haendler" className="hover:text-white transition-colors">Für Händler</Link></li>
            </ul>
          </div>
          {/* Column 3 */}
          <div>
            <h3 className="text-white font-semibold mb-4">Unternehmen</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition-colors">Über uns</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Presse</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Karriere</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Kontakt</Link></li>
            </ul>
          </div>
          {/* Column 4 */}
          <div>
            <h3 className="text-white font-semibold mb-4">Rechtliches</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition-colors">AGB</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Datenschutz</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Impressum</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie-Einstellungen</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center">
          <p>© 2026 proFleet GmbH. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Bell, User } from "lucide-react";

export function TopNav() {
  // Mock login state for now
  const isLoggedIn = false;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-navy-950">proFleet</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-blue-500 transition-colors">Startseite</Link>
            <Link href="/so-funktionierts" className="hover:text-blue-500 transition-colors">So funktioniert's</Link>
            <Link href="/ausschreibungen" className="hover:text-blue-500 transition-colors">Ausschreibungen</Link>
            <Link href="/sofort-angebote" className="hover:text-blue-500 transition-colors">Sofort-Angebote</Link>
            <Link href="/fuer-haendler" className="hover:text-blue-500 transition-colors">Für Händler</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <Link href="/anmelden" className="text-sm font-medium text-slate-600 hover:text-navy-950 transition-colors">
                Anmelden
              </Link>
              <Link href="/registrieren" className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
                Kostenlos starten
              </Link>
            </>
          ) : (
            <>
              <button className="text-slate-500 hover:text-navy-950 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">3</span>
              </button>
              <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-navy-800">
                <User size={16} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, Inbox, PiggyBank, Star, Handshake, 
  CarFront, FileText, ChevronRight, Activity, Bell, AlertTriangle, 
  MessageCircle, TrendingUp, Trophy, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function DashboardOverviewPage() {
  const { profile, devModeRole, setDevModeRole } = useAuth();
  
  // Dev mode toggle logic
  const isDevelopment = process.env.NODE_ENV === 'development';
  const actualRole = profile?.role || "nachfrager";
  const activeRole = isDevelopment && devModeRole ? devModeRole : actualRole;
  const isDealer = activeRole === "anbieter";
  
  const handleRoleToggle = (checked: boolean) => {
    if (isDevelopment) {
      setDevModeRole(checked ? "anbieter" : "nachfrager");
    }
  };

  const userName = isDealer ? (profile?.company_name || "Autohaus Müller") : (profile?.first_name || "Michael");

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-32">
      
      {/* Combined Header Segment */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white pt-6 pb-12 shadow-sm overflow-hidden z-20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        
        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10 flex flex-col gap-8">
          {/* Dev Toggle Top */}
          <div className="flex justify-end items-center">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 text-sm shadow-sm">
              <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-none uppercase tracking-widest font-black text-[10px] shadow-none hidden sm:inline-flex rounded-md px-2 py-0.5">DEV MODE</Badge>
              <Label className={`cursor-pointer font-bold ${!isDealer ? 'text-white' : 'text-blue-200/50'}`}>Nachfrager</Label>
              <Switch checked={isDealer} onCheckedChange={handleRoleToggle} disabled={!isDevelopment} className="data-[state=checked]:bg-blue-500" />
              <Label className={`cursor-pointer font-bold ${isDealer ? 'text-white' : 'text-blue-200/50'}`}>Anbieter</Label>
            </div>
          </div>

          {/* Welcome Text */}
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
              Willkommen zurück, {userName}! 👋
            </h1>
            <p className="text-lg text-blue-100/80 font-medium max-w-2xl">
              {isDealer 
                ? "Hier ist Ihr aktueller Überblick über den Marktplatz und eingehende Anfragen." 
                : "Ihre Flottenbeschaffung auf einen Blick. So läuft es aktuell:"}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-10 space-y-12">

        {/* =========================================
            BUYER VIEW
           ========================================= */}
        {!isDealer && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aktive Inserate</div>
                </div>
                <div className="text-4xl font-black text-navy-950">2</div>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Inbox size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Neue Angebote</div>
                </div>
                <div className="text-4xl font-black text-navy-950 flex items-center gap-3">
                  14 <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold">+3 heute</Badge>
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <PiggyBank size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Ø Ersparnis</div>
                </div>
                <div className="text-4xl font-black text-navy-950">18.5%</div>
              </Card>

              <Card className="p-6 rounded-3xl border-amber-200 shadow-sm bg-amber-50/30 hover:bg-amber-50/50 transition-colors group border-l-4 border-l-amber-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white text-amber-500 shadow-sm flex items-center justify-center">
                    <Star size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Offene Ratings</div>
                </div>
                <div className="text-4xl font-black text-navy-950 flex items-center gap-3">
                  1 <Badge className="bg-amber-500 text-white border-none font-bold animate-pulse">Aktion nötig</Badge>
                </div>
              </Card>
            </div>

            {/* Quick Actions & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Actions (Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-2xl font-bold text-navy-950">Schnellzugriff</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <Link href="/dashboard/ausschreibungen/neu" className="block h-full">
                    <Card className="h-full p-8 rounded-3xl border-transparent bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-transform group relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <CarFront size={100} />
                      </div>
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                        <Sparkles size={28} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Neue Ausschreibung erstellen</h3>
                        <p className="text-blue-100 font-medium mb-6">Starten Sie einen neuen Beschaffungsprozess für Ihr nächstes Fahrzeug.</p>
                        <div className="flex items-center text-sm font-bold tracking-widest uppercase">
                          Jetzt starten <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </Link>

                  <Link href="/sofort-angebote" className="block h-full">
                    <Card className="h-full p-8 rounded-3xl border-2 border-slate-200 bg-white hover:border-blue-600 hover:shadow-lg transition-all group flex flex-col justify-between">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-50 transition-colors">
                        <Activity size={28} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-navy-950 mb-2">Sofort-Angebote durchsuchen</h3>
                        <p className="text-slate-500 font-medium mb-6">Entdecken Sie sofort verfügbare Lagerwagen deutscher Vertragshändler.</p>
                        <div className="flex items-center text-blue-600 text-sm font-bold tracking-widest uppercase">
                          Zum Marktplatz <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </Link>

                </div>
              </div>

              {/* Feed (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                <h2 className="text-2xl font-bold text-navy-950">Letzte Aktivitäten</h2>
                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm bg-white">
                  <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                    
                    {/* Event 1 */}
                    <div className="relative pl-8">
                      <div className="absolute -left-[11px] bg-emerald-500 w-5 h-5 rounded-full border-4 border-white shadow-sm" />
                      <div className="text-xs font-bold text-slate-400 mb-1">Heute, 09:14 Uhr</div>
                      <div className="font-bold text-navy-950">Neues Spitzenangebot erhalten!</div>
                      <p className="text-sm text-slate-500 mt-1">Ein Händler hat für "VW Tiguan R-Line" ein Angebot über 42.720 € abgegeben. Dies ist der neue Bestpreis.</p>
                    </div>

                    {/* Event 2 */}
                    <div className="relative pl-8">
                      <div className="absolute -left-[11px] bg-amber-500 w-5 h-5 rounded-full border-4 border-white shadow-sm" />
                      <div className="text-xs font-bold text-slate-400 mb-1">Gestern, 16:30 Uhr</div>
                      <div className="font-bold text-navy-950 flex items-center gap-2">Bewertung ausstehend <AlertTriangle size={14} className="text-amber-500"/></div>
                      <p className="text-sm text-slate-500 mt-1">Bitte bewerten Sie die Transaktion für den "Audi A4 Avant" mit dem Fleet Partner München GmbH.</p>
                    </div>

                    {/* Event 3 */}
                    <div className="relative pl-8">
                      <div className="absolute -left-[11px] bg-blue-500 w-5 h-5 rounded-full border-4 border-white shadow-sm" />
                      <div className="text-xs font-bold text-slate-400 mb-1">Vor 2 Tagen</div>
                      <div className="font-bold text-navy-950">System-Benachrichtigung</div>
                      <p className="text-sm text-slate-500 mt-1">Ihre Ausschreibung "5x VW Golf" wurde verifiziert und an 1.400 Flottenpartner ausgesendet.</p>
                    </div>

                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-blue-600 font-bold">Alle Aktivitäten ansehen</Button>
                </Card>
              </div>

            </div>
          </div>
        )}

        {/* =========================================
            DEALER VIEW
           ========================================= */}
        {isDealer && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Bell size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Neue Anfragen</div>
                </div>
                <div className="text-4xl font-black text-navy-950 flex items-center gap-3">
                  12 <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-bold">Neu</Badge>
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-600 group-hover:text-white transition-colors">
                    <TrendingUp size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Offene Angebote</div>
                </div>
                <div className="text-4xl font-black text-navy-950">14</div>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Handshake size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Kontaktwünsche</div>
                </div>
                <div className="text-4xl font-black text-navy-950">5</div>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-blue-300 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <Star size={24} />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Dealer Rating</div>
                </div>
                <div className="text-4xl font-black text-navy-950 text-green-600">84%</div>
              </Card>
            </div>

            {/* Quick Actions & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Actions (Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="text-2xl font-bold text-navy-950">Aktions-Hub</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <Link href="/dashboard/eingang" className="block h-full">
                    <Card className="h-full p-8 rounded-3xl border-transparent bg-navy-950 text-white shadow-xl hover:scale-[1.02] transition-transform group relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <Inbox size={100} />
                      </div>
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                        <MessageCircle size={28} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Ausschreibungen ansehen</h3>
                        <p className="text-slate-400 font-medium mb-6">Prüfen und beantworten Sie frische Ausschreibungen aus Ihrer Region.</p>
                        <div className="flex items-center text-sm font-bold tracking-widest uppercase text-blue-400">
                          Zum Posteingang <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </Link>

                  <Link href="/dashboard/sofort-angebote/neu" className="block h-full">
                    <Card className="h-full p-8 rounded-3xl border-2 border-slate-200 bg-white hover:border-navy-950 hover:shadow-lg transition-all group flex flex-col justify-between">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-slate-200 transition-colors">
                        <CarFront size={28} className="text-slate-600 group-hover:text-navy-950 transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-navy-950 mb-2">Sofort-Angebot erstellen</h3>
                        <p className="text-slate-500 font-medium mb-6">Vermarkten Sie Tageszulassungen und Lagerwagen im Marketplace.</p>
                        <div className="flex items-center text-navy-950 text-sm font-bold tracking-widest uppercase">
                          Neues Inserat <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card>
                  </Link>

                </div>
              </div>

              {/* Feed (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                <h2 className="text-2xl font-bold text-navy-950">Updates & Events</h2>
                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm bg-white">
                  <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                    
                    {/* Event 1 */}
                    <div className="relative pl-8">
                      <div className="absolute -left-[11px] bg-emerald-500 w-5 h-5 rounded-full border-4 border-white shadow-sm" />
                      <div className="text-xs font-bold text-slate-400 mb-1">Vor 2 Stunden</div>
                      <div className="font-bold text-navy-950 flex items-center gap-2">Sie haben den Zuschlag! <Trophy size={14} className="text-amber-500"/></div>
                      <p className="text-sm text-slate-500 mt-1">Ein Interessent aus München hat Ihr Leasing-Angebot für den "Audi A4 Avant" akzeptiert. Kontaktdaten freigeschaltet.</p>
                    </div>

                    {/* Event 2 */}
                    <div className="relative pl-8">
                      <div className="absolute -left-[11px] bg-red-500 w-5 h-5 rounded-full border-4 border-white shadow-sm" />
                      <div className="text-xs font-bold text-slate-400 mb-1">Gestern, 08:15 Uhr</div>
                      <div className="font-bold text-navy-950 text-red-600">Ranking-Verlust</div>
                      <p className="text-sm text-slate-500 mt-1">Ihr Angebot für "5x VW Golf" ist auf Platz #3 abgerutscht. Überarbeiten Sie den Preis, um die Gold-Position zurückzuholen.</p>
                    </div>

                    {/* Event 3 */}
                    <div className="relative pl-8">
                      <div className="absolute -left-[11px] bg-slate-300 w-5 h-5 rounded-full border-4 border-white shadow-sm" />
                      <div className="text-xs font-bold text-slate-400 mb-1">Vor 2 Tagen</div>
                      <div className="font-bold text-navy-950">Neuer Suchagent-Treffer</div>
                      <p className="text-sm text-slate-500 mt-1">Es wurden 3 neue Ausschreibungen für Ihr präferiertes Modell "Skoda Octavia" in Süddeutschland veröffentlicht.</p>
                    </div>

                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-blue-600 font-bold">Historie öffnen</Button>
                </Card>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusTracker } from "@/components/ui-custom/StatusTracker";
import { RatingBadge } from "@/components/ui-custom/RatingBadge";
import { Plus, Archive, Activity, ChevronDown, ChevronUp, MapPin, Eye, MousePointerClick, TrendingUp, Handshake, Users, Mail } from "lucide-react";
import Link from "next/link";

// Mock Data for Dealer Management
const activeInstantOffers = [
  {
    id: "IO-91823",
    brand: "Audi",
    model: "A4 Avant 40 TDI S line",
    createdAt: "Vor 3 Tagen",
    expiresIn: "11 Tage",
    views: 1240,
    clicks: 86,
    quantity: 5,
    available: 3, // 2 sold
    listPrice: 62450,
    offerPrice: 50896,
    leads: [
      { id: "L-101", company: "Consulting Group Munich", rating: 98, date: "Heute, 09:14 Uhr", statusStep: 1, type: "Leasing (36M)" },
      { id: "L-102", company: "Müller Handwerk GmbH", rating: 90, date: "Gestern, 14:30 Uhr", statusStep: 2, type: "Barkauf" }
    ]
  },
  {
    id: "IO-91824",
    brand: "VW",
    model: "Tiguan R-Line 2.0 TDI",
    createdAt: "Gestern",
    expiresIn: "13 Tage",
    views: 450,
    clicks: 12,
    quantity: 1,
    available: 1,
    listPrice: 53400,
    offerPrice: 42720,
    leads: []
  }
];

const archivedOffers = [
  {
    id: "IO-88111",
    brand: "BMW",
    model: "530e xDrive",
    closedAt: "Vor 2 Monaten",
    reason: "Ausverkauft (10/10 verkauft)",
    views: 4500,
    totalLeads: 15,
    successfulSales: 10
  }
];

export default function ManageInstantOffersPage() {
  const [expandedOffer, setExpandedOffer] = useState<string | null>(activeInstantOffers[0].id);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-24">
      {/* Header Segment */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white py-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">Sofort-Angebote verwalten</h1>
              <p className="text-lg text-blue-100/80 max-w-2xl leading-relaxed">
                Behalten Sie Ihre Live-Inserate im Blick, tracken Sie Performance und verwalten Sie eingehende Kundenanfragen (Leads).
              </p>
            </div>
            <Link href="/dashboard/sofort-angebote/neu">
              <Button className="rounded-xl h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-md hover:shadow-lg hover:shadow-blue-500/20 transition-all border border-blue-500/50">
                <Plus size={20} className="mr-2" /> Neues Sofort-Angebot
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-8">
        <Tabs defaultValue="active" className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Sidebar Navigation */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="sticky top-28">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Bestand</h3>
              <TabsList className="flex flex-col h-auto bg-transparent w-full p-0 space-y-3">
                <TabsTrigger 
                  value="active" 
                  className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <Activity size={20} className="text-blue-500" />
                    Live Lagermodelle
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{activeInstantOffers.length}</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="archived" 
                  className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <Archive size={20} className="text-slate-400" />
                    Archiv
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{archivedOffers.length}</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            {/* ACTIVE OFFERS TAB */}
            <TabsContent value="active" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
              {activeInstantOffers.map(offer => {
                const isExpanded = expandedOffer === offer.id;
                
                return (
                  <Card key={offer.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden transition-all duration-300">
                    <div 
                      className={`p-6 md:p-8 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50/50'}`}
                      onClick={() => setExpandedOffer(isExpanded ? null : offer.id)}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="text-slate-500 bg-white font-mono">{offer.id}</Badge>
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-3 font-semibold">Live auf Marktplatz</Badge>
                          </div>
                          <h3 className="text-2xl font-bold text-navy-950 mb-1">{offer.brand} {offer.model}</h3>
                          <p className="text-sm text-slate-500 font-medium flex items-center gap-4">
                            <span>Verfügbar: <strong className="text-navy-950">{offer.available} / {offer.quantity}</strong></span>
                            <span>Aktionspreis: <strong className="text-navy-950">{offer.offerPrice.toLocaleString('de-DE')} €</strong></span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-8 w-full md:w-auto">
                          {/* Mini Stats */}
                          <div className="flex gap-6 text-center">
                            <div>
                              <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1 font-semibold text-xs uppercase tracking-wider"><Eye size={14}/> Views</div>
                              <div className="font-black text-navy-950 text-xl">{offer.views}</div>
                            </div>
                            <div>
                              <div className="flex items-center justify-center gap-1.5 text-slate-500 mb-1 font-semibold text-xs uppercase tracking-wider"><MousePointerClick size={14}/> Klicks</div>
                              <div className="font-black text-navy-950 text-xl">{offer.clicks}</div>
                            </div>
                            <div>
                              <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1 font-bold text-xs uppercase tracking-wider"><Users size={14}/> Leads</div>
                              <div className="font-black text-blue-700 text-xl">{offer.leads.length}</div>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="icon" className="rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-navy-900 h-10 w-10 shrink-0 hidden md:flex">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content: Leads Tracking */}
                    {isExpanded && (
                      <div className="bg-white p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
                        <h4 className="font-bold text-navy-950 text-lg mb-6 flex items-center gap-2">
                          <Handshake className="text-blue-500" size={20} /> Eingehende Kontaktwünsche (Leads)
                        </h4>

                        {offer.leads.length > 0 ? (
                          <div className="space-y-8">
                            {offer.leads.map((lead, i) => (
                              <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-8">
                                  <div>
                                    <div className="text-sm font-semibold text-slate-500 mb-1">Eingegangen: {lead.date}</div>
                                    <h5 className="text-xl font-bold text-navy-950 flex items-center gap-3">
                                      {lead.company} <RatingBadge score={lead.rating} />
                                    </h5>
                                    <p className="text-sm text-slate-600 mt-1">Interesse an: <strong className="text-navy-900">{lead.type}</strong></p>
                                  </div>
                                  <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md font-bold px-6">
                                    <Mail size={16} className="mr-2" /> Kontakt aufnehmen
                                  </Button>
                                </div>

                                <div className="bg-white rounded-xl py-6 px-4 md:px-8 border border-slate-100 shadow-sm">
                                  <h6 className="text-center font-bold text-sm text-slate-400 uppercase tracking-widest mb-6">Verkaufsprozess mit Kunde</h6>
                                  <StatusTracker currentStep={lead.statusStep} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <Users size={40} className="mb-4 opacity-20" />
                            <h5 className="text-lg font-bold text-navy-900 mb-2">Noch keine Leads vorhanden</h5>
                            <p className="max-w-md text-sm">Das Inserat ist aktiv. Warten Sie ab, bis Einkäufer sich für dieses Fahrzeug interessieren.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </TabsContent>

            {/* ARCHIVED TAB */}
            <TabsContent value="archived" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="grid md:grid-cols-2 gap-6">
                {archivedOffers.map(archived => (
                  <Card key={archived.id} className="border-slate-200 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col justify-between bg-white/50 opacity-90 transition-opacity">
                    <div className="mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="font-mono text-slate-400 bg-slate-50 border-slate-200">{archived.id}</Badge>
                        <Badge className="bg-slate-100 text-slate-500 border-none px-3 font-semibold">
                          {archived.reason}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-navy-900 mb-1">{archived.brand} {archived.model}</h3>
                      <p className="text-sm font-medium text-slate-500">Beendet: {archived.closedAt}</p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <div className="text-xs text-slate-400 font-bold uppercase mb-1">Views</div>
                        <div className="font-black text-navy-900">{archived.views}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                        <div className="text-xs text-slate-400 font-bold uppercase mb-1">Leads</div>
                        <div className="font-black text-navy-900">{archived.totalLeads}</div>
                      </div>
                      <div className="bg-green-50/50 p-3 rounded-xl border border-green-100/50">
                        <div className="text-xs text-green-600/70 font-bold uppercase mb-1">Verkauft</div>
                        <div className="font-black text-green-800">{archived.successfulSales}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>

        </Tabs>
      </div>
    </div>
  );
}

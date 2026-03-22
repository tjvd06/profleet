"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusTracker } from "@/components/ui-custom/StatusTracker";
import { RatingBadge } from "@/components/ui-custom/RatingBadge";
import { Clock, ChevronDown, ChevronUp, MapPin, Building2, CheckCircle2, FileText, Pencil, Trash2, Globe, ArrowUpDown, Activity, FileEdit } from "lucide-react";

// Mock Data
const activeTenders = [
  {
    id: "AU-98745",
    brand: "Audi",
    model: "A4 Avant S-Line",
    createdAt: "Vor 2 Tagen",
    timeLeft: "5 Tage 4 Std.",
    quantity: 5,
    offersCount: 3,
    baseListPrice: 62450,
    bestSavings: 18.5,
    offers: [
      { id: "OF-01", dealerLoc: "München · 45km", rating: 98, price: 50896, savings: 18.5, leasing: 549, finance: 590, isHighlight: true, transfer: 990 },
      { id: "OF-02", dealerLoc: "Nürnberg · 150km", rating: 92, price: 52100, savings: 16.5, leasing: 579, finance: 620, isHighlight: false, transfer: 890 },
      { id: "OF-03", dealerLoc: "Leipzig · 350km", rating: 88, price: 49950, savings: 20.0, leasing: 539, finance: null, isHighlight: false, transfer: 1200 } // best price, but bad rating/distance
    ]
  },
  {
    id: "AU-98746",
    brand: "VW",
    model: "Passat Variant Elegance",
    createdAt: "Vor 5 Tagen",
    timeLeft: "12 Std.",
    quantity: 1,
    offersCount: 0,
    baseListPrice: 48500,
    bestSavings: null,
    offers: []
  }
];

const completedTenders = [
  {
    id: "AU-88211",
    brand: "BMW",
    model: "530d xDrive",
    date: "12. Okt 2025",
    winningOffer: { dealerLoc: "Stuttgart · 200km", rating: 95, price: 63920, savings: 15.0 },
    statusStep: 1 // 0: Kontakt, 1: Vertrag hochgeladen, 2: Bewertet
  }
];

const draftTenders = [
  { id: "DR-001", brand: "Mercedes-Benz", model: "C 300 e T-Modell", savedAt: "Gestern", isComplete: true },
  { id: "DR-002", brand: "Porsche", model: "Macan", savedAt: "Letzte Woche", isComplete: false }
];

export default function MyTendersPage() {
  const [expandedTender, setExpandedTender] = useState<string | null>(activeTenders[0].id);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'price', direction: 'asc' });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedOffers = (offers: any[]) => {
    if (!sortConfig) return offers;
    return [...offers].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (aVal === null) aVal = Infinity;
      if (bVal === null) bVal = Infinity;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Segment */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white py-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-4">Meine Ausschreibungen</h1>
          <p className="text-lg text-blue-100/80 max-w-2xl leading-relaxed">Verwalten Sie Ihre aktiven, abgeschlossenen und als Entwurf gespeicherten Ausschreibungen.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-8">
        <Tabs defaultValue="active" className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Sidebar Navigation */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="sticky top-28">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Kategorien</h3>
              <TabsList className="flex flex-col h-auto bg-transparent w-full p-0 space-y-3">
                <TabsTrigger 
                  value="active" 
                  className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <Activity size={20} className="text-blue-500" />
                    Laufende
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{activeTenders.length}</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="completed" 
                  className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-green-500" />
                    Abgeschlossene
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{completedTenders.length}</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="drafts" 
                  className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <FileEdit size={20} className="text-amber-500" />
                    Entwürfe
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{draftTenders.length}</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            {/* ACTIVE TENDERS TAB */}
            <TabsContent value="active" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {activeTenders.map(tender => (
              <Card key={tender.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden transition-all duration-300">
                {/* Tender Header (Always visible) */}
                <div 
                  className={`p-6 md:p-8 cursor-pointer transition-colors ${expandedTender === tender.id ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50/50'}`}
                  onClick={() => setExpandedTender(expandedTender === tender.id ? null : tender.id)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm text-navy-800">
                        <Building2 size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="outline" className="text-slate-500 bg-white font-mono">{tender.id}</Badge>
                          {tender.offersCount > 0 ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 font-bold">{tender.offersCount} Angebote</Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-none px-3">Warten auf Angebote</Badge>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-navy-950">{tender.brand} {tender.model}</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Gepostet: {tender.createdAt} • Menge: <span className="text-navy-900 font-bold">{tender.quantity}x</span> • Listenpreis Brutto: <span className="text-navy-900 font-bold">{tender.baseListPrice.toLocaleString('de-DE')} €</span></p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-500 mb-1">Endet in</div>
                        <div className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
                          <Clock size={16} /> {tender.timeLeft}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-navy-900 h-10 w-10 shrink-0">
                        {expandedTender === tender.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content: Offers Table */}
                {expandedTender === tender.id && (
                  <div className="bg-white p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
                    {tender.offers.length > 0 ? (
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-4">Händler</th>
                              <th className="px-6 py-4">
                                <button className="flex items-center gap-1.5 hover:text-navy-900" onClick={() => handleSort('rating')}>
                                  Bewertung <ArrowUpDown size={12} className={sortConfig?.key === 'rating' ? 'text-blue-500' : 'text-slate-300'} />
                                </button>
                              </th>
                              <th className="px-6 py-4">
                                <button className="flex items-center gap-1.5 hover:text-navy-900" onClick={() => handleSort('price')}>
                                  Barpreis (Brutto) <ArrowUpDown size={12} className={sortConfig?.key === 'price' ? 'text-blue-500' : 'text-slate-300'} />
                                </button>
                              </th>
                              <th className="px-6 py-4">Ersparnis</th>
                              <th className="px-6 py-4">
                                <button className="flex items-center gap-1.5 hover:text-navy-900" onClick={() => handleSort('leasing')}>
                                  Leasing p.M. (Netto) <ArrowUpDown size={12} className={sortConfig?.key === 'leasing' ? 'text-blue-500' : 'text-slate-300'} />
                                </button>
                              </th>
                              <th className="px-6 py-4 text-center">Aktion</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {getSortedOffers(tender.offers).map((offer, i) => (
                              <tr key={i} className={`hover:bg-slate-50 transition-colors ${offer.isHighlight ? 'bg-blue-50/20' : ''}`}>
                                <td className="px-6 py-5">
                                  <div className="flex items-center gap-2 font-bold text-navy-950">
                                    <MapPin size={16} className="text-slate-400" /> {offer.dealerLoc.split(' · ')[0]}
                                  </div>
                                  <div className="text-slate-500 text-xs mt-1 ml-6">{offer.dealerLoc.split(' · ')[1]} entfernt</div>
                                </td>
                                <td className="px-6 py-5">
                                  <RatingBadge score={offer.rating} />
                                </td>
                                <td className="px-6 py-5">
                                  <div className="font-bold text-navy-950 text-lg">{offer.price.toLocaleString('de-DE')} €</div>
                                  <div className="text-xs text-slate-500 mt-1">+ {offer.transfer} € Überf.</div>
                                </td>
                                <td className="px-6 py-5">
                                  <span className="bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-lg text-xs">
                                    -{offer.savings}%
                                  </span>
                                </td>
                                <td className="px-6 py-5 font-semibold text-slate-700">
                                  {offer.leasing ? `${offer.leasing} €` : <span className="text-slate-300 font-normal">K.A.</span>}
                                </td>
                                <td className="px-6 py-5 text-center">
                                  <Button className="rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-bold px-6 shadow-md transition-transform hover:scale-105">
                                    Kontakt aufnehmen
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                        <Clock size={48} className="mb-4 opacity-20" />
                        <h4 className="text-lg font-bold text-navy-950 mb-2">Noch keine Angebote</h4>
                        <p className="max-w-md">Die Ausschreibung läuft noch. Wir benachrichtigen Sie per E-Mail, sobald die ersten Händler Angebote abgeben.</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
            </TabsContent>

            {/* COMPLETED TENDERS TAB */}
            <TabsContent value="completed" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {completedTenders.map(tender => (
              <Card key={tender.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Info Column */}
                  <div className="w-full md:w-1/3">
                    <Badge variant="outline" className="mb-3 font-mono text-slate-500 bg-slate-50">{tender.id}</Badge>
                    <h3 className="text-2xl font-bold text-navy-950 mb-1">{tender.brand} {tender.model}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6">Abgeschlossen am: {tender.date}</p>
                    
                    <div className="bg-green-50 rounded-2xl p-5 border border-green-200/60 shadow-inner">
                      <div className="flex items-center gap-2 font-bold text-green-800 mb-3 border-b border-green-200 pb-2">
                        <CheckCircle2 size={18} /> Siegerangebot
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="block text-green-700/70 font-semibold mb-0.5">Preis</span>
                          <span className="font-bold text-green-950 text-base">{tender.winningOffer.price.toLocaleString('de-DE')} €</span>
                        </div>
                        <div>
                          <span className="block text-green-700/70 font-semibold mb-0.5">Ersparnis</span>
                          <Badge className="bg-green-500 text-white hover:bg-green-600 border-none font-bold">-{tender.winningOffer.savings}%</Badge>
                        </div>
                        <div className="col-span-2">
                          <span className="block text-green-700/70 font-semibold mb-0.5">Händler</span>
                          <div className="font-medium text-green-900 bg-white/50 px-3 py-1.5 rounded-lg border border-green-200/50 flex items-center gap-2">
                            <MapPin size={14} className="text-green-600" /> {tender.winningOffer.dealerLoc}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Tracker Column */}
                  <div className="w-full md:w-2/3 md:pl-12 md:border-l border-slate-100 flex flex-col justify-center min-h-[250px]">
                    <h4 className="font-bold text-navy-950 mb-6 text-center text-lg">Prozess-Fortschritt</h4>
                    <StatusTracker currentStep={tender.statusStep} />
                    
                    <div className="mt-12 text-center relative z-20">
                      {tender.statusStep === 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                          <p className="text-sm font-semibold text-slate-500 mb-4">Der Händler wurde benachrichtigt und wird Ihnen den Kaufvertrag zukommen lassen.</p>
                          <Button className="rounded-xl px-8 focus:ring-4 focus:ring-blue-100 bg-blue-600 hover:bg-blue-700 shadow-md">
                            Kaufvertrag jetzt hochladen
                          </Button>
                        </div>
                      )}
                      {tender.statusStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                          <p className="text-sm font-semibold text-slate-500 mb-4">Der Vertrag wurde dokumentiert. Sie können den Händler nun bewerten, um den Prozess final abzuschließen.</p>
                          <Button className="rounded-xl px-8 bg-amber-500 hover:bg-amber-600 shadow-md text-white font-bold">
                            Händler jetzt bewerten
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </Card>
            ))}
            </TabsContent>

            {/* DRAFTS TAB */}
            <TabsContent value="drafts" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="grid md:grid-cols-2 gap-6">
                {draftTenders.map(draft => (
                  <Card key={draft.id} className="border-slate-200 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                    <div className="mb-8">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="font-mono text-slate-500 bg-slate-50">{draft.id}</Badge>
                        <Badge className={draft.isComplete ? "bg-green-100 text-green-700 border-none" : "bg-amber-100 text-amber-700 border-none"}>
                          {draft.isComplete ? "Vollständig" : "Unvollständig"}
                        </Badge>
                      </div>
                      <h3 className="text-2xl font-bold text-navy-950 mb-2">{draft.brand} {draft.model}</h3>
                      <p className="text-sm font-medium text-slate-500">Zuletzt gespeichert: {draft.savedAt}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-auto">
                      <Button variant="outline" className="rounded-xl shadow-sm text-slate-600 hover:text-navy-900 border-slate-300">
                        <Pencil size={16} className="mr-2" /> Bearbeiten
                      </Button>
                      <Button className="rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={!draft.isComplete}>
                        <Globe size={16} className="mr-2" /> Veröffentlichen
                      </Button>
                      <Button variant="ghost" className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 ml-auto px-3">
                        <Trash2 size={18} />
                      </Button>
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

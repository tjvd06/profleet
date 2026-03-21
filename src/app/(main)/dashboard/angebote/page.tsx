"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusTracker } from "@/components/ui-custom/StatusTracker";
import { Activity, Handshake, Archive, Clock, ChevronDown, ChevronUp, Trophy, Building2, Pencil, Calendar, Package, CheckCircle2 } from "lucide-react";

// Mock Data
const activeOffers = [
  {
    id: "AU-98234",
    buyerType: "Handwerksbetrieb (Augsburg · 60km)",
    createdAt: "Vor 1 Woche",
    timeLeft: "5 Std. 20 Min.",
    totalVehicles: 3,
    packageRanking: 2,
    vehicles: [
      { quantity: 2, brand: "VW", model: "Transporter Kastenwagen", myPrice: 42000, topPrice: 41500, myLeasing: 450, topLeasing: 440, ranking: 2 },
      { quantity: 1, brand: "VW", model: "Caddy Cargo", myPrice: 31000, topPrice: 31500, myLeasing: 320, topLeasing: 325, ranking: 1 }
    ]
  },
  {
    id: "AU-98255",
    buyerType: "Immobilienagentur (Berlin · 500km)",
    createdAt: "Vor 3 Tagen",
    timeLeft: "2 Tage",
    totalVehicles: 1,
    packageRanking: 3,
    vehicles: [
      { quantity: 1, brand: "Porsche", model: "Macan", myPrice: 82500, topPrice: 79000, myLeasing: 890, topLeasing: 840, ranking: 3 }
    ]
  }
];

const wonOffers = [
  {
    id: "AU-88211",
    buyerType: "IT-Dienstleister (München · 45km)",
    wonAt: "Gestern",
    totalVehicles: 5,
    statusStep: 0,
    packagePrice: 254000,
    vehicles: [
      { quantity: 5, brand: "Audi", model: "A4 Avant S-Line" }
    ]
  }
];

const archivedOffers = [
  {
    id: "AU-77123",
    buyerType: "Logistikfirma (Nürnberg · 150km)",
    closedAt: "Vor 1 Monat",
    result: "Nicht gewonnen (Platz 4)",
    totalVehicles: 10,
    vehicles: [
      { quantity: 10, brand: "Renault", model: "Kangoo Rapid" }
    ]
  }
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Badge className="bg-[#FFD700]/20 text-[#B8860B] border-[#FFD700]/50 hover:bg-[#FFD700]/30 font-bold px-2 py-0.5"><Trophy size={14} className="mr-1 inline text-[#DAA520]" /> #1 Angebot</Badge>;
  if (rank === 2) return <Badge className="bg-[#E5E4E2]/50 text-[#71706E] border-[#C0C0C0]/50 hover:bg-[#E5E4E2] font-bold px-2 py-0.5"><Trophy size={14} className="mr-1 inline text-[#A9A9A9]" /> #2 Angebot</Badge>;
  if (rank === 3) return <Badge className="bg-[#CD7F32]/20 text-[#8B4513] border-[#CD7F32]/50 hover:bg-[#CD7F32]/30 font-bold px-2 py-0.5"><Trophy size={14} className="mr-1 inline text-[#A0522D]" /> #3 Angebot</Badge>;
  return <Badge variant="outline" className="text-slate-400 font-bold px-2 py-0.5 border-slate-200 bg-slate-50">#{rank}</Badge>;
}

export default function DealerOffersPage() {
  const [expandedOffer, setExpandedOffer] = useState<string | null>(activeOffers[0].id);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-24">
      {/* Header Segment */}
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="text-4xl font-bold text-navy-950 tracking-tight mb-4">Meine Angebote</h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">Plätze verteidigen, Angebote überarbeiten und gewonnene Verträge rechtssicher abschließen.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-8">
        <Tabs defaultValue="active" className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Sidebar Navigation */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="sticky top-28">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Status</h3>
              <TabsList className="flex flex-col h-auto bg-transparent w-full p-0 space-y-3">
                <TabsTrigger 
                  value="active" 
                  className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <Activity size={20} className="text-blue-500" />
                    Laufende Wetten
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{activeOffers.length}</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="won" 
                  className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                >
                  <div className="flex items-center gap-3">
                    <Handshake size={20} className="text-green-500" />
                    Kontaktwunsch
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{wonOffers.length}</span>
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
              {activeOffers.map(offer => {
                const isExpanded = expandedOffer === offer.id;
                
                // Calculate Totals Header
                const myTotalPrice = offer.vehicles.reduce((acc, v) => acc + (v.myPrice * v.quantity), 0);
                const sumTopPrice = offer.vehicles.reduce((acc, v) => acc + (v.topPrice * v.quantity), 0);
                const sumMyLeasing = offer.vehicles.reduce((acc, v) => acc + (v.myLeasing * v.quantity), 0);
                const sumTopLeasing = offer.vehicles.reduce((acc, v) => acc + (v.topLeasing * v.quantity), 0);

                return (
                  <Card key={offer.id} className={`border-slate-200 shadow-sm rounded-3xl overflow-hidden transition-all duration-300 ${offer.packageRanking === 1 ? 'border-amber-200 shadow-amber-100' : ''}`}>
                    {/* Header */}
                    <div 
                      className={`p-6 md:p-8 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50/50'}`}
                      onClick={() => setExpandedOffer(isExpanded ? null : offer.id)}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm text-navy-800 shrink-0">
                            <Building2 size={28} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <Badge variant="outline" className="text-slate-500 bg-white font-mono">{offer.id}</Badge>
                              <RankBadge rank={offer.packageRanking} />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-navy-950">{offer.buyerType}</h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">
                              Gesamtmenge: <span className="text-navy-900 font-bold mr-3">{offer.totalVehicles} Fahrzeuge</span> 
                              Ihr Angebotspreis: <span className="text-navy-900 font-bold">{myTotalPrice.toLocaleString('de-DE')} €</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                            <div className="text-sm font-semibold text-slate-500 mb-1">Ausschreibung endet in</div>
                            <div className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50">
                              <Clock size={16} /> {offer.timeLeft}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-navy-900 h-10 w-10 shrink-0">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content: Vehicles & Editing */}
                    {isExpanded && (
                      <div className="bg-white p-6 md:p-8 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="font-bold text-navy-950 text-lg flex items-center gap-2">
                            <Package size={20} className="text-slate-400" /> Fahrzeug-Details & Ranking
                          </h4>
                          <Button className="rounded-xl px-6 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold transition-all shadow-sm">
                            <Pencil size={16} className="mr-2" /> Ausgewähltes Angebot überarbeiten
                          </Button>
                        </div>

                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-200">
                              <tr>
                                <th className="px-5 py-4 w-12 text-center">Fzg.</th>
                                <th className="px-5 py-4">Ihr Kaufpreis / Netto</th>
                                <th className="px-5 py-4 text-emerald-600">Top-Kaufpreis / Netto</th>
                                <th className="px-5 py-4">Ihre Leasingrate p.M.</th>
                                <th className="px-5 py-4 text-emerald-600">Top-Leasingrate</th>
                                <th className="px-5 py-4 text-center">Einzel-Ranking</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {offer.vehicles.map((v, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-5 py-5 border-r border-slate-100">
                                    <div className="bg-slate-100 text-slate-500 font-black text-xs w-7 h-7 flex items-center justify-center rounded-lg mx-auto">{v.quantity}x</div>
                                  </td>
                                  <td className="px-5 py-5">
                                    <div className="font-bold text-navy-950 text-base">{v.brand} {v.model}</div>
                                    <div className="text-slate-500 font-semibold mt-1">{v.myPrice.toLocaleString('de-DE')} € <span className="text-xs font-normal">/ Stk.</span></div>
                                  </td>
                                  <td className="px-5 py-5">
                                    <div className="text-emerald-700 font-bold text-base">{v.topPrice.toLocaleString('de-DE')} € {v.myPrice > v.topPrice && <span className="text-xs text-red-500 font-semibold ml-1">(+{v.myPrice - v.topPrice}€)</span>}</div>
                                  </td>
                                  <td className="px-5 py-5">
                                    <div className="text-slate-600 font-semibold text-base">{v.myLeasing} €</div>
                                  </td>
                                  <td className="px-5 py-5">
                                    <div className="text-emerald-700 font-bold text-base">{v.topLeasing} € {v.myLeasing > v.topLeasing && <span className="text-xs text-red-500 font-semibold ml-1">(+{v.myLeasing - v.topLeasing}€)</span>}</div>
                                  </td>
                                  <td className="px-5 py-5 text-center">
                                    <RankBadge rank={v.ranking} />
                                  </td>
                                </tr>
                              ))}
                              
                              {/* SUM ROW */}
                              {offer.vehicles.length > 1 && (
                                <tr className="bg-blue-50/30 border-t-2 border-blue-100">
                                  <td className="px-5 py-5 bg-blue-100/50 border-r border-blue-100 font-black text-blue-900 text-center text-lg">{offer.totalVehicles}x</td>
                                  <td className="px-5 py-5">
                                    <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-0.5">Summe Ihr Paketpreis</div>
                                    <div className="font-black text-navy-950 text-lg">{myTotalPrice.toLocaleString('de-DE')} €</div>
                                  </td>
                                  <td className="px-5 py-5">
                                    <div className="text-xs font-bold text-emerald-800/70 uppercase tracking-wider mb-0.5">Summe Top-Teilangebote</div>
                                    <div className="font-black text-emerald-700 text-lg">{sumTopPrice.toLocaleString('de-DE')} €</div>
                                  </td>
                                  <td className="px-5 py-5">
                                    <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-0.5">Summe Leasingpaket p.M.</div>
                                    <div className="font-black text-slate-700 text-lg">{sumMyLeasing.toLocaleString('de-DE')} €</div>
                                  </td>
                                  <td className="px-5 py-5">
                                    <div className="text-xs font-bold text-emerald-800/70 uppercase tracking-wider mb-0.5">Summe Top-Leasing</div>
                                    <div className="font-black text-emerald-700 text-lg">{sumTopLeasing.toLocaleString('de-DE')} €</div>
                                  </td>
                                  <td className="px-5 py-5 text-center">
                                    <RankBadge rank={offer.packageRanking} />
                                  </td>
                                </tr>
                              )}

                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </TabsContent>

            {/* WON OFFERS TAB */}
            <TabsContent value="won" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
              {wonOffers.map(won => (
                <Card key={won.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    
                    {/* Info Column */}
                    <div className="w-full md:w-1/3">
                      <Badge variant="outline" className="mb-3 font-mono text-slate-500 bg-slate-50">{won.id}</Badge>
                      <h3 className="text-2xl font-bold text-navy-950 mb-1">{won.buyerType}</h3>
                      <p className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-1.5"><Calendar size={14}/> Zuschlag erteilt am: {won.wonAt}</p>
                      
                      <div className="bg-green-50 rounded-2xl p-5 border border-green-200/60 shadow-inner">
                        <div className="flex items-center gap-2 font-bold text-green-800 mb-3 border-b border-green-200 pb-2">
                          <CheckCircle2 size={18} /> Sie haben gewonnen!
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="block text-green-700/70 text-xs font-bold uppercase tracking-wider mb-1">Ihr verhandeltes Paket</span>
                            <div className="font-bold text-green-950 flex gap-2"><div className="bg-green-200/50 px-2 rounded-md">{won.totalVehicles}x</div> {won.vehicles.map(v => v.brand).join(', ')} Modelle</div>
                          </div>
                          <div>
                            <span className="block text-green-700/70 text-xs font-bold uppercase tracking-wider mb-1">Paket-Preis</span>
                            <div className="font-black text-green-950 text-xl">{won.packagePrice.toLocaleString('de-DE')} €</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Tracker Column */}
                    <div className="w-full md:w-2/3 md:pl-12 md:border-l border-slate-100 flex flex-col justify-center min-h-[250px]">
                      <h4 className="font-bold text-navy-950 mb-6 text-center text-lg">Verkaufsprozess mit dem Kunden</h4>
                      <StatusTracker currentStep={won.statusStep} />
                      
                      <div className="mt-12 text-center relative z-20">
                        {won.statusStep === 0 && (
                          <div className="animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-sm font-semibold text-slate-500 mb-4 max-w-sm mx-auto">Die Kontaktdaten des Flottenmanagers wurden freigeschaltet. Bitte lassen Sie ihm den physischen Kaufvertrag zeitnah zukommen.</p>
                            <Button className="rounded-xl px-8 focus:ring-4 focus:ring-blue-100 bg-blue-600 hover:bg-blue-700 shadow-md h-12">
                              Kontaktdaten einsehen
                            </Button>
                          </div>
                        )}
                        {won.statusStep === 1 && (
                          <div className="animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-sm font-semibold text-slate-500 mb-4 max-w-sm mx-auto">Der Kunde hat den unterschriebenen Vertrag hochgeladen und den Händlervertrag bestätigt. Warten auf Abschluss-Bewertung.</p>
                            <Badge className="bg-slate-100 text-slate-500 border-none px-4 py-2 text-sm font-medium">Warten auf Käufer</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* ARCHIVED TAB */}
            <TabsContent value="archived" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="grid md:grid-cols-2 gap-6">
                {archivedOffers.map(archived => (
                  <Card key={archived.id} className="border-slate-200 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col justify-between bg-white/50 opacity-90 hover:opacity-100 transition-opacity">
                    <div className="mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="font-mono text-slate-400 bg-slate-50 border-slate-200">{archived.id}</Badge>
                        <Badge className="bg-slate-100 text-slate-500 border-none px-3 font-semibold">
                          {archived.result}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-navy-900 mb-2">{archived.buyerType}</h3>
                      <p className="text-sm font-medium text-slate-500">Beendet: {archived.closedAt}</p>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="text-sm text-slate-400 mb-1">Ihre abgegebenen Angebote:</div>
                      <div className="font-bold text-navy-900 flex gap-2"><div className="bg-slate-100 px-2 rounded-md">{archived.totalVehicles}x</div> {archived.vehicles.map(v => v.brand).join(', ')} Modelle</div>
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

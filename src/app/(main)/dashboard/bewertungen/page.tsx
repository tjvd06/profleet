"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, User, Building2, Star, TrendingUp, TrendingDown,
  MessageSquare, FileText, CheckCircle2, ShieldCheck,
  XOctagon, Clock, Handshake
} from "lucide-react";

// -----------------
// HELPERS
// -----------------

function getRatingColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function getRatingStrokeColor(score: number) {
  if (score >= 80) return "stroke-green-500";
  if (score >= 50) return "stroke-amber-500";
  return "stroke-red-500";
}

// Default zero data — will be populated once ratings system exists
const emptyBuyerData = {
  ratingOverall: 0,
  ratingBreakdown: { positive: 0, neutral: 0, negative: 0 },
  ratingsTotal: 0,
  ratings6Months: 0,
  activities: {
    contacts: { total: 0, last6Months: 0 },
    concludedPercent: { total: 0, last6Months: 0 },
    ratingsGivenPercent: { total: 0, last6Months: 0 },
    unresolvedTenders: { total: 0, last6Months: 0 },
    withdrawnTenders: { total: 0, last6Months: 0 }
  },
};

const emptyDealerData = {
  ratingOverall: 0,
  ratingBreakdown: { positive: 0, neutral: 0, negative: 0 },
  ratingsTotal: 0,
  ratings6Months: 0,
  activities: {
    contactsRecv: { total: 0, last6Months: 0 },
    concludedPercent: { total: 0, last6Months: 0 },
    ratingsGivenPercent: { total: 0, last6Months: 0 },
    unresolvedOffers: { total: 0, last6Months: 0 },
    withdrawnOffers: { total: 0, last6Months: 0 }
  }
};

// -----------------
// MAIN COMPONENT
// -----------------

export default function AnalyticsPage() {
  const { profile } = useAuth();

  const isDealer = profile?.role === "anbieter";

  const data: any = isDealer ? emptyDealerData : emptyBuyerData;
  const ratingColorClass = getRatingColor(data.ratingOverall);
  const ratingStrokeClass = getRatingStrokeColor(data.ratingOverall);

  // Math for breakdown rendering — handle division by zero
  const totalBreakdown = data.ratingBreakdown.positive + data.ratingBreakdown.neutral + data.ratingBreakdown.negative;
  const posPct = totalBreakdown > 0 ? Math.round((data.ratingBreakdown.positive / totalBreakdown) * 100) : 0;
  const neuPct = totalBreakdown > 0 ? Math.round((data.ratingBreakdown.neutral / totalBreakdown) * 100) : 0;
  const negPct = totalBreakdown > 0 ? Math.round((data.ratingBreakdown.negative / totalBreakdown) * 100) : 0;

  // SVG Circle math
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.ratingOverall / 100) * circumference;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-32">
      
      {/* Dev Toggle Header */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white py-8 sticky top-0 z-30 shadow-md overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto max-w-6xl px-4 md:px-8 relative z-10">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <BarChart3 size={28} className="text-blue-400" />
            Bewertungen & Statistik
          </h1>
          <p className="text-sm text-blue-100/80 font-medium mt-1">Ihr Profil-Stand und Plattform-Aktivitäten auf einen Blick.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 md:px-8 mt-12 space-y-10">
        
        {/* TOP SECTION: RATINGS */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-navy-950">Erhaltene Bewertungen</h2>
            {isDealer ? (
              <Badge variant="outline" className="bg-slate-100 text-slate-500 border-none font-semibold"><Building2 size={14} className="mr-1.5 inline" /> Feedback von Nachfragern</Badge>
            ) : (
              <Badge variant="outline" className="bg-slate-100 text-slate-500 border-none font-semibold"><User size={14} className="mr-1.5 inline" /> Feedback von Händlern</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Donut Chart Card */}
            <Card className="lg:col-span-5 p-8 rounded-3xl border-slate-200 shadow-sm flex flex-col items-center justify-center text-center bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ShieldCheck size={120} />
              </div>

              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Background Track */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="80" className="stroke-slate-100" strokeWidth="16" fill="transparent" />
                  {/* Progress Ring */}
                  <circle cx="96" cy="96" r="80" className={`${ratingStrokeClass} transition-all duration-1000 ease-out`} strokeWidth="16" strokeLinecap="round" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
                </svg>
                <div className="flex flex-col items-center z-10">
                  <span className={`text-5xl font-black tracking-tighter ${ratingColorClass}`}>{data.ratingOverall}%</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
                </div>
              </div>

              <p className="mt-6 text-sm font-medium text-slate-500 max-w-[250px]">
                {totalBreakdown === 0 
                  ? "Noch keine Bewertungen erhalten. Ihr Score wird berechnet, sobald Bewertungen eingehen."
                  : (data.ratingOverall >= 80 
                    ? "Ausgezeichnet! Sie zählen zu den Top-Akteuren auf der Plattform."
                    : (data.ratingOverall >= 50 ? "Gut. Aber es gibt noch Raum für Verbesserungen." : "Ihr Score ist kritisch. Bitte reagieren Sie auf Kundenfeedback."))}
              </p>
            </Card>

            {/* Breakdown & Table Card */}
            <Card className="lg:col-span-7 p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm flex flex-col justify-between bg-white">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-6">Sentiment Breakdown</h3>
              
              <div className="space-y-5 mb-8">
                {/* Positive Bar */}
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-green-700 flex items-center gap-1.5"><CheckCircle2 size={16}/> Positiv</span>
                    <span className="text-slate-500">{data.ratingBreakdown.positive} ({posPct}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${posPct}%` }} />
                  </div>
                </div>

                {/* Neutral Bar */}
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-600 flex items-center gap-1.5"><Clock size={16}/> Neutral</span>
                    <span className="text-slate-500">{data.ratingBreakdown.neutral} ({neuPct}%)</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full transition-all duration-1000" style={{ width: `${neuPct}%` }} />
                  </div>
                </div>

                {/* Negative Bar */}
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-red-600 flex items-center gap-1.5"><XOctagon size={16}/> Negativ</span>
                    <span className="text-slate-500">{data.ratingBreakdown.negative} ({negPct}%)</span>
                  </div>
                  <div className="h-3 w-full bg-red-50 rounded-full overflow-hidden border border-red-100">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${negPct}%` }} />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3">Metrik</th>
                      <th className="px-5 py-3 w-32 border-l border-slate-200">Gesamt</th>
                      <th className="px-5 py-3 w-32 border-l border-slate-200 text-navy-900">Letzte 6 Mon.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-white">
                      <td className="px-5 py-3 font-semibold text-navy-950 flex items-center gap-2"><Star size={16} className="text-slate-400" /> Anzahl Bewertungen</td>
                      <td className="px-5 py-3 border-l border-slate-100 font-bold">{data.ratingsTotal}</td>
                      <td className="px-5 py-3 border-l border-slate-100 font-bold text-navy-900 bg-blue-50/20">{data.ratings6Months}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </Card>
          </div>
        </section>

        {/* BOTTOM SECTION: ACTIVITIES KPI */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-navy-950">{isDealer ? "Ihre Händler-Statistik" : "Ihre Aktivitäten"}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                {isDealer ? 'Erhaltene Kontakte' : 'Anbieter-Kontakte'} <MessageSquare size={16} className="text-blue-500"/>
              </div>
              <div className="font-black text-3xl text-navy-950 mb-1">{isDealer ? data.activities.contactsRecv?.total : data.activities.contacts?.total}</div>
              <div className="text-sm font-semibold text-blue-600 flex items-center gap-1.5"><TrendingUp size={14}/> {isDealer ? data.activities.contactsRecv?.last6Months : data.activities.contacts?.last6Months} in 6 M.</div>
            </Card>

            <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Vertragsabschlüsse <Handshake size={16} className="text-emerald-500"/>
              </div>
              <div className="font-black text-3xl text-navy-950 mb-1">{data.activities.concludedPercent.total}%</div>
              <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5"><TrendingUp size={14}/> {data.activities.concludedPercent.last6Months}% in 6 M.</div>
            </Card>

            <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Eigene Rezensionen <Star size={16} className="text-amber-500"/>
              </div>
              <div className="font-black text-3xl text-navy-950 mb-1">{data.activities.ratingsGivenPercent.total}%</div>
              <div className="text-sm font-semibold text-slate-500 flex items-center gap-1.5 mt-1 border-t border-slate-100 pt-2 text-[11px] leading-tight">
                Anteil der Geschäftspartner, die Sie selbst bewertet haben.
              </div>
            </Card>

            <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Offene {isDealer ? 'Angebote' : 'Ausschreibg.'} <FileText size={16} className="text-slate-400"/>
              </div>
              <div className="font-black text-3xl text-navy-950 mb-1">{isDealer ? data.activities.unresolvedOffers?.total : data.activities.unresolvedTenders?.total}</div>
              <div className="text-sm font-semibold text-slate-500 flex items-center gap-1.5 mt-1">Ohne Finalisierung</div>
            </Card>

            <Card className="p-6 rounded-3xl border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors border-l-4 border-l-red-500">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                Stornos / Abbruch <TrendingDown size={16} className="text-red-500"/>
              </div>
              <div className="font-black text-3xl text-navy-950 mb-1">{isDealer ? data.activities.withdrawnOffers?.total : data.activities.withdrawnTenders?.total}</div>
              <div className="text-sm font-semibold text-red-500/80 flex items-center gap-1.5 mt-1 text-[11px] leading-tight font-bold">
                {isDealer ? data.activities.withdrawnOffers?.last6Months : data.activities.withdrawnTenders?.last6Months} Abbrüche in letzten 6 Monaten.
              </div>
            </Card>
            
          </div>
        </section>


      </div>
    </div>
  );
}

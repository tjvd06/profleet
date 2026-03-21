"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Download, FileText, ChevronRight, CalendarDays, ExternalLink } from "lucide-react";

// -----------------
// MOCK DATA
// -----------------

type InvoiceItem = {
  name: string;
  freeCount: number;
  paidCount: number;
  pricePerUnit: number;
};

type InvoiceMonth = {
  id: string;
  title: string;
  isCurrent: boolean;
  period: string;
  items: InvoiceItem[];
};

const mockInvoices: InvoiceMonth[] = [
  {
    id: "2026-03",
    title: "März 2026",
    isCurrent: true,
    period: "01.03.2026 - 31.03.2026",
    items: [
      { name: "Konfigurationen erstellt", freeCount: 3, paidCount: 12, pricePerUnit: 5 },
      { name: "Sofort-Angebote eingestellt", freeCount: 0, paidCount: 8, pricePerUnit: 3 },
      { name: "Kontaktdaten Ausschreibungen", freeCount: 0, paidCount: 2, pricePerUnit: 30 },
      { name: "Kontaktdaten Sofort-Angebote", freeCount: 0, paidCount: 5, pricePerUnit: 10 }
    ]
  },
  {
    id: "2026-02",
    title: "Februar 2026",
    isCurrent: false,
    period: "01.02.2026 - 28.02.2026",
    items: [
      { name: "Konfigurationen erstellt", freeCount: 3, paidCount: 4, pricePerUnit: 5 },
      { name: "Sofort-Angebote eingestellt", freeCount: 0, paidCount: 15, pricePerUnit: 3 },
      { name: "Kontaktdaten Ausschreibungen", freeCount: 0, paidCount: 1, pricePerUnit: 30 },
      { name: "Kontaktdaten Sofort-Angebote", freeCount: 0, paidCount: 2, pricePerUnit: 10 }
    ]
  },
  {
    id: "2026-01",
    title: "Januar 2026",
    isCurrent: false,
    period: "01.01.2026 - 31.01.2026",
    items: [
      { name: "Konfigurationen erstellt", freeCount: 3, paidCount: 0, pricePerUnit: 5 },
      { name: "Sofort-Angebote eingestellt", freeCount: 0, paidCount: 5, pricePerUnit: 3 },
      { name: "Kontaktdaten Ausschreibungen", freeCount: 0, paidCount: 0, pricePerUnit: 30 },
      { name: "Kontaktdaten Sofort-Angebote", freeCount: 0, paidCount: 1, pricePerUnit: 10 }
    ]
  },
  {
    id: "2025-12",
    title: "Dezember 2025",
    isCurrent: false,
    period: "01.12.2025 - 31.12.2025",
    items: [
      { name: "Konfigurationen erstellt", freeCount: 3, paidCount: 5, pricePerUnit: 5 },
      { name: "Sofort-Angebote eingestellt", freeCount: 0, paidCount: 2, pricePerUnit: 3 },
      { name: "Kontaktdaten Ausschreibungen", freeCount: 0, paidCount: 4, pricePerUnit: 30 },
      { name: "Kontaktdaten Sofort-Angebote", freeCount: 0, paidCount: 0, pricePerUnit: 10 }
    ]
  }
];


// -----------------
// PAGE COMPONENT
// -----------------

export default function InvoicesPage() {
  const [activeMonthId, setActiveMonthId] = useState<string>(mockInvoices[0].id);

  // Derive the currently selected invoice based on the pill selection
  const selectedInvoice = mockInvoices.find(inv => inv.id === activeMonthId) || mockInvoices[0];

  // Calculate Totals for the selected invoice
  const totalNet = selectedInvoice.items.reduce((acc, item) => acc + (item.paidCount * item.pricePerUnit), 0);
  const vatAmount = totalNet * 0.19;
  const totalGross = totalNet + vatAmount;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-32">
      
      {/* Header Segment */}
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="container mx-auto max-w-5xl px-4 md:px-8">
          <h1 className="text-4xl font-black text-navy-950 tracking-tight mb-4 flex items-center gap-3">
            <FileText size={32} className="text-blue-600" />
            Rechnungen & Kosten
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
            Volle Transparenz über Ihre angefallenen Plattform-Gebühren, Kontaktaufdeckungen und Inseratskosten.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 md:px-8 mt-8">
        
        {/* Horizontal Pills Selector */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-4 hide-scrollbar snap-x">
          {mockInvoices.map((month) => (
            <button
              key={month.id}
              onClick={() => setActiveMonthId(month.id)}
              className={`snap-start whitespace-nowrap px-6 py-3 rounded-2xl font-bold transition-all border-2 text-sm md:text-base flex items-center gap-2
                ${activeMonthId === month.id 
                  ? 'bg-navy-900 border-navy-900 text-white shadow-md shadow-navy-900/20' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              <CalendarDays size={18} className={activeMonthId === month.id ? 'text-blue-400' : 'text-slate-400'} />
              {month.title}
              {month.isCurrent && (
                <span className={`ml-1.5 w-2 h-2 rounded-full ${activeMonthId === month.id ? 'bg-blue-400' : 'bg-blue-500'}`} />
              )}
            </button>
          ))}
        </div>

        {/* Selected Invoice Card */}
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Card Header */}
          <div className="p-6 md:p-8 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-black text-navy-950">{selectedInvoice.title}</h2>
                {selectedInvoice.isCurrent && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none px-2.5 py-0.5 font-bold">Laufender Monat</Badge>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                Abrechnungszeitraum: <span className="text-navy-900">{selectedInvoice.period}</span>
              </p>
            </div>
            
            <div className="text-left md:text-right w-full md:w-auto bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border md:border-none border-slate-100 shadow-sm md:shadow-none">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Vorläufiger Gesamtbetrag</div>
              <div className="text-4xl font-black text-navy-950 tracking-tight">
                {totalGross.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </div>
            </div>
          </div>

          {/* Table Area */}
          <div className="p-6 md:p-8">
            <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[11px] tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Leistungsposten</th>
                    <th className="px-6 py-4 text-center">Kostenlos (Inkl.)</th>
                    <th className="px-6 py-4 text-center text-blue-700">Kostenpflichtig</th>
                    <th className="px-6 py-4 text-right">Preis / Stück</th>
                    <th className="px-6 py-4 text-right text-navy-950">Gesamt Netto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((item, idx) => {
                    const rowTotal = item.paidCount * item.pricePerUnit;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="font-bold text-navy-950 text-base">{item.name}</div>
                          <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Details anzeigen <ExternalLink size={12} />
                          </button>
                        </td>
                        <td className="px-6 py-5 text-center">
                          {item.freeCount > 0 
                            ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">{item.freeCount}x</Badge>
                            : <span className="text-slate-300 font-medium">-</span>}
                        </td>
                        <td className="px-6 py-5 text-center">
                          {item.paidCount > 0 
                            ? <Badge className="bg-blue-100 text-blue-800 border-none font-bold text-sm px-2.5 py-0.5">{item.paidCount}x</Badge>
                            : <span className="text-slate-300 font-medium">-</span>}
                        </td>
                        <td className="px-6 py-5 text-right font-semibold text-slate-500">
                          {item.pricePerUnit.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                        </td>
                        <td className="px-6 py-5 text-right font-black text-navy-950 text-base">
                          {rowTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summation Area */}
            <div className="mt-8 flex flex-col items-end gap-2 border-t border-slate-100 pt-6">
              <div className="flex justify-between w-full md:w-80 text-base font-bold text-slate-600 px-4">
                <span>Summe Netto</span>
                <span>{totalNet.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between w-full md:w-80 text-sm font-medium text-slate-400 px-4">
                <span>zzgl. 19% MwSt.</span>
                <span>{vatAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
              </div>
              <div className="flex justify-between w-full md:w-80 text-xl md:text-2xl font-black text-navy-950 bg-slate-100 p-4 rounded-xl mt-2">
                <span>Rechnungsbetrag</span>
                <span>{totalGross.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 flex justify-end pb-2">
              <Button disabled={selectedInvoice.isCurrent} className={`rounded-xl h-14 px-8 font-bold text-base shadow-sm transition-all ${selectedInvoice.isCurrent ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'}`}>
                <Download size={20} className="mr-2" /> 
                {selectedInvoice.isCurrent ? 'Rechnung noch nicht fällig' : 'Rechnung herunterladen (PDF)'}
              </Button>
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
}

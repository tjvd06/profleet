import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, Building2, MapPin } from "lucide-react";
import Link from "next/link";
import { RatingBadge } from "@/components/ui-custom/RatingBadge";

export function DealerTenderCard({ tender }: { tender: any }) {
  const isPreferred = tender.isPreferredDealer;

  return (
    <Card className={`relative overflow-hidden mb-6 rounded-3xl transition-all hover:shadow-lg ${isPreferred ? 'border-amber-300 shadow-amber-100/50' : 'border-slate-200 shadow-sm'}`}>
      {isPreferred && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-sm font-bold px-6 py-2.5 flex items-center justify-center gap-2 shadow-sm rounded-t-3xl">
          <AlertCircle size={18} /> Der Kunde hat Sie aktiv als Wunschhändler für diese Ausschreibung angefragt!
        </div>
      )}
      <div className="flex flex-col lg:flex-row">
        {/* Left Side: Buyer & Meta */}
        <div className="lg:w-1/3 bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <Badge variant="outline" className="bg-white border-slate-300 text-slate-600 font-mono shadow-sm">
                {tender.id}
              </Badge>
              <div className="flex items-center gap-1.5 text-slate-600 text-sm font-bold bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <Clock size={16} className="text-blue-500" /> {tender.timeLeft}
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center mt-6 mb-8">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-3 shadow-[0_4px_10px_rgba(0,0,0,0.03)] text-navy-800">
                <Building2 size={28} />
              </div>
              <h3 className="font-bold text-navy-950 text-lg">{tender.buyerType}</h3>
              <div className="flex items-center text-slate-500 text-sm mt-1.5 gap-1.5 font-medium">
                <MapPin size={16} /> {tender.location}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500">Käufer-Rating</span>
              <RatingBadge score={tender.buyerRating} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Erfolgsquote</span>
              <span className="font-bold text-navy-950 text-lg">{tender.successRate}%</span>
            </div>
          </div>
        </div>
        
        {/* Right Side: Vehicle Table & Action */}
        <div className="lg:w-2/3 p-6 sm:p-8 flex flex-col">
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-semibold">Angebotsarten:</Badge>
            {tender.requestedTypes.map((type: string) => (
              <Badge key={type} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">{type}</Badge>
            ))}
            {tender.fleetDiscount && <Badge className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 ml-2">Großkundenvertrag ({tender.fleetDiscountPercent}%)</Badge>}
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-4 border-b border-slate-200 w-20 text-center">Menge</th>
                  <th className="px-5 py-4 border-b border-slate-200">Fahrzeug</th>
                  <th className="px-5 py-4 border-b border-slate-200 text-right">Listenpreis Brutto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tender.vehicles.map((v: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-black text-navy-950 text-center text-lg bg-slate-50/30 border-r border-slate-100">{v.quantity}x</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-navy-950 text-base mb-1">{v.brand} {v.model}</div>
                      <div className="text-slate-500 text-sm leading-relaxed">{v.specs}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700 text-right whitespace-nowrap">ca. {v.price.toLocaleString('de-DE')} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500 font-medium">
              Aktuell <span className="font-bold text-navy-950 text-base">{tender.currentOffers}</span> Angebote von Mitbewerbern
            </div>
            <Link 
              href={`/dashboard/eingang/${tender.id}/angebot`} 
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-md shadow-blue-500/20 text-white font-bold px-10 h-14 text-base transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              Jetzt Angebot erstellen
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

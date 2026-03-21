import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingBadge } from "@/components/ui-custom/RatingBadge";
import { SavingsBadge } from "@/components/ui-custom/SavingsBadge";
import { Bookmark, MapPin, Zap, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface InstantOfferProps {
  id: string;
  brand: string;
  model: string;
  specs: string;
  availability: string;
  listPrice: number;
  offerPrice: number;
  savingsPercent: number;
  leasingRate?: number | null;
  financeRate?: number | null;
  dealerRating: number;
  dealerLocation: string;
  imageUrl?: string;
}

export function InstantOfferCard({ offer }: { offer: InstantOfferProps }) {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <Card className="flex flex-col overflow-hidden rounded-3xl border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group bg-white h-full relative">
      {/* Image Area */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden shrink-0">
        {offer.imageUrl ? (
          <img src={offer.imageUrl} alt={`${offer.brand} ${offer.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            {/* Minimalist Car Silhouette Placeholder */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-24 h-24 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 19v-1c0-1.1.9-2 2-2h4a2 2 0 012 2v1M3 13.5v-1c0-2.8 2.2-5 5-5h8a5 5 0 015 5v1M3 13.5C3 15.4 4.6 17 6.5 17h11c1.9 0 3.5-1.6 3.5-3.5M6.5 17A2.5 2.5 0 014 14.5M17.5 17a2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5" />
            </svg>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-white/95 text-navy-950 font-bold border-none shadow-sm backdrop-blur-md px-2.5 py-1 text-xs">
            {offer.availability}
          </Badge>
        </div>
        <button 
          onClick={(e) => { e.preventDefault(); setBookmarked(!bookmarked); }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/50 hover:bg-white/95 backdrop-blur-md flex items-center justify-center transition-all shadow-sm text-slate-400 hover:text-red-500 z-10"
        >
          <Bookmark size={20} className={bookmarked ? "fill-red-500 text-red-500" : ""} />
        </button>

        {/* Fade overlay bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Title & Specs */}
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 mt-1">{offer.brand}</div>
          <h3 className="font-bold text-navy-950 text-xl leading-tight mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{offer.model}</h3>
          <p className="text-sm text-slate-500 line-clamp-1">{offer.specs}</p>
        </div>

        {/* Pricing */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-slate-400 text-sm line-through decoration-slate-300 font-medium">UVP {offer.listPrice.toLocaleString('de-DE')} €</div>
              <div className="font-black text-navy-950 text-3xl tracking-tight">
                {offer.offerPrice.toLocaleString('de-DE')} €
              </div>
            </div>
            <div className="pb-1">
              <SavingsBadge savings={offer.savingsPercent} />
            </div>
          </div>

          {/* Mini-Pills for Financing/Leasing */}
          <div className="flex gap-2 mb-5">
            {offer.leasingRate && (
              <Badge variant="outline" className="bg-blue-50/50 border-blue-100 text-blue-700 font-semibold px-2">
                Leasing ab {offer.leasingRate} €
              </Badge>
            )}
            {offer.financeRate && (
              <Badge variant="outline" className="bg-emerald-50/50 border-emerald-100 text-emerald-700 font-semibold px-2">
                Finanzierung ab {offer.financeRate} €
              </Badge>
            )}
          </div>
        </div>

        {/* Dealer Info Footer */}
        <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3 mt-2 border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <MapPin size={14} className="text-slate-400" />
            <span className="truncate max-w-[100px]">{offer.dealerLocation}</span>
          </div>
          <RatingBadge score={offer.dealerRating} />
        </div>
        
      </div>
    </Card>
  );
}

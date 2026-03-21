import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SavingsBadge } from "../ui-custom/SavingsBadge";
import { RatingBadge } from "../ui-custom/RatingBadge";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TenderCardProps {
  id: string;
  brand: string;
  model: string;
  location: string;
  timeLeft: string;
  listPrice: number;
  currentBid: number;
  savings: number;
  offersCount: number;
  buyerRating: number;
}

export function TenderCard({ id, brand, model, location, timeLeft, listPrice, currentBid, savings, offersCount, buyerRating }: TenderCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-white border-slate-200 rounded-2xl group">
      <CardContent className="p-0 sm:flex">
        <div className="p-6 sm:w-2/3 border-b sm:border-b-0 sm:border-r border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="text-slate-400 font-mono text-xs border-slate-200">ID: {id}</Badge>
              <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none font-medium px-2 py-0">Kauf</Badge>
            </div>
            <h3 className="text-2xl font-bold text-navy-950 mb-3">{brand} <span className="font-medium text-slate-600">{model}</span></h3>
            
            <div className="flex items-center gap-5 text-sm font-medium text-slate-500 mb-6">
              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" />{location}</span>
              <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md"><Clock size={16} /> Noch {timeLeft}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <RatingBadge score={buyerRating} label="Nachfrager" />
            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{offersCount} Angebote</span>
          </div>
        </div>
        
        <div className="p-6 sm:w-1/3 bg-slate-50/80 flex flex-col justify-center group-hover:bg-blue-50/30 transition-colors">
          <div className="mb-2 text-sm font-medium text-slate-400">
            Listenpreis: <span className="line-through">{listPrice.toLocaleString('de-DE')} €</span>
          </div>
          <div className="mb-4">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">Bestes Angebot</span>
            <div className="text-3xl font-bold tracking-tight text-navy-950">
              {currentBid.toLocaleString('de-DE')} €
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <SavingsBadge savings={savings} />
          </div>
          <Button className="w-full bg-navy-800 hover:bg-navy-950 text-white rounded-xl shadow-md transition-all">
            Details ansehen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

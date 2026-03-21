import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { SavingsBadge } from "../ui-custom/SavingsBadge";
import { RatingBadge } from "../ui-custom/RatingBadge";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VehicleCardProps {
  brand: string;
  model: string;
  specs: string;
  listPrice: number;
  finalPrice: number;
  savings: number;
  leasing?: number;
  dealerRating: number;
  location: string;
}

export function VehicleCard({ brand, model, specs, listPrice, finalPrice, savings, leasing, dealerRating, location }: VehicleCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 bg-white border-slate-200 rounded-2xl">
      <div className="aspect-video bg-gradient-to-tr from-slate-100 to-slate-50 flex items-center justify-center relative border-b border-slate-100">
        <span className="text-slate-300 font-bold text-3xl tracking-tighter">{brand}</span>
        <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white border text-slate-400 hover:text-red-500 shadow-sm transition-all h-8 w-8">
          <Heart size={16} />
        </Button>
      </div>
      <CardHeader className="p-5 pb-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-navy-950 text-lg leading-tight">{brand} <span className="font-medium text-slate-600">{model}</span></h3>
        </div>
        <p className="text-sm text-slate-500 line-clamp-1">{specs}</p>
      </CardHeader>
      <CardContent className="p-5 pt-0 flex-grow">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 line-through mb-1">UVP {listPrice.toLocaleString('de-DE')} €</p>
            <p className="text-2xl font-bold tracking-tight text-navy-900">{finalPrice.toLocaleString('de-DE')} €</p>
          </div>
          <div className="text-right">
            <SavingsBadge savings={savings} />
          </div>
        </div>
        {leasing && (
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary" className="bg-slate-50 text-slate-600 font-normal border-slate-200">
              Leasing ab {leasing} €/Mt
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-5 pt-0 flex justify-between items-center bg-slate-50/50 border-t border-slate-100 mt-auto">
        <div className="flex flex-col gap-1 mt-3">
          <RatingBadge score={dealerRating} />
          <span className="text-xs text-slate-400">{location}</span>
        </div>
        <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl mt-3 font-semibold transition-colors">Ansehen</Button>
      </CardFooter>
    </Card>
  );
}

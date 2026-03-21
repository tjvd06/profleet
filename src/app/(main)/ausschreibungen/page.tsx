import { FilterBar } from "@/components/ui-custom/FilterBar";
import { TenderCard } from "@/components/tenders/TenderCard";
import { Button } from "@/components/ui/button";

const mockTenders = [
  { id: 'AU-23435', brand: 'Audi', model: 'A4 Avant RS4', location: 'München · 100km', timeLeft: '3 Tage 14 Std.', listPrice: 89138, currentBid: 75411, savings: 15.4, offersCount: 7, buyerRating: 100 },
  { id: 'AU-23436', brand: 'BMW', model: 'M3 Competition', location: 'Berlin · 200km', timeLeft: '1 Tag 2 Std.', listPrice: 101200, currentBid: 85000, savings: 16.0, offersCount: 12, buyerRating: 90 },
  { id: 'AU-23437', brand: 'VW', model: 'Passat Variant', location: 'Hamburg · 50km', timeLeft: '5 Tage 8 Std.', listPrice: 45000, currentBid: 39500, savings: 12.2, offersCount: 3, buyerRating: 80 },
  { id: 'AU-23438', brand: 'Porsche', model: 'Macan S', location: 'Stuttgart · 50km', timeLeft: '12 Std.', listPrice: 82000, currentBid: 76500, savings: 6.7, offersCount: 5, buyerRating: 100 },
];

export default function AusschreibungenPage() {
  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Segment */}
      <div className="bg-white border-b border-slate-200 py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h1 className="text-4xl font-bold text-navy-950 tracking-tight mb-2">Laufende Ausschreibungen</h1>
          <p className="text-lg text-slate-500">Aktuell 43 aktive Ausschreibungen von Geschäftskunden aus ganz Deutschland.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 -mt-6">
        {/* Filter Bar (pulls up over the header border slightly due to positioning) */}
        <div className="mb-10">
          <FilterBar />
        </div>

        {/* Results List */}
        <div className="flex flex-col gap-6">
          {mockTenders.map((tender) => (
            <TenderCard key={tender.id} {...tender} />
          ))}
        </div>

        {/* Pagination / Load More */}
        <div className="mt-12 flex justify-center">
          <Button variant="outline" size="lg" className="rounded-xl px-12 border-slate-300 text-slate-600 bg-white hover:bg-slate-50">
            Mehr laden
          </Button>
        </div>
      </div>
    </div>
  );
}

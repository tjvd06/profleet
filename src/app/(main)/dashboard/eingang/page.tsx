import { FilterBar } from "@/components/ui-custom/FilterBar";
import { DealerTenderCard } from "@/components/tenders/DealerTenderCard";
import { Button } from "@/components/ui/button";

const mockDealerTenders = [
  {
    id: "AU-89342",
    timeLeft: "2 Tage 14 Std.",
    buyerType: "IT-Dienstleister",
    location: "München (80331) · 45 km entfernt",
    buyerRating: 100,
    successRate: 85,
    isPreferredDealer: true,
    requestedTypes: ["Kauf", "Leasing (36M / 15.000km)"],
    fleetDiscount: false,
    currentOffers: 2,
    vehicles: [
      { quantity: 5, brand: "Audi", model: "A4 Avant S-Line", specs: "2.0 TDI 204 PS, Mythosschwarz Metallic, Matrix LED, Assistenzpaket Tour", price: 62450 }
    ]
  },
  {
    id: "AU-89343",
    timeLeft: "5 Std. 20 Min.",
    buyerType: "Handwerksbetrieb",
    location: "Augsburg (86150) · 60 km entfernt",
    buyerRating: 85,
    successRate: 100,
    isPreferredDealer: false,
    requestedTypes: ["Kauf", "Finanzierung (48M)"],
    fleetDiscount: true,
    fleetDiscountPercent: 12,
    currentOffers: 6,
    vehicles: [
      { quantity: 2, brand: "VW", model: "Transporter Kastenwagen", specs: "2.0 TDI 150 PS, Candy-Weiß", price: 45000 },
      { quantity: 1, brand: "VW", model: "Caddy Cargo", specs: "2.0 TDI 122 PS, Candy-Weiß", price: 32000 }
    ]
  },
  {
    id: "AU-89344",
    timeLeft: "6 Tage",
    buyerType: "Immobilienagentur",
    location: "Nürnberg (90403) · 150 km entfernt",
    buyerRating: 95,
    successRate: 40,
    isPreferredDealer: false,
    requestedTypes: ["Leasing (48M / 10.000km)"],
    fleetDiscount: false,
    currentOffers: 0,
    vehicles: [
      { quantity: 1, brand: "Porsche", model: "Macan", specs: "2.0 265 PS, Vulkangraumetallic, Panorama Dachsystem", price: 81500 }
    ]
  }
];

export default function InboxPage() {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-24">
      {/* Header Segment */}
      <div className="bg-white border-b border-slate-200 py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-navy-950 tracking-tight mb-4">Eingang Ausschreibungen</h1>
              <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">Aktuell 34 neue Ausschreibungen in Ihrem Vertriebsgebiet, die auf Ihre eingestellten Filterkonditionen zutreffen.</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 mt-auto">
              <div className="text-center px-4 border-r border-blue-200/50">
                <div className="text-2xl font-black text-blue-700">34</div>
                <div className="text-sm font-semibold text-blue-900/60 uppercase tracking-wider">Neu</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-black text-amber-500">2</div>
                <div className="text-sm font-semibold text-amber-900/60 uppercase tracking-wider">Wunschhändler</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 -mt-7">
        <div className="mb-10 shadow-lg shadow-slate-200/50 rounded-2xl relative z-10">
          <FilterBar />
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          {mockDealerTenders.map((tender) => (
            <DealerTenderCard key={tender.id} tender={tender} />
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Button variant="outline" size="lg" className="rounded-xl px-12 h-14 border-slate-300 text-slate-600 bg-white hover:bg-slate-50 hover:text-navy-950 font-bold transition-colors">
            Weitere Ausschreibungen laden
          </Button>
        </div>
      </div>
    </div>
  );
}

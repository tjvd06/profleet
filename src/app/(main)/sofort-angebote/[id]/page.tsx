"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SavingsBadge } from "@/components/ui-custom/SavingsBadge";
import {
  ChevronLeft, ChevronRight, Bookmark, Phone, MapPin, Package,
  Calendar, Loader2, ShieldCheck, ChevronDown, ChevronUp, Info, Mail, Building2, Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import {
  type InstantOfferRow,
  buildSpecsString,
  buildEquipmentDetails,
  getImageUrl,
  calcSavingsPercent,
  buildLocationString,
} from "@/lib/instant-offers";

export default function InstantOfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [supabase] = useState(() => createClient());

  const offerId = params.id as string;

  const [offer, setOffer] = useState<InstantOfferRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Image carousel
  const [currentImage, setCurrentImage] = useState(0);

  // Dealer profile
  const [dealerProfile, setDealerProfile] = useState<{
    company_name: string | null;
    first_name: string | null;
    last_name: string | null;
    dealer_type: string | null;
    zip: string | null;
    city: string | null;
    street: string | null;
    phone: string | null;
    email_public: string | null;
    subscription_tier: string | null;
    created_at: string | null;
  } | null>(null);

  // Collapsible sections
  const [showEquipment, setShowEquipment] = useState(true);
  const [showLeasing, setShowLeasing] = useState(false);
  const [showFinancing, setShowFinancing] = useState(false);

  // Fetch offer + dealer profile
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("instant_offers")
        .select("*")
        .eq("id", offerId)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        const offerData = data as InstantOfferRow;
        setOffer(offerData);

        // Load dealer profile
        if (offerData.dealer_id) {
          const { data: dp } = await supabase
            .from("profiles")
            .select("company_name, first_name, last_name, dealer_type, zip, city, street, phone, email_public, subscription_tier, created_at")
            .eq("id", offerData.dealer_id)
            .single();
          if (dp) setDealerProfile(dp);
        }
      }
      setLoading(false);
    })();
  }, [supabase, offerId]);

  // Fetch bookmark state
  useEffect(() => {
    if (!user || !offerId) return;
    (async () => {
      const { data } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("instant_offer_id", offerId)
        .maybeSingle();
      setBookmarked(!!data);
    })();
  }, [user, offerId, supabase]);

  const toggleBookmark = async () => {
    if (!user) return;
    const newState = !bookmarked;
    setBookmarked(newState);
    if (newState) {
      await supabase.from("bookmarks").insert({ user_id: user.id, instant_offer_id: offerId });
    } else {
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("instant_offer_id", offerId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (notFound || !offer) {
    return (
      <div className="text-center py-24 max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-navy-950 mb-4">Angebot nicht gefunden</h1>
        <p className="text-slate-500 mb-8">Das Sofort-Angebot existiert nicht oder ist abgelaufen.</p>
        <Link href="/sofort-angebote">
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12">
            Zurück zum Marktplatz
          </Button>
        </Link>
      </div>
    );
  }

  const specs = buildSpecsString(offer);
  const equipmentDetails = buildEquipmentDetails(offer);
  const location = buildLocationString(offer);
  const listPrice = offer.list_price_gross ?? offer.list_price_net ?? 0;
  const offerPrice = offer.purchase_price_net ?? 0;
  const savingsPercent = offer.discount_percent ?? calcSavingsPercent(listPrice, offerPrice);
  const images = offer.images || [];
  const isBuyer = profile?.role === "nachfrager";
  const expiresAt = offer.expires_at ? new Date(offer.expires_at) : null;
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Back Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 py-3 flex items-center gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-navy-950 transition-colors">
            <ChevronLeft size={18} /> Zurück
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-400">Sofort-Angebot</span>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left Column: Images + Equipment */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {images.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div className="relative aspect-[16/10] bg-slate-100">
                    <img
                      src={getImageUrl(images[currentImage])}
                      alt={`${offer.brand} ${offer.model_name} - Bild ${currentImage + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all"
                        >
                          <ChevronRight size={20} />
                        </button>
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                          {currentImage + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {images.length > 1 && (
                    <div className="p-3 flex gap-2 overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImage(idx)}
                          className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            idx === currentImage ? "border-blue-500 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-20 h-20 mx-auto mb-3 opacity-30">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 19v-1c0-1.1.9-2 2-2h4a2 2 0 012 2v1M3 13.5v-1c0-2.8 2.2-5 5-5h8a5 5 0 015 5v1M3 13.5C3 15.4 4.6 17 6.5 17h11c1.9 0 3.5-1.6 3.5-3.5" />
                    </svg>
                    <p className="font-semibold">Keine Bilder vorhanden</p>
                  </div>
                </div>
              )}
            </div>

            {/* Equipment Details - Collapsible */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowEquipment(!showEquipment)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
              >
                <h2 className="text-xl font-bold text-navy-950">Fahrzeugdetails & Ausstattung</h2>
                {showEquipment ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
              {showEquipment && (
                <div className="px-6 pb-6">
                  {equipmentDetails.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                      {equipmentDetails.map((d, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-500 font-medium">{d.label}</span>
                          <span className="text-sm font-semibold text-navy-950 text-right">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">Keine detaillierten Spezifikationen verfügbar.</p>
                  )}
                </div>
              )}
            </div>

            {/* Leasing Conditions - Collapsible */}
            {offer.leasing_enabled && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowLeasing(!showLeasing)}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                >
                  <h2 className="text-xl font-bold text-navy-950">Leasing-Konditionen</h2>
                  {showLeasing ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>
                {showLeasing && (
                  <div className="px-6 pb-6 space-y-3">
                    {offer.leasing_rate_net && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500 font-medium">Monatliche Rate (netto)</span>
                        <span className="text-sm font-bold text-navy-950">{Number(offer.leasing_rate_net).toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                    {offer.leasing_duration && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500 font-medium">Laufzeit</span>
                        <span className="text-sm font-semibold text-navy-950">{offer.leasing_duration} Monate</span>
                      </div>
                    )}
                    {offer.leasing_mileage && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500 font-medium">Kilometerleistung p.a.</span>
                        <span className="text-sm font-semibold text-navy-950">{offer.leasing_mileage.toLocaleString("de-DE")} km</span>
                      </div>
                    )}
                    {offer.leasing_conditions && (
                      <div className="pt-2">
                        <span className="text-sm text-slate-500 font-medium block mb-1">Hinweise</span>
                        <p className="text-sm text-navy-950">{offer.leasing_conditions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Financing Conditions - Collapsible */}
            {offer.financing_enabled && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowFinancing(!showFinancing)}
                  className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                >
                  <h2 className="text-xl font-bold text-navy-950">Finanzierungs-Konditionen</h2>
                  {showFinancing ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>
                {showFinancing && (
                  <div className="px-6 pb-6 space-y-3">
                    {offer.financing_rate_net && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500 font-medium">Monatliche Rate (netto)</span>
                        <span className="text-sm font-bold text-navy-950">{Number(offer.financing_rate_net).toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                    {offer.financing_duration && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500 font-medium">Laufzeit</span>
                        <span className="text-sm font-semibold text-navy-950">{offer.financing_duration} Monate</span>
                      </div>
                    )}
                    {offer.financing_downpayment && (
                      <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-500 font-medium">Anzahlung</span>
                        <span className="text-sm font-semibold text-navy-950">{Number(offer.financing_downpayment).toLocaleString("de-DE")} €</span>
                      </div>
                    )}
                    {offer.financing_conditions && (
                      <div className="pt-2">
                        <span className="text-sm text-slate-500 font-medium block mb-1">Hinweise</span>
                        <p className="text-sm text-navy-950">{offer.financing_conditions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Dealer, Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{offer.brand}</div>
              <h1 className="text-2xl md:text-3xl font-black text-navy-950 tracking-tight mb-3">{offer.model_name}</h1>
              {specs && <p className="text-sm text-slate-500 mb-4">{specs}</p>}

              <div className="flex flex-wrap gap-2">
                {offer.quantity > 1 && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-semibold px-3 py-1 flex items-center gap-1">
                    <Package size={14} /> {offer.quantity}x verfügbar
                  </Badge>
                )}
                {daysLeft !== null && daysLeft > 0 && (
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-semibold px-3 py-1 flex items-center gap-1">
                    <Calendar size={14} /> Noch {daysLeft} Tage
                  </Badge>
                )}
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-navy-950 mb-4">Preise</h2>

              {/* Purchase */}
              <div className="mb-4">
                {listPrice > 0 && (
                  <div className="text-slate-400 text-sm line-through decoration-slate-300 font-medium">
                    UVP {listPrice.toLocaleString("de-DE")} €
                  </div>
                )}
                <div className="flex items-end gap-3">
                  <span className="font-black text-navy-950 text-4xl tracking-tight">
                    {offerPrice > 0 ? `${offerPrice.toLocaleString("de-DE")} €` : "Auf Anfrage"}
                  </span>
                  {savingsPercent > 0 && <SavingsBadge savings={savingsPercent} />}
                </div>
                <span className="text-xs text-slate-400 font-medium">Kaufpreis netto</span>
              </div>

              {/* Additional costs */}
              {(offer.transfer_cost || offer.registration_cost) && (
                <div className="border-t border-slate-100 pt-3 mt-3 space-y-1">
                  {offer.transfer_cost && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Überführungskosten</span>
                      <span className="font-semibold text-navy-950">{Number(offer.transfer_cost).toLocaleString("de-DE")} €</span>
                    </div>
                  )}
                  {offer.registration_cost && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Zulassungskosten</span>
                      <span className="font-semibold text-navy-950">{Number(offer.registration_cost).toLocaleString("de-DE")} €</span>
                    </div>
                  )}
                  {offer.total_price && (
                    <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-100 mt-2">
                      <span className="text-navy-950">Gesamtpreis netto</span>
                      <span className="text-navy-950">{Number(offer.total_price).toLocaleString("de-DE")} €</span>
                    </div>
                  )}
                </div>
              )}

              {/* Financing options pills */}
              <div className="mt-4 space-y-2">
                {offer.leasing_enabled && offer.leasing_rate_net && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-sm font-semibold text-blue-700">Leasing</span>
                    <span className="text-lg font-black text-blue-700">ab {Number(offer.leasing_rate_net).toLocaleString("de-DE")} € / Monat</span>
                  </div>
                )}
                {offer.financing_enabled && offer.financing_rate_net && (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-sm font-semibold text-emerald-700">Finanzierung</span>
                    <span className="text-lg font-black text-emerald-700">ab {Number(offer.financing_rate_net).toLocaleString("de-DE")} € / Monat</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dealer Info Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-navy-950 mb-4">Anbieter</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 size={24} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-navy-950 text-lg">{dealerProfile?.company_name || "Anbieter"}</div>
                  {dealerProfile?.first_name && (
                    <div className="text-sm text-slate-600">{dealerProfile.first_name} {dealerProfile.last_name}</div>
                  )}
                </div>
              </div>
              {dealerProfile && (
                <div className="space-y-2 mb-4">
                  {dealerProfile.dealer_type && (
                    <div className="text-sm text-slate-500">
                      <span className="font-semibold text-slate-400 text-xs uppercase tracking-wider">Händlertyp:</span>{" "}
                      <span className="font-medium text-slate-700">{dealerProfile.dealer_type}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin size={14} className="shrink-0 text-slate-400" />
                    {dealerProfile.street && <span>{dealerProfile.street}, </span>}
                    {dealerProfile.zip || ""} {dealerProfile.city || location}
                  </div>
                  {dealerProfile.email_public && (
                    <a href={`mailto:${dealerProfile.email_public}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      <Mail size={14} className="shrink-0" /> {dealerProfile.email_public}
                    </a>
                  )}
                  {dealerProfile.phone && (
                    <a href={`tel:${dealerProfile.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      <Phone size={14} className="shrink-0" /> {dealerProfile.phone}
                    </a>
                  )}
                  {dealerProfile.created_at && (
                    <div className="text-xs text-slate-400 mt-1">
                      Mitglied seit {new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(new Date(dealerProfile.created_at))}
                    </div>
                  )}
                </div>
              )}
              {offer.delivery_radius && (
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <Info size={14} className="text-slate-400 shrink-0" />
                  Lieferung im Umkreis von {offer.delivery_radius} km möglich
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sticky bottom-6">
              {user && isBuyer && (
                <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-600/20">
                  <Send size={18} className="mr-2" /> Anfrage senden
                </Button>
              )}
              {user ? (
                <Button
                  variant="outline"
                  className={`w-full h-14 rounded-2xl font-bold text-lg transition-all ${
                    bookmarked
                      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={toggleBookmark}
                >
                  <Bookmark size={18} className={`mr-2 ${bookmarked ? "fill-red-500" : ""}`} />
                  {bookmarked ? "Gemerkt" : "Merken"}
                </Button>
              ) : (
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-lg">
                    Anmelden um alle Details zu sehen
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

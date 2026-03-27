"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Handshake, Archive, Clock, ExternalLink, Loader2, MessageCircle, Phone, Building2, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

type BuyerProfile = {
  id: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  industry: string | null;
  zip: string | null;
  city: string | null;
  street: string | null;
  phone: string | null;
  email_public: string | null;
};

type Contact = {
  id: string;
  tender_id: string;
  offer_id: string;
  buyer_id: string;
  dealer_id: string;
  status: string;
  dealer_responded: boolean;
  contract_concluded: boolean | null;
  created_at: string;
};

function EmptyTabState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
        <Icon size={36} />
      </div>
      <h3 className="text-xl font-bold text-navy-950 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm">{description}</p>
    </div>
  );
}

function timeLeft(endAt: string | null): string {
  if (!endAt) return "—";
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "Abgelaufen";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return days > 0 ? `${days}T ${hours}Std` : `${hours} Std.`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(dateStr));
}

export default function DealerOffersPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [offers, setOffers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [buyerProfiles, setBuyerProfiles] = useState<Record<string, BuyerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);


  useEffect(() => {
    if (!authLoading && profile && profile.role !== "anbieter") {
      router.replace("/dashboard");
    }
  }, [authLoading, profile]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    const run = async () => {
      try {
        const [offersResult, contactsResult] = await Promise.all([
          Promise.race([
            supabase
              .from("offers")
              .select(`
                *,
                tenders (
                  id, status, end_at, buyer_id
                ),
                tender_vehicles!tender_vehicle_id (
                  brand, model_name, quantity, list_price_gross
                )
              `)
              .eq("dealer_id", user.id)
              .order("created_at", { ascending: false }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("TIMEOUT")), 10000)
            ),
          ]),
          supabase.from("contacts").select("*").eq("dealer_id", user.id),
        ]);

        if (cancelled) return;
        const { data, error } = offersResult as any;
        const { data: contactsData } = contactsResult as any;

        if (error) {
          console.error("[Angebote] Error:", error.message);
          setFetchError(error.message);
        } else if (data) {
          setOffers(data);

          const loadedContacts = (contactsData || []) as Contact[];
          setContacts(loadedContacts);

          // Load buyer profiles for ALL tenders (full transparency)
          const allBuyerIds = Array.from(new Set([
            ...loadedContacts.map((c) => c.buyer_id),
            ...data.filter((o: any) => o.tenders?.buyer_id).map((o: any) => o.tenders.buyer_id),
          ]));
          if (allBuyerIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, company_name, first_name, last_name, industry, zip, city, street, phone, email_public")
              .in("id", allBuyerIds);
            if (profiles) {
              const map: Record<string, BuyerProfile> = {};
              profiles.forEach((p: BuyerProfile) => { map[p.id] = p; });
              setBuyerProfiles(map);
            }
          }
        }
      } catch (e: any) {
        if (cancelled) return;
        const isTimeout = e?.message === "TIMEOUT";
        console.error("[Angebote] Error:", e?.message);
        setFetchError(
          isTimeout
            ? "Daten konnten nicht geladen werden. Bitte Seite neu laden."
            : e?.message || "Unbekannter Fehler"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [authLoading, user?.id]);

  const activeOffers = offers.filter(o => o.tenders?.status === "active");
  const archivedOffers = offers.filter(o => o.tenders?.status !== "active");
  const contactedOffers = contacts.map((c) => {
    const offer = offers.find((o) => o.id === c.offer_id);
    return { contact: c, offer };
  }).filter((x) => x.offer);

  const renderOfferCard = (offer: any) => {
    const vehicle = offer.tender_vehicles || null;
    const vehicleLabel = vehicle
      ? `${vehicle.brand || ""} ${vehicle.model_name || ""}`.trim() || "Fahrzeug"
      : "Ausschreibung";
    const buyer = offer.tenders?.buyer_id ? buyerProfiles[offer.tenders.buyer_id] : null;

    return (
      <Card key={offer.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Buyer info row */}
          {buyer && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                <Building2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-navy-950 text-sm">{buyer.company_name || "Nachfrager"}</div>
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  {buyer.first_name && <span>{buyer.first_name} {buyer.last_name}</span>}
                  {(buyer.zip || buyer.city) && <span className="flex items-center gap-1"><MapPin size={10} /> {buyer.zip || ""} {buyer.city || ""}</span>}
                  {buyer.email_public && <a href={`mailto:${buyer.email_public}`} className="flex items-center gap-1 text-blue-600"><Mail size={10} /> {buyer.email_public}</a>}
                  {buyer.phone && <a href={`tel:${buyer.phone}`} className="flex items-center gap-1 text-blue-600"><Phone size={10} /> {buyer.phone}</a>}
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shrink-0">
                {(vehicle?.brand || "F")[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className="font-mono text-slate-500 bg-slate-50 text-xs">
                    {offer.tender_id?.split("-")[0].toUpperCase()}
                  </Badge>
                  {offer.tenders?.status === "active" && (
                    <Badge className="bg-blue-100 text-blue-700 border-none">Aktiv</Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-navy-950">{vehicleLabel}</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {vehicle?.quantity && <>{vehicle.quantity}x · </>}
                  {vehicle?.list_price_gross && <>Listenpreis: {vehicle.list_price_gross.toLocaleString("de-DE")} € · </>}
                  Ihr Kaufpreis: <span className="font-bold text-navy-900">
                    {offer.purchase_price
                      ? `${offer.purchase_price.toLocaleString("de-DE")} €`
                      : offer.total_price
                      ? `${offer.total_price.toLocaleString("de-DE")} €`
                      : "—"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {offer.tenders?.end_at && (
                <div className="text-right hidden md:block">
                  <div className="text-xs font-semibold text-slate-400 mb-1">Endet in</div>
                  <div className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200/50 text-sm">
                    <Clock size={14} /> {timeLeft(offer.tenders.end_at)}
                  </div>
                </div>
              )}
              <Link href={`/dashboard/eingang`}>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-slate-600 hover:text-navy-900">
                  <ExternalLink size={14} className="mr-1.5" /> Ansehen
                </Button>
              </Link>
            </div>
          </div>

          {/* Price summary row */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kaufpreis</div>
              <div className="font-bold text-navy-950">
                {offer.purchase_price ? `${offer.purchase_price.toLocaleString("de-DE")} €` : "—"}
              </div>
            </div>
            {offer.lease_rate && (
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Leasing p.M.</div>
                <div className="font-bold text-navy-950">{offer.lease_rate.toLocaleString("de-DE")} €</div>
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gesamtpreis</div>
              <div className="font-bold text-navy-950">
                {offer.total_price ? `${offer.total_price.toLocaleString("de-DE")} €` : "—"}
              </div>
            </div>
            {vehicle?.list_price_gross && offer.purchase_price && (
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ersparnis</div>
                <div className="font-bold text-green-600">
                  -{((1 - offer.purchase_price / vehicle.list_price_gross) * 100).toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderContactCard = ({ contact, offer }: { contact: Contact; offer: any }) => {
    const vehicle = offer.tender_vehicles || null;
    const vehicleLabel = vehicle
      ? `${vehicle.brand || ""} ${vehicle.model_name || ""}`.trim() || "Fahrzeug"
      : "Ausschreibung";
    const buyer = buyerProfiles[contact.buyer_id];

    return (
      <Card key={contact.id} className="border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Buyer info */}
          <div className="flex items-start gap-5 mb-6">
            <div className="w-14 h-14 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
              <Building2 size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge className="bg-purple-100 text-purple-700 border-none">Kontaktwunsch</Badge>
                <Badge variant="outline" className="font-mono text-slate-500 bg-slate-50 text-xs">
                  {offer.tender_id?.split("-")[0].toUpperCase()}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-navy-950">
                {buyer?.company_name || "Unbekannt"}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 flex-wrap">
                {buyer?.first_name && <span>{buyer.first_name} {buyer.last_name}</span>}
                {buyer?.industry && <span>{buyer.industry}</span>}
                {(buyer?.zip || buyer?.city) && <span className="flex items-center gap-1"><MapPin size={12} /> {buyer?.street ? `${buyer.street}, ` : ""}{buyer?.zip || ""} {buyer?.city || ""}</span>}
                {buyer?.email_public && <a href={`mailto:${buyer.email_public}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-700"><Mail size={12} /> {buyer.email_public}</a>}
                {buyer?.phone && <a href={`tel:${buyer.phone}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-700"><Phone size={12} /> {buyer.phone}</a>}
              </div>
            </div>
            <div className="text-right text-xs text-slate-400 shrink-0">
              Kontakt seit<br />{formatDate(contact.created_at)}
            </div>
          </div>

          {/* Offer info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-navy-950">{vehicleLabel}</span>
                {vehicle?.quantity && <span className="text-sm text-slate-500 ml-2">· {vehicle.quantity}x</span>}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ihr Kaufpreis</span>
                  <div className="font-bold text-navy-950">
                    {offer.purchase_price ? `${offer.purchase_price.toLocaleString("de-DE")} €` : "—"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Gesamt</span>
                  <div className="font-bold text-navy-950">
                    {offer.total_price ? `${offer.total_price.toLocaleString("de-DE")} €` : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact status */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-semibold text-green-700">
            <CheckCircle2 size={16} />
            Der Nachfrager hat Kontakt zu Ihnen aufgenommen
          </div>

          {/* Chat button */}
          <div className="mt-5 flex justify-end">
            <Link href={`/dashboard/nachrichten?contact=${contact.id}`}>
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6">
                <MessageCircle size={16} className="mr-2" /> Chat öffnen
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-24">
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white py-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-4 md:px-8 relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-4">Meine Angebote</h1>
          <p className="text-lg text-blue-100/80 max-w-2xl leading-relaxed">
            Ihre abgegebenen Angebote und eingehende Kontaktwünsche.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-8 mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-slate-400">
            <Loader2 className="animate-spin mr-3" size={28} />
            <span className="text-lg font-semibold">Angebote werden geladen…</span>
          </div>
        ) : fetchError ? (
          <div className="py-16 flex flex-col items-center text-center">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg w-full">
              <h3 className="text-lg font-bold text-red-800 mb-2">Fehler beim Laden</h3>
              <p className="text-red-600 text-sm mb-4">{fetchError}</p>
              <Button variant="outline" className="rounded-xl border-red-200 text-red-700 hover:bg-red-100" onClick={() => window.location.reload()}>
                Erneut versuchen
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue={contactedOffers.length > 0 ? "contacts" : "active"} className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="w-full lg:w-72 shrink-0">
              <div className="sticky top-28">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Status</h3>
                <TabsList className="flex flex-col h-auto bg-transparent w-full p-0 space-y-3">
                  <TabsTrigger
                    value="contacts"
                    className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle size={20} className="text-purple-500" />
                      Kontaktwünsche
                    </div>
                    {contactedOffers.length > 0 ? (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-bold">{contactedOffers.length}</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">0</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="active"
                    className="w-full justify-between items-center px-6 py-4 rounded-2xl bg-transparent hover:bg-slate-100 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_30px_rgb(0,0,0,0.04)] data-[state=active]:border data-[state=active]:border-slate-200 text-slate-500 data-[state=active]:text-navy-950 transition-all font-semibold"
                  >
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-blue-500" />
                      Laufende Gebote
                    </div>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{activeOffers.length}</span>
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

            <div className="flex-1 min-w-0">
              <TabsContent value="contacts" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                {contactedOffers.length === 0 ? (
                  <EmptyTabState
                    icon={MessageCircle}
                    title="Keine Kontaktwünsche"
                    description="Wenn ein Nachfrager Sie kontaktieren möchte, erscheint sein Kontaktwunsch hier."
                  />
                ) : (
                  contactedOffers.map((item) => renderContactCard(item as any))
                )}
              </TabsContent>

              <TabsContent value="active" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                {activeOffers.length === 0 ? (
                  <EmptyTabState
                    icon={Activity}
                    title="Noch keine laufenden Angebote"
                    description="Sobald Sie ein Angebot auf eine Ausschreibung abgeben, erscheint es hier."
                  />
                ) : (
                  activeOffers.map(renderOfferCard)
                )}
              </TabsContent>

              <TabsContent value="archived" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                {archivedOffers.length === 0 ? (
                  <EmptyTabState
                    icon={Handshake}
                    title="Kein Archiv vorhanden"
                    description="Abgelaufene oder abgeschlossene Angebote erscheinen hier."
                  />
                ) : (
                  archivedOffers.map(renderOfferCard)
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
}

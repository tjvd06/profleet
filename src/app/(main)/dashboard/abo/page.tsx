"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useSubscription, type SubscriptionTier } from "@/components/providers/subscription-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Crown, Check, X, Sparkles, CreditCard, FileText, Loader2, ArrowRight,
  Zap, BarChart3, Mail, Shield, Users, Star, TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

const TIERS: {
  id: SubscriptionTier;
  name: string;
  price: number;
  priceLabel: string;
  recommended?: boolean;
  accent: string;
  borderClass: string;
  badgeClass: string;
  features: { label: string; included: boolean }[];
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    priceLabel: "Kostenlos",
    accent: "slate",
    borderClass: "border-slate-200",
    badgeClass: "",
    features: [
      { label: "Max. 3 Angebote pro Monat", included: true },
      { label: "Max. 1 Sofort-Angebot aktiv", included: true },
      { label: "Grundprofil sichtbar", included: true },
      { label: "Kontaktdaten-Austausch inklusive", included: true },
      { label: "Keine Kreditkarte noetig", included: true },
      { label: "E-Mail-Benachrichtigungen", included: false },
      { label: "Statistik-Dashboard", included: false },
      { label: "Bevorzugte Platzierung", included: false },
      { label: "Erweiterte Statistiken", included: false },
      { label: "Persoenlicher Support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    priceLabel: "99 \u20ac",
    recommended: true,
    accent: "blue",
    borderClass: "border-transparent",
    badgeClass: "bg-blue-500/10 text-blue-500",
    features: [
      { label: "Unbegrenzt Angebote", included: true },
      { label: "Max. 10 Sofort-Angebote aktiv", included: true },
      { label: "Grundprofil sichtbar", included: true },
      { label: "Kontaktdaten-Austausch inklusive", included: true },
      { label: "Keine Kreditkarte noetig", included: true },
      { label: "E-Mail-Benachrichtigungen", included: true },
      { label: "Statistik-Dashboard", included: true },
      { label: "Bevorzugte Platzierung", included: false },
      { label: "Erweiterte Statistiken", included: false },
      { label: "Persoenlicher Support", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 249,
    priceLabel: "249 \u20ac",
    accent: "amber",
    borderClass: "border-transparent",
    badgeClass: "bg-amber-500/10 text-amber-600",
    features: [
      { label: "Unbegrenzt Angebote", included: true },
      { label: "Unbegrenzt Sofort-Angebote", included: true },
      { label: "Grundprofil sichtbar", included: true },
      { label: "Kontaktdaten-Austausch inklusive", included: true },
      { label: "Keine Kreditkarte noetig", included: true },
      { label: "E-Mail-Benachrichtigungen", included: true },
      { label: "Statistik-Dashboard", included: true },
      { label: "Bevorzugte Platzierung", included: true },
      { label: "Erweiterte Statistiken (Marktvergleich, Trends)", included: true },
      { label: "Persoenlicher Support", included: true },
    ],
  },
];

export default function SubscriptionPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { tier, subscriptionSince, isLoading: subLoading, refresh } = useSubscription();
  const router = useRouter();
  const [switching, setSwitching] = useState<SubscriptionTier | null>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    if (!authLoading && profile && profile.role !== "anbieter") {
      router.replace("/dashboard");
    }
  }, [authLoading, profile]);

  const handleSwitch = async (newTier: SubscriptionTier) => {
    if (!user || newTier === tier) return;
    setSwitching(newTier);
    try {
      const isUpgrade =
        (tier === "starter" && (newTier === "pro" || newTier === "premium")) ||
        (tier === "pro" && newTier === "premium");

      const updates: Record<string, unknown> = { subscription_tier: newTier };
      if (isUpgrade) {
        updates.subscription_since = new Date().toISOString();
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      await refresh();
      const tierName = TIERS.find((t) => t.id === newTier)?.name ?? newTier;
      toast.success(`Abo erfolgreich auf "${tierName}" ${isUpgrade ? "geupgradet" : "geaendert"}.`);
    } catch (e: any) {
      console.error("[Abo] Switch error:", e);
      toast.error("Abo-Wechsel fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setSwitching(null);
    }
  };

  const isLoading = authLoading || subLoading;

  const sinceDate = subscriptionSince
    ? new Date(subscriptionSince).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-[calc(100vh-80px)] pb-32">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto max-w-6xl px-4 md:px-8 py-6 md:py-8">
          <p className="text-sm font-medium text-slate-500 mb-1">Dashboard</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-navy-950">Abo & Abrechnung</h1>
          <p className="text-sm text-slate-500 mt-1">
            Verwalten Sie Ihr Abonnement und schalten Sie erweiterte Funktionen frei.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 md:px-8 mt-6 md:mt-8 space-y-10">

        {/* Current Subscription Card */}
        <Card className="p-6 md:p-8 rounded-3xl border-2 border-emerald-200 bg-white shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Crown size={120} />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                tier === "premium" ? "bg-amber-100 text-amber-600" :
                tier === "pro" ? "bg-blue-100 text-blue-600" :
                "bg-slate-100 text-slate-500"
              }`}>
                {tier === "premium" ? <Crown size={24} /> : tier === "pro" ? <Zap size={24} /> : <Star size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-navy-950">
                    {TIERS.find((t) => t.id === tier)?.name ?? "Starter"}-Abo
                  </h2>
                  {tier === "pro" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500">Pro</span>
                  )}
                  {tier === "premium" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">Premium</span>
                  )}
                </div>
                {sinceDate && (
                  <p className="text-sm text-slate-500 mt-0.5">Aktiv seit {sinceDate}</p>
                )}
                {!sinceDate && tier === "starter" && (
                  <p className="text-sm text-slate-500 mt-0.5">Kostenloser Starter-Tarif</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tier Comparison Cards */}
        <section>
          <h2 className="text-2xl font-bold text-navy-950 mb-6">Abo-Vergleich</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((t) => {
              const isCurrent = t.id === tier;
              const isUpgrade =
                (tier === "starter" && (t.id === "pro" || t.id === "premium")) ||
                (tier === "pro" && t.id === "premium");
              const isDowngrade =
                (tier === "premium" && (t.id === "pro" || t.id === "starter")) ||
                (tier === "pro" && t.id === "starter");

              let borderStyle = t.borderClass;
              let bgStyle = "bg-white/70 backdrop-blur-xl";

              if (t.recommended && !isCurrent) {
                borderStyle = "border-2";
                bgStyle = "bg-white/70 backdrop-blur-xl";
              }

              if (isCurrent) {
                borderStyle = "border-2 border-emerald-300";
              }

              return (
                <Card
                  key={t.id}
                  className={`relative rounded-3xl shadow-sm overflow-hidden flex flex-col ${borderStyle} ${bgStyle}`}
                  style={
                    t.recommended && !isCurrent
                      ? { borderImage: "linear-gradient(135deg, #3B82F6, #22D3EE) 1" }
                      : t.id === "premium" && !isCurrent
                      ? { borderImage: "linear-gradient(135deg, #F59E0B, #D97706) 1" }
                      : undefined
                  }
                >
                  {/* Recommended badge */}
                  {t.recommended && (
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center py-1.5 text-xs font-bold uppercase tracking-widest">
                      Empfohlen
                    </div>
                  )}

                  {/* Current badge */}
                  {isCurrent && (
                    <div className="bg-emerald-500 text-white text-center py-1.5 text-xs font-bold uppercase tracking-widest">
                      Ihr aktuelles Abo
                    </div>
                  )}

                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    {/* Tier name */}
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-xl font-black text-navy-950">{t.name}</h3>
                      {t.id === "pro" && !isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500">Pro</span>
                      )}
                      {t.id === "premium" && !isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">Premium</span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-navy-950">{t.price === 0 ? "0 \u20ac" : `${t.price} \u20ac`}</span>
                        <span className="text-sm text-slate-500 font-medium">/ Monat netto</span>
                      </div>
                      {t.price > 0 && (
                        <p className="text-xs text-slate-400 mt-1">+ MwSt.</p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-8">
                      {t.features.map((f) => (
                        <li key={f.label} className="flex items-start gap-2.5 text-sm">
                          {f.included ? (
                            <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                          ) : (
                            <X size={16} className="text-slate-300 mt-0.5 shrink-0" />
                          )}
                          <span className={f.included ? "text-navy-950 font-medium" : "text-slate-400"}>
                            {f.label}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Action */}
                    {isCurrent ? (
                      <Button disabled className="w-full h-12 rounded-xl font-bold bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default">
                        Aktiver Tarif
                      </Button>
                    ) : isUpgrade ? (
                      <Button
                        onClick={() => handleSwitch(t.id)}
                        disabled={switching !== null}
                        className="w-full h-12 rounded-xl font-bold text-white shadow-lg hover:scale-[1.02] transition-transform"
                        style={{ background: t.id === "premium" ? "linear-gradient(135deg, #F59E0B, #D97706)" : "linear-gradient(135deg, #3B82F6, #22D3EE)" }}
                      >
                        {switching === t.id ? (
                          <Loader2 size={18} className="animate-spin mr-2" />
                        ) : (
                          <ArrowRight size={18} className="mr-2" />
                        )}
                        Auf {t.name} upgraden
                      </Button>
                    ) : isDowngrade ? (
                      <Button
                        variant="outline"
                        onClick={() => handleSwitch(t.id)}
                        disabled={switching !== null}
                        className="w-full h-12 rounded-xl font-bold border-slate-200 text-slate-500 hover:text-navy-950 hover:border-slate-300"
                      >
                        {switching === t.id && <Loader2 size={18} className="animate-spin mr-2" />}
                        Downgrade auf {t.name}
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Invoice History Placeholder */}
        <section>
          <h2 className="text-2xl font-bold text-navy-950 mb-6">Rechnungshistorie</h2>
          <Card className="p-8 rounded-3xl border-slate-200 shadow-sm bg-white">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
                <FileText size={32} />
              </div>
              <h4 className="text-lg font-bold text-navy-950 mb-2">Noch keine Rechnungen</h4>
              <p className="text-sm text-slate-500 max-w-sm">
                Rechnungen werden verfuegbar sobald die Zahlungsanbindung aktiv ist.
              </p>
            </div>
          </Card>
        </section>

        {/* Payment Method Placeholder */}
        <section>
          <h2 className="text-2xl font-bold text-navy-950 mb-6">Zahlungsmethode</h2>
          <Card className="p-8 rounded-3xl border-slate-200 shadow-sm bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shrink-0">
                <CreditCard size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-navy-950">Noch keine Zahlungsmethode hinterlegt</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  (Stripe-Integration folgt)
                </p>
              </div>
              <Button disabled variant="outline" className="rounded-xl font-bold border-slate-200 text-slate-400">
                Hinzufuegen
              </Button>
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
}

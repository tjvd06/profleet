"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, User, Building2, X, PartyPopper } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";

const DEALER_TYPES = [
  { value: "vertragshaendler", label: "Vertragshändler" },
  { value: "leasingfirma", label: "Leasingfirma" },
  { value: "bank", label: "Bank" },
  { value: "freier_haendler", label: "Freier Händler" },
];

const INDUSTRY_OPTIONS = [
  "Automobil",
  "Bauwesen",
  "Dienstleistungen",
  "Energie",
  "Finanzen & Versicherung",
  "Gesundheit",
  "Handel",
  "Handwerk",
  "IT & Telekommunikation",
  "Logistik & Transport",
  "Öffentlicher Dienst",
  "Produktion & Fertigung",
  "Sonstiges",
];

type ProfileForm = {
  first_name: string;
  last_name: string;
  phone: string;
  company_name: string;
  industry: string | null;
  street: string;
  zip: string;
  city: string;
  vat_id: string;
  dealer_type: string | null;
  brands: string[];
};

export default function ProfilePage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get("welcome") === "1";
  const [supabase] = useState(() => createClient());

  const [form, setForm] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    phone: "",
    company_name: "",
    industry: "",
    street: "",
    zip: "",
    city: "",
    vat_id: "",
    dealer_type: "",
    brands: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brandInput, setBrandInput] = useState("");

  // Available brands from vehicle_models
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  // Load profile data + available brands
  useEffect(() => {
    if (authLoading || !user) return;

    (async () => {
      const [profileResult, brandsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("vehicle_models").select("brand"),
      ]);

      if (profileResult.data) {
        const p = profileResult.data;
        setForm({
          first_name: p.first_name || "",
          last_name: p.last_name || "",
          phone: p.phone || "",
          company_name: p.company_name || "",
          industry: p.industry || "",
          street: p.street || "",
          zip: p.zip || "",
          city: p.city || "",
          vat_id: p.vat_id || "",
          dealer_type: p.dealer_type || "",
          brands: p.brands || [],
        });
      }

      if (brandsResult.data) {
        const unique = Array.from(new Set(brandsResult.data.map((r: any) => r.brand))).sort() as string[];
        setAvailableBrands(unique);
      }

      setLoading(false);
    })();
  }, [authLoading, user?.id]);

  const update = (patch: Partial<ProfileForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const isAnbieter = profile?.role === "anbieter";

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const payload: Record<string, unknown> = {
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      phone: form.phone || null,
      company_name: form.company_name || null,
      industry: form.industry || null,
      street: form.street || null,
      zip: form.zip || null,
      city: form.city || null,
      vat_id: form.vat_id || null,
      profile_completed: true,
    };

    if (isAnbieter) {
      payload.dealer_type = form.dealer_type || null;
      payload.brands = form.brands.length > 0 ? form.brands : null;
    }

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Fehler beim Speichern: " + error.message);
    } else {
      toast.success("Profil erfolgreich gespeichert!");
    }
  };

  const addBrand = (brand: string) => {
    if (brand && !form.brands.includes(brand)) {
      update({ brands: [...form.brands, brand] });
    }
    setBrandInput("");
  };

  const removeBrand = (brand: string) => {
    update({ brands: form.brands.filter((b) => b !== brand) });
  };

  const filteredBrands = availableBrands.filter(
    (b) => !form.brands.includes(b) && b.toLowerCase().includes(brandInput.toLowerCase())
  );

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="animate-spin mr-3" size={28} />
        <span className="text-lg font-semibold">Profil wird geladen…</span>
      </div>
    );
  }

  const inputClass = "h-12 bg-slate-50 border-slate-200 rounded-xl px-4 focus:bg-white transition-colors";

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white py-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto max-w-3xl px-4 md:px-8 relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-4">Mein Profil</h1>
          <p className="text-lg text-blue-100/80 leading-relaxed">
            Verwalten Sie Ihre persönlichen Daten und Unternehmensangaben.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 md:px-8 mt-8 space-y-8">
        {/* Welcome banner after registration */}
        {isWelcome && (
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
              <PartyPopper size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-950 mb-1">Willkommen bei proFleet!</h3>
              <p className="text-sm text-slate-600">
                Ihr Konto wurde erfolgreich erstellt. Bitte vervollständigen Sie Ihr Profil, damit Sie die Plattform vollständig nutzen können.
              </p>
            </div>
          </div>
        )}
        {/* Section 1: Persönliche Daten */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-950">Persönliche Daten</h2>
              <p className="text-sm text-slate-500">Ihre Kontaktinformationen</p>
            </div>
          </div>
          <div className="p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Vorname</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => update({ first_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nachname</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) => update({ last_name: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="h-12 bg-slate-100 border-slate-200 rounded-xl px-4 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Die E-Mail-Adresse kann nicht geändert werden.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefonnummer</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+49 123 4567890"
                value={form.phone}
                onChange={(e) => update({ phone: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Unternehmensdaten */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-950">Unternehmensdaten</h2>
              <p className="text-sm text-slate-500">Angaben zu Ihrem Unternehmen</p>
            </div>
          </div>
          <div className="p-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="company_name">Firmenname</Label>
              <Input
                id="company_name"
                value={form.company_name}
                onChange={(e) => update({ company_name: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Branche</Label>
              <Select value={form.industry} onValueChange={(v) => update({ industry: v })}>
                <SelectTrigger id="industry" className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4">
                  <SelectValue placeholder="Branche auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Straße + Hausnummer</Label>
              <Input
                id="street"
                placeholder="Musterstraße 123"
                value={form.street}
                onChange={(e) => update({ street: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zip">PLZ</Label>
                <Input
                  id="zip"
                  placeholder="12345"
                  value={form.zip}
                  onChange={(e) => update({ zip: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="city">Stadt</Label>
                <Input
                  id="city"
                  placeholder="Berlin"
                  value={form.city}
                  onChange={(e) => update({ city: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat_id">USt-ID</Label>
              <Input
                id="vat_id"
                placeholder="DE123456789"
                value={form.vat_id}
                onChange={(e) => update({ vat_id: e.target.value })}
                className={inputClass}
              />
              <p className="text-xs text-slate-400">Optional — wird für die Rechnungsstellung benötigt.</p>
            </div>

            {/* Dealer-specific fields */}
            {isAnbieter && (
              <>
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Händler-Angaben</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dealer_type">Händlertyp</Label>
                  <Select value={form.dealer_type} onValueChange={(v) => update({ dealer_type: v })}>
                    <SelectTrigger id="dealer_type" className="h-12 bg-slate-50 border-slate-200 rounded-xl px-4">
                      <SelectValue placeholder="Händlertyp auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEALER_TYPES.map((dt) => (
                        <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Vertretene Marken</Label>
                  {form.brands.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.brands.map((brand) => (
                        <Badge
                          key={brand}
                          className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5"
                        >
                          {brand}
                          <button
                            type="button"
                            onClick={() => removeBrand(brand)}
                            className="text-blue-400 hover:text-blue-700 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <Input
                      placeholder="Marke eingeben oder auswählen…"
                      value={brandInput}
                      onChange={(e) => setBrandInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (filteredBrands.length > 0) addBrand(filteredBrands[0]);
                        }
                      }}
                      className={inputClass}
                    />
                    {brandInput && filteredBrands.length > 0 && (
                      <div className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredBrands.slice(0, 10).map((brand) => (
                          <button
                            key={brand}
                            type="button"
                            onClick={() => addBrand(brand)}
                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            {brand}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-10 shadow-lg shadow-blue-600/20 text-base"
          >
            {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
            Profil speichern
          </Button>
        </div>
      </div>
    </div>
  );
}

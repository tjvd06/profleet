"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";

type Contact = {
  id: string;
  status: string;
  dealer_responded: boolean;
  contract_concluded: boolean | null;
  buyer_id: string;
  dealer_id: string;
};

type StatusTrackerProps = {
  contact: Contact;
  currentUserId: string;
  onUpdate: (updated: Partial<Contact>) => void;
};

const STEPS = [
  { key: "initiated", label: "Kontakt aufgenommen" },
  { key: "responded", label: "Händler hat geantwortet" },
  { key: "contract", label: "Vertrag abgeschlossen" },
] as const;

export function StatusTracker({ contact, currentUserId, onUpdate }: StatusTrackerProps) {
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(false);
  const isDealer = currentUserId === contact.dealer_id;
  const isBuyer = currentUserId === contact.buyer_id;

  const stepIndex = contact.contract_concluded != null
    ? 2
    : contact.dealer_responded
    ? 1
    : 0;

  const handleDealerResponded = async () => {
    if (!isDealer || loading) return;
    setLoading(true);
    const { error } = await supabase
      .from("contacts")
      .update({ dealer_responded: true, status: "responded" })
      .eq("id", contact.id);
    setLoading(false);
    if (error) {
      toast.error("Fehler: " + error.message);
    } else {
      toast.success("Kontakt als aufgenommen bestätigt.");
      onUpdate({ dealer_responded: true, status: "responded" });
    }
  };

  const handleContractDecision = async (concluded: boolean) => {
    if (loading) return;
    setLoading(true);
    const status = concluded ? "contract_yes" : "contract_no";
    const { error } = await supabase
      .from("contacts")
      .update({ contract_concluded: concluded, status })
      .eq("id", contact.id);
    setLoading(false);
    if (error) {
      toast.error("Fehler: " + error.message);
    } else {
      toast.success(concluded ? "Vertrag als abgeschlossen markiert." : "Kein Vertrag vermerkt.");
      onUpdate({ contract_concluded: concluded, status });
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Status-Tracker</h4>

      <div className="space-y-4">
        {STEPS.map((step, i) => {
          const done = i < stepIndex || (i === stepIndex && (i < 2 || contact.contract_concluded != null));
          const current = i === stepIndex && !done;

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div className="mt-0.5">
                {done ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : current ? (
                  <Circle size={20} className="text-blue-500" />
                ) : (
                  <Circle size={20} className="text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${done ? "text-green-700" : current ? "text-navy-950" : "text-slate-400"}`}>
                  {step.label}
                  {step.key === "contract" && contact.contract_concluded === true && (
                    <span className="ml-2 text-green-600">— Ja</span>
                  )}
                  {step.key === "contract" && contact.contract_concluded === false && (
                    <span className="ml-2 text-red-500">— Nein</span>
                  )}
                </p>

                {/* Dealer: confirm responded (step 1) */}
                {current && step.key === "responded" && isDealer && (
                  <Button
                    size="sm"
                    onClick={handleDealerResponded}
                    disabled={loading}
                    className="mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-4"
                  >
                    {loading ? <Loader2 className="animate-spin mr-1" size={12} /> : null}
                    Kontakt aufgenommen: Ja
                  </Button>
                )}

                {/* Both: contract decision (step 2) — only when dealer_responded */}
                {current && step.key === "contract" && contact.dealer_responded && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => handleContractDecision(true)}
                      disabled={loading}
                      className="rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold h-8 px-4"
                    >
                      {loading ? <Loader2 className="animate-spin mr-1" size={12} /> : null}
                      Vertrag: Ja
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleContractDecision(false)}
                      disabled={loading}
                      className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold h-8 px-4"
                    >
                      Vertrag: Nein
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  StopCircle, CheckCircle2, XCircle, ThumbsUp, Minus, ThumbsDown,
  Loader2, ChevronRight, X,
} from "lucide-react";

type DealerInfo = {
  contactId: string;
  dealerId: string;
  companyName: string;
  city?: string | null;
};

type Props = {
  tenderIdShort: string;
  dealers: DealerInfo[];
  onConfirmEnd: () => Promise<void>;
  onContractAnswer: (contactId: string, concluded: boolean) => Promise<void>;
  onSubmitReview: (contactId: string, type: "positive" | "neutral" | "negative", comment: string) => Promise<void>;
  onClose: () => void;
};

type ReviewChoice = "positive" | "neutral" | "negative";

export function EndTenderWizard({
  tenderIdShort,
  dealers,
  onConfirmEnd,
  onContractAnswer,
  onSubmitReview,
  onClose,
}: Props) {
  // Step 0 = confirm end, then per-dealer: step 1..N = contract + review
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Per-dealer state
  const [contractAnswers, setContractAnswers] = useState<Record<string, boolean | null>>({});
  const [reviewTypes, setReviewTypes] = useState<Record<string, ReviewChoice | null>>({});
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [submittedReviews, setSubmittedReviews] = useState<Set<string>>(new Set());

  const currentDealerIndex = step - 1;
  const currentDealer = dealers[currentDealerIndex] ?? null;
  const totalSteps = dealers.length + 1; // 1 confirm + N dealers

  const handleConfirmEnd = async () => {
    setLoading(true);
    await onConfirmEnd();
    setLoading(false);
    if (dealers.length > 0) {
      setStep(1);
    } else {
      setDone(true);
    }
  };

  const handleContractChoice = async (concluded: boolean) => {
    if (!currentDealer) return;
    setLoading(true);
    await onContractAnswer(currentDealer.contactId, concluded);
    setContractAnswers((prev) => ({ ...prev, [currentDealer.contactId]: concluded }));
    setLoading(false);
  };

  const handleSubmitAndNext = async () => {
    if (!currentDealer) return;
    const type = reviewTypes[currentDealer.contactId];
    if (!type) return;
    setLoading(true);
    await onSubmitReview(currentDealer.contactId, type, reviewComments[currentDealer.contactId] || "");
    setSubmittedReviews((prev) => new Set(prev).add(currentDealer.contactId));
    setLoading(false);

    if (currentDealerIndex < dealers.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const handleSkipReview = () => {
    if (currentDealerIndex < dealers.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const contractAnswer = currentDealer ? contractAnswers[currentDealer.contactId] : null;
  const contractDone = contractAnswer !== null && contractAnswer !== undefined;
  const reviewType = currentDealer ? reviewTypes[currentDealer.contactId] : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        {!done && step > 0 && dealers.length > 0 && (
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        )}

        <div className="p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>

          {/* ─── STEP 0: Confirm End ─── */}
          {step === 0 && !done && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <StopCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-black text-navy-950 mb-2">Ausschreibung beenden?</h2>
              <p className="text-slate-500 mb-2">
                <Badge variant="outline" className="font-mono text-xs">{tenderIdShort}</Badge>
              </p>
              <p className="text-slate-500 text-sm mb-8">
                Die Ausschreibung wird sofort geschlossen. Anschließend können Sie Ihre Kontakte bewerten.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl h-12">
                  Abbrechen
                </Button>
                <Button
                  onClick={handleConfirmEnd}
                  disabled={loading}
                  className="flex-1 rounded-xl h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Ja, jetzt beenden"}
                </Button>
              </div>
            </div>
          )}

          {/* ─── STEP 1..N: Per-Dealer Contract + Review ─── */}
          {step > 0 && !done && currentDealer && (
            <div>
              {/* Dealer header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                  {currentDealer.companyName[0] || "H"}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-400 font-semibold">
                    Kontakt {currentDealerIndex + 1} von {dealers.length}
                  </div>
                  <h3 className="text-lg font-bold text-navy-950">{currentDealer.companyName}</h3>
                  {currentDealer.city && (
                    <p className="text-xs text-slate-500">
                      {currentDealer.city}
                    </p>
                  )}
                </div>
              </div>

              {/* Contract question */}
              {!contractDone && (
                <div>
                  <h4 className="font-bold text-navy-950 mb-4">Ist ein Vertrag zustande gekommen?</h4>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleContractChoice(true)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-green-200 bg-green-50 text-green-700 font-bold hover:bg-green-100 hover:border-green-300 transition-all disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                      Ja
                    </button>
                    <button
                      onClick={() => handleContractChoice(false)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:border-slate-300 transition-all disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                      Nein
                    </button>
                  </div>
                </div>
              )}

              {/* Review form (shown after contract answer) */}
              {contractDone && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={contractAnswer ? "bg-green-100 text-green-700 border-none" : "bg-slate-100 text-slate-600 border-none"}>
                      {contractAnswer ? <><CheckCircle2 size={12} className="mr-1" /> Vertrag</> : <><XCircle size={12} className="mr-1" /> Kein Vertrag</>}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-navy-950 mb-4">Wie bewerten Sie {currentDealer.companyName}?</h4>

                  <div className="flex gap-2 mb-4">
                    {(["positive", "neutral", "negative"] as const).map((t) => {
                      const config = {
                        positive: { icon: ThumbsUp, label: "Positiv", active: "border-green-400 bg-green-100 text-green-700 ring-2 ring-green-200", idle: "border-green-200 bg-green-50 text-green-600 hover:bg-green-100" },
                        neutral: { icon: Minus, label: "Neutral", active: "border-amber-400 bg-amber-100 text-amber-700 ring-2 ring-amber-200", idle: "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100" },
                        negative: { icon: ThumbsDown, label: "Negativ", active: "border-red-400 bg-red-100 text-red-700 ring-2 ring-red-200", idle: "border-red-200 bg-red-50 text-red-600 hover:bg-red-100" },
                      }[t];
                      const Icon = config.icon;
                      return (
                        <button
                          key={t}
                          onClick={() => setReviewTypes((prev) => ({ ...prev, [currentDealer.contactId]: t }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl border-2 text-sm font-bold transition-all ${reviewType === t ? config.active : config.idle}`}
                        >
                          <Icon size={16} /> {config.label}
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    value={reviewComments[currentDealer.contactId] || ""}
                    onChange={(e) => setReviewComments((prev) => ({ ...prev, [currentDealer.contactId]: e.target.value }))}
                    placeholder="Optionaler Kommentar..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 resize-none mb-4"
                  />

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSkipReview} className="rounded-xl h-11 text-slate-500">
                      Überspringen
                    </Button>
                    <Button
                      onClick={handleSubmitAndNext}
                      disabled={!reviewType || loading}
                      className="flex-1 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin mr-2" />
                      ) : (
                        <ChevronRight size={16} className="mr-1" />
                      )}
                      {currentDealerIndex < dealers.length - 1 ? "Bewerten & weiter" : "Bewerten & fertig"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── DONE ─── */}
          {done && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-black text-navy-950 mb-2">Fertig!</h2>
              <p className="text-slate-500 text-sm mb-6">
                Die Ausschreibung wurde beendet{submittedReviews.size > 0 ? ` und ${submittedReviews.size} Bewertung${submittedReviews.size > 1 ? "en" : ""} abgegeben` : ""}.
              </p>
              <Button onClick={onClose} className="rounded-xl h-12 px-8 bg-navy-900 hover:bg-navy-950 text-white font-bold">
                Schließen
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

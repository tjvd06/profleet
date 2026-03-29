"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, XCircle, ThumbsUp, Minus, ThumbsDown, Loader2, Lock, Pencil,
} from "lucide-react";

type Review = {
  id: string;
  type: "positive" | "neutral" | "negative";
  contract_concluded: boolean;
  comment: string | null;
};

type Props = {
  contactId: string;
  counterpartName: string;
  existingReview: Review | null;
  onSubmitReview: (contactId: string, type: "positive" | "neutral" | "negative", contractConcluded: boolean, comment: string) => Promise<void>;
  onUpdateReview?: (reviewId: string, type: "positive" | "neutral" | "negative", contractConcluded: boolean, comment: string) => Promise<void>;
  disabled?: boolean;
};

export function ReviewStepper({
  contactId,
  counterpartName,
  existingReview,
  onSubmitReview,
  onUpdateReview,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [contractConcluded, setContractConcluded] = useState<boolean | null>(
    existingReview?.contract_concluded ?? null,
  );
  const [reviewType, setReviewType] = useState<"positive" | "neutral" | "negative" | null>(
    existingReview?.type ?? null,
  );
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitted, setSubmitted] = useState(!!existingReview);
  const [editing, setEditing] = useState(false);

  const step1Done = contractConcluded !== null;
  const step2Done = submitted && !editing;

  const handleSubmitReview = async () => {
    if (!reviewType || contractConcluded === null) return;
    setLoading(true);
    if (editing && existingReview && onUpdateReview) {
      await onUpdateReview(existingReview.id, reviewType, contractConcluded, comment);
    } else {
      await onSubmitReview(contactId, reviewType, contractConcluded, comment);
    }
    setSubmitted(true);
    setEditing(false);
    setLoading(false);
  };

  const startEditing = () => {
    setEditing(true);
  };

  const cancelEditing = () => {
    setContractConcluded(existingReview?.contract_concluded ?? null);
    setReviewType(existingReview?.type ?? null);
    setComment(existingReview?.comment ?? "");
    setEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Step 1: Contract concluded? */}
      <div className={`rounded-2xl border p-5 transition-all ${step1Done && !editing ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/30"}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step1Done && !editing ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
            {step1Done && !editing ? <CheckCircle2 size={16} /> : "1"}
          </div>
          <h4 className="font-bold text-navy-950 text-sm">Ist ein Vertrag zustande gekommen?</h4>
        </div>

        {(!step1Done || editing) ? (
          <div className="flex gap-3 ml-11">
            <button
              onClick={() => setContractConcluded(true)}
              disabled={loading || disabled}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all disabled:opacity-50 ${contractConcluded === true ? "border-green-400 bg-green-100 text-green-700 ring-2 ring-green-200" : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300"}`}
            >
              <CheckCircle2 size={16} />
              Ja, Vertrag abgeschlossen
            </button>
            <button
              onClick={() => setContractConcluded(false)}
              disabled={loading || disabled}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all disabled:opacity-50 ${contractConcluded === false ? "border-slate-400 bg-slate-100 text-slate-700 ring-2 ring-slate-200" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300"}`}
            >
              <XCircle size={16} />
              Nein
            </button>
          </div>
        ) : (
          <div className="ml-11">
            <Badge className={contractConcluded ? "bg-green-100 text-green-700 border-none" : "bg-slate-100 text-slate-600 border-none"}>
              {contractConcluded ? <><CheckCircle2 size={12} className="mr-1" /> Vertrag abgeschlossen</> : <><XCircle size={12} className="mr-1" /> Kein Vertrag</>}
            </Badge>
          </div>
        )}
      </div>

      {/* Step 2: Rating */}
      <div className={`rounded-2xl border p-5 transition-all ${!step1Done ? "border-slate-200 bg-slate-50/50 opacity-60" : step2Done ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50/30"}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step2Done ? "bg-green-100 text-green-700" : step1Done ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
            {step2Done ? <CheckCircle2 size={16} /> : !step1Done ? <Lock size={14} /> : "2"}
          </div>
          <h4 className="font-bold text-navy-950 text-sm">Bewertung abgeben</h4>
          <span className="text-xs text-slate-400 ml-auto">für {counterpartName}</span>
        </div>

        {!step1Done ? (
          <p className="text-xs text-slate-400 ml-11">Bitte beantworten Sie zuerst Schritt 1.</p>
        ) : step2Done ? (
          <div className="ml-11 flex items-center gap-2">
            <Badge className={
              reviewType === "positive" ? "bg-green-100 text-green-700 border-none" :
              reviewType === "neutral" ? "bg-amber-100 text-amber-700 border-none" :
              "bg-red-100 text-red-700 border-none"
            }>
              {reviewType === "positive" && <><ThumbsUp size={12} className="mr-1" /> Positiv</>}
              {reviewType === "neutral" && <><Minus size={12} className="mr-1" /> Neutral</>}
              {reviewType === "negative" && <><ThumbsDown size={12} className="mr-1" /> Negativ</>}
            </Badge>
            {comment && <span className="text-xs text-slate-500 truncate max-w-[200px]">&ldquo;{comment}&rdquo;</span>}
            {onUpdateReview && (
              <button
                onClick={startEditing}
                className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <Pencil size={12} /> Ändern
              </button>
            )}
          </div>
        ) : (
          <div className="ml-11 space-y-3">
            <div className="flex gap-2">
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
                    onClick={() => setReviewType(t)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${reviewType === t ? config.active : config.idle}`}
                  >
                    <Icon size={16} /> {config.label}
                  </button>
                );
              })}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optionaler Kommentar..."
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 resize-none"
            />

            <div className="flex items-center gap-2">
              {editing && (
                <Button variant="outline" onClick={cancelEditing} className="rounded-xl h-10 text-slate-500">
                  Abbrechen
                </Button>
              )}
              <Button
                onClick={handleSubmitReview}
                disabled={!reviewType || contractConcluded === null || loading || disabled}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6"
              >
                {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                {editing ? "Bewertung aktualisieren" : "Bewertung absenden"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

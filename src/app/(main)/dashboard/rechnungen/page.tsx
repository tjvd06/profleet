"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { FileText, ReceiptText } from "lucide-react";

export default function InvoicesPage() {
  const { profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && profile && profile.role !== "anbieter") {
      router.replace("/dashboard");
    }
  }, [isLoading, profile]);

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] pb-32">
      
      {/* Header Segment */}
      <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white py-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="container mx-auto max-w-5xl px-4 md:px-8 relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-4 flex items-center gap-3">
            <FileText size={32} className="text-blue-400" />
            Rechnungen & Kosten
          </h1>
          <p className="text-lg text-blue-100/80 font-medium max-w-2xl leading-relaxed">
            Volle Transparenz über Ihre angefallenen Plattform-Gebühren, Kontaktaufdeckungen und Inseratskosten.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 md:px-8 mt-8">
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden">
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
              <ReceiptText size={36} />
            </div>
            <h3 className="text-xl font-bold text-navy-950 mb-2">Noch keine Rechnungen vorhanden</h3>
            <p className="text-slate-500 max-w-sm">Sobald kostenpflichtige Leistungen anfallen, erscheint Ihre erste Monatsabrechnung hier.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

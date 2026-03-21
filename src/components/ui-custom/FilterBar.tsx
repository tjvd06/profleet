import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

export function FilterBar() {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 sticky top-20 z-40">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <Input placeholder="Marke oder Modell suchen..." className="pl-10 rounded-xl bg-slate-50 border-slate-200" />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 bg-white">
          <SlidersHorizontal size={16} className="mr-2" /> Filter
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Auswählen...",
  searchPlaceholder = "Suchen...",
  className,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex items-center justify-between w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-left transition-colors hover:border-slate-300",
          disabled && "opacity-50 cursor-not-allowed",
          open && "border-blue-400 ring-2 ring-blue-100"
        )}
      >
        <span className={selected.length ? "text-navy-950" : "text-slate-400"}>
          {selected.length ? `${selected.length} ausgewählt` : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-slate-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-lg">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm outline-none min-w-0"
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={12} className="text-slate-400" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400">
                Keine Ergebnisse
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      selected.includes(option)
                        ? "bg-blue-600 border-blue-600"
                        : "border-slate-300"
                    )}
                  >
                    {selected.includes(option) && (
                      <Check size={10} className="text-white" />
                    )}
                  </div>
                  <span className="text-navy-950">{option}</span>
                </button>
              ))
            )}
          </div>
          {selected.length > 0 && (
            <div className="p-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-slate-400 hover:text-red-500 font-medium"
              >
                Auswahl zurücksetzen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

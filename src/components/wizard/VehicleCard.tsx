"use client";

import { Pencil, Trash2, Car } from "lucide-react";
import type { VehicleConfig } from "@/types/vehicle";

interface VehicleCardProps {
  vehicle: VehicleConfig;
  index: number;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function VehicleCard({ vehicle, index, isActive, onEdit, onDelete, canDelete }: VehicleCardProps) {
  const label = [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || "Fahrzeug";
  const priceLabel = vehicle.listPriceGross
    ? `${Math.round(vehicle.listPriceGross).toLocaleString("de-DE")} € brutto`
    : null;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
        isActive
          ? "border-blue-500 bg-blue-50/50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
        <Car size={18} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-navy-950 truncate">{label}</span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg">
            {vehicle.quantity}x
          </span>
          {vehicle.method === "upload" && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">Upload</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
          {priceLabel && <span>{priceLabel}</span>}
          {vehicle.exteriorColor && (
            <span>· {vehicle.exteriorColor}{vehicle.metallic ? " (M)" : ""}</span>
          )}
          {vehicle.fuelType && <span>· {vehicle.fuelType}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Bearbeiten"
        >
          <Pencil size={14} />
        </button>
        {canDelete && (
          <button
            onClick={onDelete}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Entfernen"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

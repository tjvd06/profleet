"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "./VehicleCard";
import type { VehicleConfig } from "@/types/vehicle";

interface VehicleSummaryListProps {
  vehicles: VehicleConfig[];
  editingIndex: number | null;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAddNew: () => void;
}

export function VehicleSummaryList({
  vehicles,
  editingIndex,
  onEdit,
  onDelete,
  onAddNew,
}: VehicleSummaryListProps) {
  if (vehicles.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-navy-950">
          Konfigurierte Fahrzeuge ({vehicles.length})
        </h3>
        <Button
          variant="outline"
          onClick={onAddNew}
          disabled={editingIndex !== null}
          className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 h-9 px-4 text-sm font-semibold"
        >
          <Plus size={14} className="mr-1.5" /> Weiteres Fahrzeug
        </Button>
      </div>
      <div className="space-y-2">
        {vehicles.map((v, i) => (
          <VehicleCard
            key={v.id}
            vehicle={v}
            index={i}
            isActive={editingIndex === i}
            onEdit={() => onEdit(i)}
            onDelete={() => onDelete(i)}
            canDelete={vehicles.length > 1}
          />
        ))}
      </div>
    </div>
  );
}

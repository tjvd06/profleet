"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

export function useVehicleModels(vehicleType: "PKW" | "NFZ") {
  const supabase = createClient();
  const [brands, setBrands] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingBrands(true);
    (async () => {
      const { data } = await supabase
        .from("vehicle_models")
        .select("brand")
        .eq("vehicle_type", vehicleType);
      if (!cancelled && data) {
        const unique = [...new Set(data.map((r: { brand: string }) => r.brand))].sort();
        setBrands(unique);
      }
      if (!cancelled) setLoadingBrands(false);
    })();
    return () => { cancelled = true; };
  }, [vehicleType, supabase]);

  return { brands, loadingBrands };
}

export function useVehicleModelsByBrand(vehicleType: "PKW" | "NFZ", brand: string | null) {
  const supabase = createClient();
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (!brand) { setModels([]); return; }
    let cancelled = false;
    setLoadingModels(true);
    (async () => {
      const { data } = await supabase
        .from("vehicle_models")
        .select("model")
        .eq("vehicle_type", vehicleType)
        .eq("brand", brand);
      if (!cancelled && data) {
        const unique = [...new Set(data.map((r: { model: string }) => r.model))].sort();
        setModels(unique);
      }
      if (!cancelled) setLoadingModels(false);
    })();
    return () => { cancelled = true; };
  }, [vehicleType, brand, supabase]);

  return { models, loadingModels };
}

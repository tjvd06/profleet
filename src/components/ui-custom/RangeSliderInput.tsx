"use client";

import { cn } from "@/lib/utils";

interface RangeSliderInputProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  step?: number;
  unit?: string;
  className?: string;
}

export function RangeSliderInput({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  step = 1,
  unit = "",
  className,
}: RangeSliderInputProps) {
  const rangeSpan = max - min || 1;
  const leftPct = ((Math.max(valueMin, min) - min) / rangeSpan) * 100;
  const rightPct = ((Math.min(valueMax, max) - min) / rangeSpan) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Number inputs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={valueMin}
            onChange={(e) => {
              const v = Number(e.target.value);
              onChange(Math.min(v, valueMax), valueMax);
            }}
            min={min}
            max={valueMax}
            step={step}
            className="w-24 h-9 px-2 text-sm border border-slate-200 rounded-lg text-center font-medium focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {unit && <span className="text-xs text-slate-400">{unit}</span>}
        </div>
        <div className="flex-1 text-center text-slate-300 text-sm">—</div>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={valueMax}
            onChange={(e) => {
              const v = Number(e.target.value);
              onChange(valueMin, Math.max(v, valueMin));
            }}
            min={valueMin}
            max={max}
            step={step}
            className="w-24 h-9 px-2 text-sm border border-slate-200 rounded-lg text-center font-medium focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {unit && <span className="text-xs text-slate-400">{unit}</span>}
        </div>
      </div>

      {/* Dual range slider */}
      <div className="relative h-1.5 bg-slate-200 rounded-full">
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= valueMax) onChange(v, valueMax);
          }}
          className="absolute inset-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= valueMin) onChange(valueMin, v);
          }}
          className="absolute inset-0 w-full h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
        />
      </div>
    </div>
  );
}

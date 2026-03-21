import { cn } from "@/lib/utils";
import { Handshake, FileText, Star, Check } from "lucide-react";

interface StatusTrackerProps {
  currentStep: number; // 0: Kontakt, 1: Vertrag, 2: Bewertung
}

export function StatusTracker({ currentStep }: StatusTrackerProps) {
  const steps = [
    { label: "Kontakt aufgenommen", icon: Handshake },
    { label: "Kaufvertrag hochgeladen", icon: FileText },
    { label: "Händler bewertet", icon: Star },
  ];

  return (
    <div className="relative w-full py-4">
      {/* Background Line */}
      <div className="absolute top-7 left-[10%] w-[80%] h-1 bg-slate-100 z-0 rounded-full" />
      {/* Progress Line */}
      <div 
        className="absolute top-7 left-[10%] h-1 bg-gradient-to-r from-blue-400 to-blue-600 z-0 transition-all duration-500 rounded-full"
        style={{ width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 80}%` }}
      />
      
      <div className="flex justify-between relative z-10 w-full px-2 sm:px-6">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          const isCurrent = idx === currentStep;
          const Icon = step.icon;
          
          return (
            <div key={idx} className="flex flex-col items-center gap-3 w-1/3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-sm",
                isCompleted 
                  ? "bg-blue-500 border-blue-100 text-white shadow-blue-500/30 ring-4 ring-white" 
                  : "bg-white border-slate-200 text-slate-300",
                isCurrent && "scale-110"
              )}>
                {isCompleted && idx < currentStep ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
              </div>
              <span className={cn(
                "text-[11px] sm:text-xs font-bold text-center leading-tight transition-colors duration-300",
                isCurrent ? "text-blue-600" : isCompleted ? "text-navy-900" : "text-slate-400"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

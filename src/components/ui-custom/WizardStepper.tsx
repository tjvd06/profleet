import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WizardStepperProps {
  steps: string[];
  currentStep: number;
}

export function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className="w-full px-4 sm:px-12 py-6">
      <div className="flex justify-between relative">
        <div className="absolute top-5 left-0 w-full h-1.5 bg-slate-100 z-0 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <div key={index} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-500",
                  isCompleted ? "bg-gradient-to-tr from-blue-500 to-cyan-400 text-white border-transparent scale-105" :
                  isCurrent ? "bg-white border-blue-500 text-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-110" :
                  "bg-white border-slate-200 text-slate-400"
                )}
              >
                {isCompleted ? <Check size={18} className="text-white font-bold" /> : index + 1}
              </div>
              <span className={cn(
                "hidden md:block text-xs font-bold whitespace-nowrap uppercase tracking-wider transition-colors duration-300",
                isCurrent ? "text-blue-600" :
                isCompleted ? "text-navy-950" : "text-slate-400"
              )}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

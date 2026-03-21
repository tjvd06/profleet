import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export function RatingBadge({ score, label }: { score: number, label?: string }) {
  const getColors = () => {
    if (score >= 90) return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
    if (score >= 70) return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200";
    return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
  };

  return (
    <Badge variant="outline" className={`font-medium ${getColors()} flex items-center gap-1`}>
      <Star size={12} className="fill-current" />
      {score}% {label && <span className="text-xs opacity-80 font-normal">{label}</span>}
    </Badge>
  );
}

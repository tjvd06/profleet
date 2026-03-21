import { Badge } from "@/components/ui/badge";

export function SavingsBadge({ savings }: { savings: number }) {
  if (!savings) return null;
  return (
    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 font-semibold px-2.5 py-0.5 whitespace-nowrap">
      – {savings.toFixed(1).replace('.', ',')}%
    </Badge>
  );
}

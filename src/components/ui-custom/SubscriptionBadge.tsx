"use client";

import type { SubscriptionTier } from "@/components/providers/subscription-provider";

export function SubscriptionBadge({ tier }: { tier?: SubscriptionTier | string | null }) {
  if (!tier || tier === "starter") return null;

  if (tier === "pro") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 leading-none">
        Pro
      </span>
    );
  }

  if (tier === "premium") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 leading-none">
        Premium
      </span>
    );
  }

  return null;
}

"use client";

import { Suspense } from "react";
import { InstantOfferMarketplace } from "@/components/tenders/InstantOfferMarketplace";

export default function DashboardSofortAngebotePage() {
  return (
    <Suspense>
      <InstantOfferMarketplace />
    </Suspense>
  );
}

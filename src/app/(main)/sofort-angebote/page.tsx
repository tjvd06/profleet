import { Suspense } from "react";
import { InstantOfferMarketplace } from "@/components/tenders/InstantOfferMarketplace";

export default function SofortAngebotePage() {
  return (
    <Suspense>
      <InstantOfferMarketplace />
    </Suspense>
  );
}

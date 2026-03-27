"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RechnungenRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/abo");
  }, [router]);

  return null;
}

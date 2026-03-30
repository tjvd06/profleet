import { useState, useEffect } from "react";

/**
 * Looks up the city name for a German PLZ using openplzapi.org.
 * Returns the city once a valid 5-digit PLZ is entered.
 */
export function usePlzLookup(plz: string) {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = plz.trim();

    if (!/^\d{5}$/.test(trimmed)) {
      setCity("");
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://openplzapi.org/de/Localities?postalCode=${trimmed}`
        );
        if (!res.ok) throw new Error("PLZ lookup failed");
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setCity(data[0].name);
        } else if (!cancelled) {
          setCity("");
        }
      } catch {
        if (!cancelled) setCity("");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [plz]);

  return { city, loading };
}

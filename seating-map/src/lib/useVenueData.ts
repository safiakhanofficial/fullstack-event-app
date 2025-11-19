import { useEffect, useState } from "react";
import type { Venue } from "./types";

export function useVenueData() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/venue.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load venue.json (${res.status})`);
        return res.json();
      })
      .then((data: Venue) => {
        if (!cancelled) setVenue(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { venue, error, loading };
}

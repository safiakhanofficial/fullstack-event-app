import { useMemo, useState } from "react";
import { useVenueData } from "./lib/useVenueData";
import type { Seat, Venue } from "./lib/types";
import SeatingMap from "./components/SeatingMap";
import SeatDetails from "./components/SeatDetails";

function usePersistedSelection() {
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("selectedSeats");
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const setAndSave = (next: string[]) => {
    setSelected(next);
    localStorage.setItem("selectedSeats", JSON.stringify(next));
  };

  return { selected, setSelected: setAndSave };
}

export default function App() {
  const { venue, error, loading } = useVenueData();
  const { selected, setSelected } = usePersistedSelection();
  const [focusedSeat, setFocusedSeat] = useState<Seat | null>(null);

  const selectedSeatObjects = useMemo(() => {
    if (!venue) return [];
    const index = new Map<string, Seat>();
    for (const section of venue.sections) {
      for (const row of section.rows) {
        for (const seat of row.seats) {
          index.set(seat.id, seat);
        }
      }
    }
    return selected.map((id) => index.get(id)).filter(Boolean) as Seat[];
  }, [selected, venue]);

  const subtotal = useMemo(() => {
    // Example price: map priceTier to an amount (you can refine later)
    const tierPrice = (tier: number) => {
      if (tier === 1) return 1000; // PKR
      if (tier === 2) return 1500;
      return 2000;
    };
    return selectedSeatObjects.reduce((sum, s) => sum + tierPrice(s.priceTier), 0);
  }, [selectedSeatObjects]);

  if (loading) return <div className="app"><div className="panel">Loading venue…</div></div>;
  if (error) return <div className="app"><div className="panel">Failed to load: {error}</div></div>;
  if (!venue) return <div className="app"><div className="panel">No venue data.</div></div>;

  return (
    <div className="app">
      <div className="panel">
        <div className="toolbar">
          <h2 style={{ margin: 0 }}>{venue.name}</h2>
          <span style={{ marginLeft: "auto", color: "var(--muted)" }}>
            Selected: {selected.length} / 8
          </span>
        </div>

        <div className="legend">
          <span><span className="dot" style={{ background: "var(--available)" }} />Available</span>
          <span><span className="dot" style={{ background: "var(--reserved)" }} />Reserved</span>
          <span><span className="dot" style={{ background: "var(--sold)" }} />Sold</span>
          <span><span className="dot" style={{ background: "var(--held)" }} />Held</span>
          <span><span className="dot" style={{ background: "var(--accent)" }} />Selected</span>
        </div>

        <div className="svg-wrap">
          <SeatingMap
            venue={venue as Venue}
            selected={selected}
            onToggleSelect={(id) => {
              // Prevent selecting non-available seats
              const seat = findSeat(venue, id);
              if (!seat || seat.status !== "available") return;

              if (selected.includes(id)) {
                setSelected(selected.filter((s) => s !== id));
              } else {
                if (selected.length >= 8) return;
                setSelected([...selected, id]);
              }
            }}
            onFocusSeat={(seat) => setFocusedSeat(seat)}
          />
        </div>
      </div>

      <div className="panel">
        <SeatDetails
          seat={focusedSeat}
          selectedSeats={selectedSeatObjects}
          subtotal={subtotal}
          onClear={() => setSelected([])}
          onRemove={(id) => setSelected(selected.filter((s) => s !== id))}
        />
      </div>
    </div>
  );
}

function findSeat(venue: Venue, id: string): Seat | null {
  for (const section of venue.sections) {
    for (const row of section.rows) {
      for (const seat of row.seats) {
        if (seat.id === id) return seat;
      }
    }
  }
  return null;
}

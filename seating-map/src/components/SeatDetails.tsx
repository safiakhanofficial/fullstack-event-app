import type { Seat } from "../lib/types";

interface Props {
  seat: Seat | null;
  selectedSeats: Seat[];
  subtotal: number;
  onClear: () => void;
  onRemove: (id: string) => void;
}

export default function SeatDetails({ seat, selectedSeats, subtotal, onClear, onRemove }: Props) {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Seat details</h3>
      {seat ? (
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: "var(--muted)" }}>ID</div>
          <div>{seat.id}</div>
          <div style={{ color: "var(--muted)" }}>Coordinates</div>
          <div>{seat.x}, {seat.y}</div>
          <div style={{ color: "var(--muted)" }}>Price tier</div>
          <div>{seat.priceTier}</div>
          <div style={{ color: "var(--muted)" }}>Status</div>
          <div>{seat.status}</div>
        </div>
      ) : (
        <div style={{ color: "var(--muted)" }}>Focus or click a seat to see details.</div>
      )}

      <h3>Selection</h3>
      {selectedSeats.length === 0 ? (
        <div style={{ color: "var(--muted)" }}>No seats selected yet.</div>
      ) : (
        <div className="summary-list" role="list">
          {selectedSeats.map((s) => (
            <div key={s.id} role="listitem" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{s.id} (tier {s.priceTier})</span>
              <button className="btn" onClick={() => onRemove(s.id)} aria-label={`Remove ${s.id}`}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="subtotal">Subtotal: PKR {subtotal}</div>

      <div style={{ marginTop: 12 }}>
        <button className="btn" onClick={onClear} disabled={selectedSeats.length === 0}>
          Clear selection
        </button>
      </div>
    </div>
  );
}

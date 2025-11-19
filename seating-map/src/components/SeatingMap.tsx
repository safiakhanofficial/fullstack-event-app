import { useMemo } from "react";
import type { Seat, Venue } from "../lib/types";
import { SeatCircle } from "./SeatCircle";

interface Props {
  venue: Venue;
  selected: string[];
  onToggleSelect: (seatId: string) => void;
  onFocusSeat: (seat: Seat | null) => void;
}

export default function SeatingMap({ venue, selected, onToggleSelect, onFocusSeat }: Props) {
  // Flatten seats once for performance
  const seats = useMemo(() => {
    const list: { seat: Seat; sectionId: string; rowIndex: number }[] = [];
    for (const section of venue.sections) {
      for (const row of section.rows) {
        for (const seat of row.seats) {
          list.push({ seat, sectionId: section.id, rowIndex: row.index });
        }
      }
    }
    return list;
  }, [venue]);

  // Faster lookup for selected seats
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <svg
      width={venue.map.width}
      height={venue.map.height}
      role="img"
      aria-label={`${venue.name} seating map`}
    >
      {/* Background */}
      <rect x={0} y={0} width={venue.map.width} height={venue.map.height} fill="#0b1220" />

      {/* Render all seats */}
      {seats.map(({ seat, sectionId, rowIndex }) => (
        <SeatCircle
          key={seat.id}
          seat={seat}
          sectionId={sectionId}
          rowIndex={rowIndex}
          isSelected={selectedSet.has(seat.id)}
          onToggleSelect={onToggleSelect}
          onFocusSeat={onFocusSeat}
        />
      ))}
    </svg>
  );
}

import React from "react";
import type { Seat } from "../lib/types";

interface SeatCircleProps {
  seat: Seat;
  sectionId: string;
  rowIndex: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onFocusSeat: (seat: Seat | null) => void;
}

function SeatCircleComponent({
  seat,
  sectionId,
  rowIndex,
  isSelected,
  onToggleSelect,
  onFocusSeat,
}: SeatCircleProps) {
  const radius = 6;
  const fill = isSelected
    ? "var(--accent)"
    : seat.status === "available"
    ? "var(--available)"
    : seat.status === "reserved"
    ? "var(--reserved)"
    : seat.status === "sold"
    ? "var(--sold)"
    : "var(--held)";

  return (
    <circle
      cx={seat.x}
      cy={seat.y}
      r={radius}
      fill={fill}
      stroke="#1f2937"
      strokeWidth={1}
      tabIndex={0}
      aria-label={`Seat ${seat.id}, Section ${sectionId}, Row ${rowIndex}, Status ${seat.status}`}
      onClick={() => onToggleSelect(seat.id)}
      onFocus={() => onFocusSeat(seat)}
      onBlur={() => onFocusSeat(null)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleSelect(seat.id);
        }
      }}
      style={{
        outline: "none",
        cursor: seat.status === "available" ? "pointer" : "not-allowed",
      }}
    />
  );
}

export const SeatCircle = React.memo(SeatCircleComponent);

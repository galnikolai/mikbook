"use client";

import { useCallback, useRef } from "react";
import {
  COL_MIN,
  setSplit12,
  setSplit23,
  splitsToPercents,
  type ColumnSplits,
} from "@/lib/landing/column-splits";

type Props = {
  splits: ColumnSplits;
  onChange: (next: ColumnSplits) => void;
};

export function ColumnSplitsControl({ splits, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const splitsRef = useRef(splits);
  splitsRef.current = splits;
  const percents = splitsToPercents(splits);

  const posFromEvent = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return null;
    return ((clientX - rect.left) / rect.width) * 100;
  }, []);

  const startDrag = useCallback(
    (which: "12" | "23", e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget as HTMLElement;
      el.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const pct = posFromEvent(ev.clientX);
        if (pct === null) return;
        const cur = splitsRef.current;
        onChange(which === "12" ? setSplit12(cur, pct) : setSplit23(cur, pct));
      };
      const onUp = (ev: PointerEvent) => {
        try {
          el.releasePointerCapture(ev.pointerId);
        } catch {
          /* ignore */
        }
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
    },
    [onChange, posFromEvent],
  );

  return (
    <section className="space-y-2 border-b border-black/10 pb-3">
      <p>Column widths</p>
      <div
        ref={trackRef}
        className="relative h-9 w-full select-none overflow-hidden rounded-md border border-black/15 bg-[#f3efe8]"
        role="group"
        aria-label="Column splitters"
      >
        <div
          className="absolute inset-y-0 left-0 bg-black/[0.06]"
          style={{ width: `${percents.col1}%` }}
        />
        <div
          className="absolute inset-y-0 bg-black/[0.12]"
          style={{ left: `${splits.split12}%`, width: `${percents.col2}%` }}
        />
        <div
          className="absolute inset-y-0 right-0 bg-black/[0.06]"
          style={{ width: `${percents.col3}%` }}
        />

        <Handle
          left={splits.split12}
          label="Split columns 1 and 2"
          onPointerDown={(e) => startDrag("12", e)}
        />
        <Handle
          left={splits.split23}
          label="Split columns 2 and 3"
          onPointerDown={(e) => startDrag("23", e)}
        />
      </div>
      <div className="flex justify-between text-[10px] text-black/55 tabular-nums">
        <span>col1 {percents.col1}%</span>
        <span>col2 {percents.col2}%</span>
        <span>col3 {percents.col3}%</span>
      </div>
      <p className="text-[10px] text-black/40">
        Drag the handles · each column ≥ {COL_MIN}%
      </p>
    </section>
  );
}

function Handle({
  left,
  label,
  onPointerDown,
}: {
  left: number;
  label: string;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="absolute top-0 z-10 h-full w-3 -translate-x-1/2 cursor-ew-resize border-0 bg-transparent p-0"
      style={{ left: `${left}%` }}
      onPointerDown={onPointerDown}
    >
      <span className="absolute inset-y-1 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-black" />
      <span className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black bg-white shadow-sm" />
    </button>
  );
}

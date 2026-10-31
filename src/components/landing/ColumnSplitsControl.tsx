"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  COL_MIN,
  setColPercent,
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

      <div className="landing-percent-row">
        <PercentInput
          label="col1 %"
          value={percents.col1}
          onCommit={(n) => onChange(setColPercent(splits, 1, n))}
        />
        <PercentInput
          label="col2 %"
          value={percents.col2}
          onCommit={(n) => onChange(setColPercent(splits, 2, n))}
        />
        <PercentInput
          label="col3 %"
          value={percents.col3}
          onCommit={(n) => onChange(setColPercent(splits, 3, n))}
        />
      </div>
      <p className="text-[10px] text-black/40">
        Drag or type % · each column ≥ {COL_MIN}%
      </p>
    </section>
  );
}

function PercentInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (n: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commitFrom(raw: string) {
    const n = Number.parseFloat(raw.replace(",", "."));
    if (!Number.isFinite(n)) {
      setDraft(String(value));
      return;
    }
    onCommit(n);
  }

  return (
    <label className="landing-percent-field">
      <span>{label}</span>
      <input
        type="text"
        inputMode="decimal"
        aria-label={`${label} width percent`}
        value={draft}
        onChange={(e) => {
          const raw = e.target.value.replace(",", ".");
          if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return;
          setDraft(raw);
        }}
        onBlur={(e) => commitFrom(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitFrom(e.currentTarget.value);
            e.currentTarget.blur();
          }
        }}
      />
    </label>
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

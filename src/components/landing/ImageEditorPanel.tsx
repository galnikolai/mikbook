"use client";

import { useEffect, useState, type KeyboardEvent, type ClipboardEvent } from "react";
import type { ImageItem, LandingLayout } from "@/lib/landing/layout-types";

const COL_WIDTH_MIN = 15;
const COL_WIDTH_MAX = 45;

type ColKey = keyof LandingLayout["columnWidths"];

function widthToDisplay(raw: string): string {
  const n = parseFloat(raw.replace(",", "."));
  return Number.isFinite(n) ? String(n) : "";
}

function formatWidth(n: number): string {
  return `${Math.round(n * 10) / 10}%`;
}

/** Keep three columns summing to 100%, each within 15–45. */
function distributeWidths(
  current: LandingLayout["columnWidths"],
  key: ColKey,
  rawValue: number,
): LandingLayout["columnWidths"] {
  const others = (["col1", "col2", "col3"] as const).filter((k) => k !== key);
  const maxForKey = Math.min(COL_WIDTH_MAX, 100 - COL_WIDTH_MIN * 2);
  const v = Math.min(maxForKey, Math.max(COL_WIDTH_MIN, rawValue));
  const rest = 100 - v;

  const o0 = parseFloat(current[others[0]]) || rest / 2;
  const o1 = parseFloat(current[others[1]]) || rest / 2;
  const sum = o0 + o1 || 1;
  let n0 = (o0 / sum) * rest;
  let n1 = (o1 / sum) * rest;

  if (n0 < COL_WIDTH_MIN) {
    n0 = COL_WIDTH_MIN;
    n1 = rest - COL_WIDTH_MIN;
  }
  if (n1 < COL_WIDTH_MIN) {
    n1 = COL_WIDTH_MIN;
    n0 = rest - COL_WIDTH_MIN;
  }
  if (n0 > COL_WIDTH_MAX) {
    n0 = COL_WIDTH_MAX;
    n1 = rest - COL_WIDTH_MAX;
  }
  if (n1 > COL_WIDTH_MAX) {
    n1 = COL_WIDTH_MAX;
    n0 = rest - COL_WIDTH_MAX;
  }

  return {
    ...current,
    [key]: formatWidth(v),
    [others[0]]: formatWidth(n0),
    [others[1]]: formatWidth(n1),
  };
}

const NAV_KEYS = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Escape",
  "Enter",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

/** Block letters and other non-numeric keys; optionally allow one decimal separator. */
function onDigitsKeyDown(
  e: KeyboardEvent<HTMLInputElement>,
  opts: { decimal?: boolean } = {},
) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (NAV_KEYS.has(e.key)) return;
  if (/^\d$/.test(e.key)) return;
  if (
    opts.decimal &&
    (e.key === "." || e.key === ",") &&
    !e.currentTarget.value.includes(".") &&
    !e.currentTarget.value.includes(",")
  ) {
    return;
  }
  e.preventDefault();
}

function onDigitsPaste(
  e: ClipboardEvent<HTMLInputElement>,
  opts: { decimal?: boolean } = {},
) {
  const text = e.clipboardData.getData("text");
  const ok = opts.decimal ? /^-?\d*[.,]?\d*$/.test(text) && text !== "" && text !== "-" : /^\d+$/.test(text);
  if (!ok) e.preventDefault();
}

function parseDigits(raw: string, allowDecimal = false): number | null {
  const cleaned = allowDecimal
    ? raw.replace(",", ".").replace(/[^\d.-]/g, "")
    : raw.replace(/\D/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = allowDecimal ? Number(cleaned) : Number.parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : null;
}

type Props = {
  layout: LandingLayout;
  selectedId: string | null;
  dirty: boolean;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<ImageItem>) => void;
  onAdd: (column: 2 | 3) => void;
  onRemove: (id: string) => void;
  onSave: () => void;
  onWidthsChange: (widths: LandingLayout["columnWidths"]) => void;
};

export function ImageEditorPanel({
  layout,
  selectedId,
  dirty,
  onSelect,
  onChange,
  onAdd,
  onRemove,
  onSave,
  onWidthsChange,
}: Props) {
  const selected = layout.images.find((i) => i.id === selectedId) ?? null;
  const colCount = selected
    ? layout.images.filter((i) => i.column === selected.column).length
    : 0;
  const maxOrder = Math.min(50, Math.max(1, colCount));
  const displayOrder = selected ? (selected.order ?? 0) + 1 : 1;

  const [widthDrafts, setWidthDrafts] = useState<Record<ColKey, string>>({
    col1: widthToDisplay(layout.columnWidths.col1),
    col2: widthToDisplay(layout.columnWidths.col2),
    col3: widthToDisplay(layout.columnWidths.col3),
  });
  const [widthFocused, setWidthFocused] = useState<ColKey | null>(null);

  useEffect(() => {
    setWidthDrafts((prev) => {
      const next = { ...prev };
      for (const key of ["col1", "col2", "col3"] as const) {
        if (widthFocused === key) continue;
        next[key] = widthToDisplay(layout.columnWidths[key]);
      }
      return next;
    });
  }, [layout.columnWidths, widthFocused]);

  function commitColumnWidth(key: ColKey, raw: string) {
    const n = parseDigits(raw);
    const next = distributeWidths(
      layout.columnWidths,
      key,
      n === null ? COL_WIDTH_MIN : n,
    );
    onWidthsChange(next);
    setWidthDrafts({
      col1: widthToDisplay(next.col1),
      col2: widthToDisplay(next.col2),
      col3: widthToDisplay(next.col3),
    });
  }

  function stepNumeric(
    id: string,
    field: "x" | "width",
    delta: number,
  ) {
    const img = layout.images.find((i) => i.id === id);
    if (!img) return;
    onChange(id, { [field]: Math.round((img[field] + delta) * 10) / 10 });
  }

  return (
    <aside className="fixed top-3 right-3 z-[100] flex max-h-[calc(100dvh-1.5rem)] w-72 flex-col gap-3 overflow-y-auto rounded-lg border border-black/15 bg-white/95 p-3 text-xs text-black shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <strong className="text-sm">Image editor</strong>
        {dirty && <span className="text-amber-700">unsaved</span>}
      </div>

      <section className="space-y-1.5 border-b border-black/10 pb-3">
        <p>Column widths</p>
        {(["col1", "col2", "col3"] as const).map((key) => (
          <label key={key} className="flex items-center justify-between gap-2">
            <span>{key}</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-24 rounded border border-black/20 px-1.5 py-1"
              value={widthDrafts[key]}
              onKeyDown={(e) => {
                onDigitsKeyDown(e);
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              onPaste={(e) => onDigitsPaste(e)}
              onFocus={() => setWidthFocused(key)}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setWidthDrafts((prev) => ({ ...prev, [key]: raw }));
              }}
              onBlur={(e) => {
                setWidthFocused(null);
                commitColumnWidth(key, e.target.value);
              }}
            />
          </label>
        ))}
      </section>

      <div className="flex gap-1.5">
        <button
          type="button"
          className="flex-1 rounded border border-black/20 px-2 py-1.5"
          onClick={() => onAdd(2)}
        >
          + Col 2
        </button>
        <button
          type="button"
          className="flex-1 rounded border border-black/20 px-2 py-1.5"
          onClick={() => onAdd(3)}
        >
          + Col 3
        </button>
      </div>

      {selected && (
        <section className="space-y-2">
          <p>Selected: {selected.id}</p>

          <div className="flex gap-1.5">
            <label className="block min-w-0 flex-1">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === "string") {
                      onChange(selected.id, { src: reader.result });
                    }
                  };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />
              <span className="flex w-full cursor-pointer items-center justify-center rounded border border-amber-400 bg-amber-50 px-2 py-1.5 text-amber-900">
                upload image
              </span>
            </label>
            <button
              type="button"
              className="flex-1 rounded border border-red-400 bg-red-50 px-2 py-1.5 text-red-700"
              onClick={() => {
                onRemove(selected.id);
                onSelect(null);
              }}
            >
              Delete image
            </button>
          </div>

          <label className="block space-y-1">
            <span>link to chapter</span>
            <input
              className="w-full rounded border border-black/20 px-1.5 py-1"
              value={selected.href ?? ""}
              placeholder="https://…"
              onChange={(e) =>
                onChange(selected.id, {
                  href: e.target.value.trim() || undefined,
                })
              }
            />
          </label>

          <div className="flex items-center justify-between gap-2">
            <span>Order</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Move up"
                className="rounded border border-black/20 px-1.5 py-1 leading-none disabled:opacity-40"
                disabled={displayOrder <= 1}
                onClick={() =>
                  onChange(selected.id, { order: Math.max(0, (selected.order ?? 0) - 1) })
                }
              >
                ▲
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-14 rounded border border-black/20 px-1.5 py-1 text-center"
                value={displayOrder}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    onChange(selected.id, {
                      order: Math.max(0, (selected.order ?? 0) - 1),
                    });
                    return;
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    onChange(selected.id, { order: (selected.order ?? 0) + 1 });
                    return;
                  }
                  onDigitsKeyDown(e);
                }}
                onPaste={(e) => onDigitsPaste(e)}
                onChange={(e) => {
                  const n = parseDigits(e.target.value);
                  if (n === null) return;
                  onChange(selected.id, { order: Math.floor(n) - 1 });
                }}
              />
              <button
                type="button"
                aria-label="Move down"
                className="rounded border border-black/20 px-1.5 py-1 leading-none disabled:opacity-40"
                disabled={displayOrder >= maxOrder}
                onClick={() =>
                  onChange(selected.id, { order: (selected.order ?? 0) + 1 })
                }
              >
                ▼
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span>Offset</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Offset left"
                className="rounded border border-black/20 px-1.5 py-1 leading-none"
                onClick={() => stepNumeric(selected.id, "x", -1)}
              >
                ◀
              </button>
              <input
                type="text"
                inputMode="decimal"
                className="w-14 rounded border border-black/20 px-1.5 py-1 text-center"
                value={selected.x}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    stepNumeric(selected.id, "x", -1);
                    return;
                  }
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    stepNumeric(selected.id, "x", 1);
                    return;
                  }
                  onDigitsKeyDown(e, { decimal: true });
                }}
                onPaste={(e) => onDigitsPaste(e, { decimal: true })}
                onChange={(e) => {
                  const n = parseDigits(e.target.value, true);
                  if (n === null) return;
                  onChange(selected.id, { x: n });
                }}
              />
              <button
                type="button"
                aria-label="Offset right"
                className="rounded border border-black/20 px-1.5 py-1 leading-none"
                onClick={() => stepNumeric(selected.id, "x", 1)}
              >
                ▶
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span>Width</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Width down"
                className="rounded border border-black/20 px-1.5 py-1 leading-none"
                onClick={() => stepNumeric(selected.id, "width", -1)}
              >
                ▼
              </button>
              <input
                type="text"
                inputMode="decimal"
                className="w-14 rounded border border-black/20 px-1.5 py-1 text-center"
                value={selected.width}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    stepNumeric(selected.id, "width", 1);
                    return;
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    stepNumeric(selected.id, "width", -1);
                    return;
                  }
                  onDigitsKeyDown(e, { decimal: true });
                }}
                onPaste={(e) => onDigitsPaste(e, { decimal: true })}
                onChange={(e) => {
                  const n = parseDigits(e.target.value, true);
                  if (n === null) return;
                  onChange(selected.id, { width: n });
                }}
              />
              <button
                type="button"
                aria-label="Width up"
                className="rounded border border-black/20 px-1.5 py-1 leading-none"
                onClick={() => stepNumeric(selected.id, "width", 1)}
              >
                ▲
              </button>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        className="w-full rounded border border-green-500 px-2 py-1.5 font-medium text-green-700"
        onClick={onSave}
      >
        Save Changes
      </button>
    </aside>
  );
}

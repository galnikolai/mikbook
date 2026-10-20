"use client";

import type { ImageItem, LandingLayout } from "@/lib/landing/layout-types";

const COL_WIDTH_MIN = 15;
const COL_WIDTH_MAX = 45;

function clampColumnWidth(raw: string): string {
  const n = parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(n)) return `${COL_WIDTH_MIN}%`;
  const clamped = Math.min(COL_WIDTH_MAX, Math.max(COL_WIDTH_MIN, n));
  return `${Math.round(clamped * 10) / 10}%`;
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

  return (
    <aside className="fixed top-3 right-3 z-[100] flex max-h-[calc(100dvh-1.5rem)] w-72 flex-col gap-3 overflow-y-auto rounded-lg border border-black/15 bg-white/95 p-3 text-xs text-black shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <strong className="text-sm">Image editor</strong>
        {dirty && <span className="text-amber-700">unsaved</span>}
      </div>

      <section className="space-y-1.5 border-b border-black/10 pb-3">
        <p className="font-medium">Column widths</p>
        {(["col1", "col2", "col3"] as const).map((key) => (
          <label key={key} className="flex items-center justify-between gap-2">
            <span>{key}</span>
            <input
              type="number"
              min={COL_WIDTH_MIN}
              max={COL_WIDTH_MAX}
              step={1}
              className="w-24 rounded border border-black/20 px-1.5 py-1"
              value={parseFloat(layout.columnWidths[key]) || ""}
              onChange={(e) =>
                onWidthsChange({
                  ...layout.columnWidths,
                  [key]: clampColumnWidth(e.target.value),
                })
              }
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
          <p className="font-medium">Selected: {selected.id}</p>

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
                type="number"
                min={1}
                max={maxOrder}
                className="w-14 rounded border border-black/20 px-1.5 py-1 text-center"
                value={displayOrder}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (!Number.isFinite(n)) return;
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

          <label className="flex items-center justify-between gap-2">
            <span>X %</span>
            <input
              type="number"
              className="w-20 rounded border border-black/20 px-1.5 py-1"
              value={selected.x}
              onChange={(e) => onChange(selected.id, { x: Number(e.target.value) })}
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Y px</span>
            <input
              type="number"
              className="w-20 rounded border border-black/20 px-1.5 py-1"
              value={selected.y}
              onChange={(e) => onChange(selected.id, { y: Number(e.target.value) })}
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Width %</span>
            <input
              type="number"
              className="w-20 rounded border border-black/20 px-1.5 py-1"
              value={selected.width}
              onChange={(e) => onChange(selected.id, { width: Number(e.target.value) })}
            />
          </label>
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

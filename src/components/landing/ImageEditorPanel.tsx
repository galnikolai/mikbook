"use client";

import type { ImageItem, LandingLayout } from "@/lib/landing/layout-types";

type Props = {
  layout: LandingLayout;
  selectedId: string | null;
  dirty: boolean;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<ImageItem>) => void;
  onAdd: (column: 2 | 3) => void;
  onRemove: (id: string) => void;
  onSave: () => void;
  onReset: () => void;
  onExport: () => void;
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
  onReset,
  onExport,
  onWidthsChange,
}: Props) {
  const selected = layout.images.find((i) => i.id === selectedId) ?? null;

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
              className="w-24 rounded border border-black/20 px-1.5 py-1"
              value={layout.columnWidths[key]}
              onChange={(e) =>
                onWidthsChange({ ...layout.columnWidths, [key]: e.target.value })
              }
            />
          </label>
        ))}
        <p className="text-[10px] text-black/50">e.g. 22% — applied live via CSS vars</p>
      </section>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          className="rounded bg-black px-2 py-1.5 text-white"
          onClick={onSave}
        >
          Save
        </button>
        <button
          type="button"
          className="rounded border border-black/20 px-2 py-1.5"
          onClick={onExport}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="rounded border border-black/20 px-2 py-1.5"
          onClick={onReset}
        >
          Reset
        </button>
      </div>

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

      <ul className="max-h-40 space-y-1 overflow-y-auto border-b border-black/10 pb-3">
        {layout.images.map((img) => (
          <li key={img.id}>
            <button
              type="button"
              className={`w-full rounded px-2 py-1 text-left ${selectedId === img.id ? "bg-black text-white" : "hover:bg-black/5"}`}
              onClick={() => onSelect(img.id)}
            >
              col{img.column} · {img.id}
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <section className="space-y-2">
          <p className="font-medium">Selected: {selected.id}</p>

          <label className="block space-y-1">
            <span>Replace image</span>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-[10px]"
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
              }}
            />
          </label>

          <label className="block space-y-1">
            <span>Link (href)</span>
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
          <label className="flex items-center justify-between gap-2">
            <span>Scale</span>
            <input
              type="number"
              step="0.05"
              className="w-20 rounded border border-black/20 px-1.5 py-1"
              value={selected.scale}
              onChange={(e) => onChange(selected.id, { scale: Number(e.target.value) })}
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>zIndex</span>
            <input
              type="number"
              className="w-20 rounded border border-black/20 px-1.5 py-1"
              value={selected.zIndex}
              onChange={(e) => onChange(selected.id, { zIndex: Number(e.target.value) })}
            />
          </label>

          <button
            type="button"
            className="w-full rounded border border-red-300 px-2 py-1.5 text-red-700"
            onClick={() => {
              onRemove(selected.id);
              onSelect(null);
            }}
          >
            Delete image
          </button>
        </section>
      )}

      <p className="text-[10px] text-black/45">
        Стопка: scale сдвигает все ниже. Drag X — смещение, Y — порядок в колонке.
      </p>
    </aside>
  );
}

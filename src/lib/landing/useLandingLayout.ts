"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ColumnId, ImageItem, LandingLayout } from "./layout-types";
import { normalizeLayout, STORAGE_KEY } from "./layout-types";
import {
  clampImageInColumn,
  ensureColumnOrders,
  moveOrder,
  reflowColumn,
  sortByOrder,
} from "./stack";

function hydrate(raw: LandingLayout): LandingLayout {
  return {
    ...raw,
    images: ensureColumnOrders(raw.images),
  };
}

async function fetchSeed(): Promise<LandingLayout> {
  const res = await fetch("/landing/layout.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load layout seed");
  const data: unknown = await res.json();
  const normalized = normalizeLayout(data);
  if (!normalized) throw new Error("Invalid layout seed");
  return hydrate(normalized);
}

function aspectsFrom(images: ImageItem[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const img of images) {
    if (img.naturalAspect) map[img.id] = img.naturalAspect;
  }
  return map;
}

export function useLandingLayout() {
  const [layout, setLayout] = useState<LandingLayout | null>(null);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const colWidthsRef = useRef<Record<ColumnId, number>>({ 2: 400, 3: 400 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const normalized = normalizeLayout(JSON.parse(raw) as unknown);
          if (normalized) {
            if (!cancelled) {
              setLayout(hydrate(normalized));
              setReady(true);
            }
            return;
          }
        }
        const seed = await fetchSeed();
        if (!cancelled) {
          setLayout(seed);
          setReady(true);
        }
      } catch {
        const seed = await fetchSeed();
        if (!cancelled) {
          setLayout(seed);
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateLayout = useCallback((updater: (prev: LandingLayout) => LandingLayout) => {
    setLayout((prev) => {
      if (!prev) return prev;
      setDirty(true);
      return updater(prev);
    });
  }, []);

  const reflow = useCallback((images: ImageItem[], column: ColumnId) => {
    return reflowColumn(
      images,
      column,
      colWidthsRef.current[column] || 400,
      aspectsFrom(images),
    );
  }, []);

  const setColumnWidth = useCallback((column: ColumnId, widthPx: number) => {
    if (widthPx < 40) return;
    const prevW = colWidthsRef.current[column];
    if (Math.abs(prevW - widthPx) < 2) return;
    colWidthsRef.current[column] = widthPx;
    setLayout((layoutPrev) => {
      if (!layoutPrev) return layoutPrev;
      return {
        ...layoutPrev,
        images: reflowColumn(
          layoutPrev.images,
          column,
          widthPx,
          aspectsFrom(layoutPrev.images),
        ),
      };
    });
  }, []);

  const updateImage = useCallback(
    (id: string, patch: Partial<ImageItem>) => {
      updateLayout((prev) => {
        if (patch.order !== undefined) {
          const target = prev.images.find((i) => i.id === id);
          if (!target) return prev;
          const colCount = prev.images.filter((i) => i.column === target.column).length;
          const maxIdx = Math.max(0, Math.min(49, colCount - 1));
          const next = Math.max(0, Math.min(maxIdx, Math.floor(patch.order)));
          let images = moveOrder(prev.images, id, next);
          images = reflow(images, target.column);
          return { ...prev, images };
        }

        let images = prev.images.map((img) => {
          if (img.id !== id) return img;
          const merged = { ...img, ...patch };
          const prefer =
            patch.scale !== undefined || patch.width !== undefined ? "scale" : "x";
          return clampImageInColumn(merged, prefer);
        });
        const target = images.find((i) => i.id === id);
        if (!target) return prev;

        if (patch.naturalAspect !== undefined && Object.keys(patch).length === 1) {
          images = reflow(images, target.column);
          return { ...prev, images };
        }

        if (patch.scale !== undefined || patch.width !== undefined) {
          images = reflow(images, target.column);
          return { ...prev, images };
        }

        if (patch.y !== undefined) {
          const col = sortByOrder(images.filter((i) => i.column === target.column));
          const idx = col.findIndex((i) => i.id === id);
          if (idx < 0) return { ...prev, images };

          // find insert index by comparing drag y to neighbors' centers
          let newOrder = idx;
          for (let i = 0; i < col.length; i++) {
            if (i === idx) continue;
            const aspect = col[i].naturalAspect ?? 1.25;
            const h =
              ((col[i].width / 100) * (colWidthsRef.current[target.column] || 400)) *
              aspect *
              col[i].scale;
            const center = col[i].y + h / 2;
            if (patch.y! + 20 < center && i < idx) newOrder = Math.min(newOrder, i);
            if (patch.y! > center && i > idx) newOrder = Math.max(newOrder, i);
          }

          if (newOrder !== idx) {
            const item = col[idx];
            const without = col.filter((i) => i.id !== id);
            without.splice(newOrder, 0, { ...item, x: target.x });
            const reordered = without.map((img, i) => ({ ...img, order: i }));
            const others = images.filter((i) => i.column !== target.column);
            images = reflow([...others, ...reordered], target.column);
          } else {
            // keep x, snap y back via reflow
            images = images.map((img) =>
              img.id === id ? { ...img, x: target.x } : img,
            );
            images = reflow(images, target.column);
          }
          return { ...prev, images };
        }

        if (patch.x !== undefined) {
          return { ...prev, images };
        }

        return { ...prev, images };
      });
    },
    [reflow, updateLayout],
  );

  const addImage = useCallback(
    (column: 2 | 3) => {
      const id = `img-${column}-${Date.now()}`;
      updateLayout((prev) => {
        const colCount = prev.images.filter((i) => i.column === column).length;
        let images: ImageItem[] = [
          ...prev.images,
          {
            id,
            column,
            src: "/landing/img-01.jpg",
            x: 10,
            y: 40,
            order: colCount,
            scale: 1,
            width: 60,
            zIndex: prev.images.length + 1,
          },
        ];
        images = reflow(images, column);
        return { ...prev, images };
      });
      return id;
    },
    [reflow, updateLayout],
  );

  const removeImage = useCallback(
    (id: string) => {
      updateLayout((prev) => {
        const target = prev.images.find((i) => i.id === id);
        let images = prev.images.filter((img) => img.id !== id);
        if (target) images = reflow(images, target.column);
        return { ...prev, images };
      });
    },
    [reflow, updateLayout],
  );

  const save = useCallback(() => {
    if (!layout) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    setDirty(false);
  }, [layout]);

  const reset = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    const seed = await fetchSeed();
    setLayout(seed);
    setDirty(false);
  }, []);

  const exportJson = useCallback(() => {
    if (!layout) return;
    const blob = new Blob([JSON.stringify(layout, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "layout.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [layout]);

  /** Relative order nudge from current state (safe for rapid key repeats). */
  const nudgeOrder = useCallback(
    (id: string, delta: number) => {
      updateLayout((prev) => {
        const target = prev.images.find((i) => i.id === id);
        if (!target) return prev;
        const colCount = prev.images.filter((i) => i.column === target.column).length;
        const maxIdx = Math.max(0, Math.min(49, colCount - 1));
        const next = Math.max(0, Math.min(maxIdx, (target.order ?? 0) + delta));
        if (next === (target.order ?? 0)) return prev;
        let images = moveOrder(prev.images, id, next);
        images = reflow(images, target.column);
        return { ...prev, images };
      });
    },
    [updateLayout, reflow],
  );

  const nudgeX = useCallback(
    (id: string, delta: number) => {
      updateLayout((prev) => {
        const images = prev.images.map((img) => {
          if (img.id !== id) return img;
          return clampImageInColumn({ ...img, x: img.x + delta }, "x");
        });
        return { ...prev, images };
      });
    },
    [updateLayout],
  );

  return {
    layout,
    ready,
    dirty,
    updateLayout,
    updateImage,
    addImage,
    removeImage,
    save,
    reset,
    exportJson,
    setColumnWidth,
    nudgeOrder,
    nudgeX,
  };
}

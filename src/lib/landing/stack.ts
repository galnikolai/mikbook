import type { ColumnId, ImageItem } from "./layout-types";

/** Vertical spacing between stacked images (0 = flush). */
export const STACK_GAP = 0;

/**
 * Keep image inside column horizontally.
 * Visual right edge ≈ x + width * scale (must be ≤ 100%).
 *
 * @param prefer — when "x": only nudge position (drag). when "scale": limit scale / pull x left (resize).
 */
export function clampImageInColumn<T extends Pick<ImageItem, "x" | "width" | "scale">>(
  img: T,
  prefer: "x" | "scale" = "x",
): T {
  let width = Math.max(5, Math.min(100, img.width));
  let scale = Math.max(0.3, Math.min(3, img.scale));
  let x = Math.max(0, img.x);

  if (prefer === "x") {
    // Drag: never shrink — only stop at the right edge
    const maxX = 100 - width * scale;
    x = Math.max(0, Math.min(x, Math.max(0, maxX)));
  } else {
    // Scale/width change: cap scale so it fits; if needed, pull x left
    const maxScale = Math.max(0.3, (100 - x) / width);
    if (scale > maxScale) {
      scale = maxScale;
    }
    const maxX = 100 - width * scale;
    if (x > maxX) {
      x = Math.max(0, maxX);
    }
  }

  return {
    ...img,
    x: Math.round(x * 10) / 10,
    width: Math.round(width * 10) / 10,
    scale: Math.round(scale * 100) / 100,
  };
}

/** Stack plane starts at 0 — headers live outside the image plane. */
export const STACK_START_Y: Record<ColumnId, number> = {
  2: 0,
  3: 0,
};

/** Effective rendered height in px for a given column width. */
export function stackedHeight(
  image: ImageItem,
  columnWidthPx: number,
  aspect: number,
): number {
  const baseW = (Math.max(1, image.width) / 100) * columnWidthPx;
  const scale = Math.max(0.05, image.scale);
  return baseW * aspect * scale;
}

export function sortByOrder(images: ImageItem[]): ImageItem[] {
  return [...images].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.y - b.y);
}

/** Assign sequential order per column from current y if order missing. */
export function ensureColumnOrders(images: ImageItem[]): ImageItem[] {
  const byCol: Record<number, ImageItem[]> = { 2: [], 3: [] };
  const rest: ImageItem[] = [];
  for (const img of images) {
    if (img.column === 2 || img.column === 3) byCol[img.column].push(img);
    else rest.push(img);
  }
  const result: ImageItem[] = [...rest];
  for (const col of [2, 3] as ColumnId[]) {
    const sorted = [...byCol[col]].sort(
      (a, b) => (a.order ?? a.y) - (b.order ?? b.y) || a.y - b.y,
    );
    sorted.forEach((img, i) => {
      result.push({ ...img, order: i });
    });
  }
  return result;
}

/**
 * Pack images in a column top-to-bottom (flush when gap = 0).
 * Y of each item = sum of heights of items above + gaps.
 */
export function reflowColumn(
  images: ImageItem[],
  column: ColumnId,
  columnWidthPx: number,
  aspects: Record<string, number>,
  gap = STACK_GAP,
  startY = STACK_START_Y[column],
): ImageItem[] {
  const others = images.filter((i) => i.column !== column);
  const col = sortByOrder(images.filter((i) => i.column === column));

  let y = startY;
  const packed = col.map((img, index) => {
    const aspect = aspects[img.id] ?? img.naturalAspect ?? 1.25;
    const clamped = clampImageInColumn(img);
    const next = { ...clamped, order: index, y: Math.floor(y) };
    y += stackedHeight(clamped, columnWidthPx, aspect) + gap;
    return next;
  });

  return [...others, ...packed];
}

/** After changing order of one item, renormalize 0..n and reflow. */
export function moveOrder(
  images: ImageItem[],
  id: string,
  newOrder: number,
): ImageItem[] {
  const target = images.find((i) => i.id === id);
  if (!target) return images;
  const col = sortByOrder(images.filter((i) => i.column === target.column));
  const without = col.filter((i) => i.id !== id);
  const clamped = Math.max(0, Math.min(without.length, newOrder));
  without.splice(clamped, 0, target);
  const reordered = without.map((img, i) => ({ ...img, order: i }));
  const others = images.filter((i) => i.column !== target.column);
  return [...others, ...reordered];
}

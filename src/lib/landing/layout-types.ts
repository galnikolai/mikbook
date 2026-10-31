import {
  clampSplits,
  DEFAULT_SPLITS,
  type ColumnSplits,
  widthsToSplits,
} from "./column-splits";

export type ColumnId = 2 | 3;

export type ImageItem = {
  id: string;
  column: ColumnId;
  src: string;
  /** % from left of column */
  x: number;
  /** px from top of scroll content — computed by magnet stack */
  y: number;
  /** stack index in column (0 = top); drives vertical order */
  order: number;
  /** multiplicative scale on top of width */
  scale: number;
  /** base width as % of column */
  width: number;
  href?: string;
  zIndex: number;
  /** height / width from natural image size (set on load) */
  naturalAspect?: number;
};

export type { ColumnSplits };

/** @deprecated legacy shape — migrated via normalizeLayout */
export type ColumnWidths = {
  col1: string;
  col2: string;
  col3: string;
};

export type LandingLayout = {
  version: 2;
  columnSplits: ColumnSplits;
  images: ImageItem[];
  /** min height of scroll content in mid/right columns (px) */
  contentHeight: number;
};

/** bump when layout semantics change */
export const STORAGE_KEY = "mikbook-landing-layout-v7";

export const DEFAULT_LAYOUT_SPLITS = DEFAULT_SPLITS;

/** Accept v2 splits or legacy v1 columnWidths. */
export function normalizeLayout(raw: unknown): LandingLayout | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  if (!Array.isArray(v.images) || typeof v.contentHeight !== "number") return null;

  if (
    v.version === 2 &&
    v.columnSplits &&
    typeof v.columnSplits === "object"
  ) {
    const s = v.columnSplits as Record<string, unknown>;
    if (typeof s.split12 === "number" && typeof s.split23 === "number") {
      return {
        version: 2,
        columnSplits: clampSplits(s.split12, s.split23),
        images: v.images as LandingLayout["images"],
        contentHeight: v.contentHeight,
      };
    }
  }

  if (v.columnWidths && typeof v.columnWidths === "object") {
    const w = v.columnWidths as ColumnWidths;
    return {
      version: 2,
      columnSplits: widthsToSplits(w),
      images: v.images as LandingLayout["images"],
      contentHeight: v.contentHeight,
    };
  }

  return null;
}

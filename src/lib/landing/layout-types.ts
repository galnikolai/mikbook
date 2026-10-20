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

export type ColumnWidths = {
  col1: string;
  col2: string;
  col3: string;
};

export type LandingLayout = {
  version: 1;
  columnWidths: ColumnWidths;
  images: ImageItem[];
  /** min height of scroll content in mid/right columns (px) */
  contentHeight: number;
};

/** bump when layout semantics change (magnet stack) */
export const STORAGE_KEY = "mikbook-landing-layout-v3";

export const DEFAULT_WIDTHS: ColumnWidths = {
  col1: "22%",
  col2: "39%",
  col3: "39%",
};

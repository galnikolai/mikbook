/** Minimum width of any column as % of the row. */
export const COL_MIN = 15;

export type ColumnSplits = {
  /** % from left: end of col1 / start of col2 */
  split12: number;
  /** % from left: end of col2 / start of col3 */
  split23: number;
};

/** Proportions close to kline.brussels at desktop: ~24 / 28 / 48 */
export const DEFAULT_SPLITS: ColumnSplits = {
  split12: 24,
  split23: 52,
};

export type ColumnPercents = {
  col1: number;
  col2: number;
  col3: number;
};

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function splitsToPercents(s: ColumnSplits): ColumnPercents {
  return {
    col1: round1(s.split12),
    col2: round1(s.split23 - s.split12),
    col3: round1(100 - s.split23),
  };
}

export function percentsToGrid(p: ColumnPercents): string {
  return `${p.col1}% ${p.col2}% ${p.col3}%`;
}

/** Clamp so each column is at least COL_MIN and splits stay ordered. */
export function clampSplits(split12: number, split23: number): ColumnSplits {
  let a = split12;
  let b = split23;
  a = Math.max(COL_MIN, Math.min(100 - 2 * COL_MIN, a));
  b = Math.max(a + COL_MIN, Math.min(100 - COL_MIN, b));
  return { split12: round1(a), split23: round1(b) };
}

export function setSplit12(current: ColumnSplits, next: number): ColumnSplits {
  return clampSplits(next, current.split23);
}

export function setSplit23(current: ColumnSplits, next: number): ColumnSplits {
  return clampSplits(current.split12, next);
}

/** Set one column's width in %; the adjacent column absorbs the delta. */
export function setColPercent(
  current: ColumnSplits,
  which: 1 | 2 | 3,
  value: number,
): ColumnSplits {
  if (which === 1) return setSplit12(current, value);
  if (which === 2) return setSplit23(current, current.split12 + value);
  return setSplit23(current, 100 - value);
}

/** Migrate legacy col1/col2/col3 % strings into splits. */
export function widthsToSplits(widths: {
  col1?: string;
  col2?: string;
  col3?: string;
}): ColumnSplits {
  const c1 = parseFloat(widths.col1 ?? "") || DEFAULT_SPLITS.split12;
  const c2 = parseFloat(widths.col2 ?? "") || 39;
  const c3 = parseFloat(widths.col3 ?? "") || 39;
  const sum = c1 + c2 + c3 || 100;
  const n1 = (c1 / sum) * 100;
  const n2 = (c2 / sum) * 100;
  return clampSplits(n1, n1 + n2);
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ColumnId, ImageItem } from "@/lib/landing/layout-types";
import { sortByOrder, stackedHeight, STACK_GAP, STACK_START_Y } from "@/lib/landing/stack";
import { ImageLayer } from "./ImageLayer";

type Props = {
  column: ColumnId;
  images: ImageItem[];
  contentHeight: number;
  editMode: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<ImageItem>) => void;
  onColumnWidth: (column: ColumnId, widthPx: number) => void;
  header?: ReactNode;
  className?: string;
};

export function MagnetColumn({
  column,
  images,
  contentHeight,
  editMode,
  selectedId,
  onSelect,
  onChange,
  onColumnWidth,
  header,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const sorted = sortByOrder(images.filter((i) => i.column === column));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const report = () => onColumnWidth(column, el.clientWidth);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [column, onColumnWidth]);

  // Stack Y is local to the image plane (below header), not the whole column.
  const startY = header ? 0 : STACK_START_Y[column];
  let stackBottom = startY;
  const colW = ref.current?.clientWidth || 400;
  for (const img of sorted) {
    stackBottom +=
      stackedHeight(img, colW, img.naturalAspect ?? 1.25) + STACK_GAP;
  }
  const minH = Math.max(
    header ? 0 : contentHeight,
    Math.round(stackBottom + 80),
  );

  return (
    <div
      ref={ref}
      className={className}
      data-image-column={column}
    >
      <div className="p-3 pb-12">
        {header}
        <div className="relative" style={{ minHeight: minH }}>
          {sorted.map((img) => (
            <ImageLayer
              key={img.id}
              image={img}
              editMode={editMode}
              selected={selectedId === img.id}
              onSelect={onSelect}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ColumnId, ImageItem } from "@/lib/landing/layout-types";
import { sortByOrder, stackedHeight, STACK_GAP } from "@/lib/landing/stack";
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
  const stackRef = useRef<HTMLDivElement>(null);
  const sorted = sortByOrder(images.filter((i) => i.column === column));

  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    const report = () => onColumnWidth(column, el.clientWidth);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [column, onColumnWidth]);

  let stackBottom = 0;
  const colW = stackRef.current?.clientWidth || 400;
  for (const img of sorted) {
    stackBottom +=
      stackedHeight(img, colW, img.naturalAspect ?? 1.25) + STACK_GAP;
  }
  const minH = Math.max(
    header ? 0 : contentHeight,
    Math.round(stackBottom + 80),
  );

  return (
    <div className={className}>
      {header ? <div className="px-3 pt-3 pb-2">{header}</div> : null}
      <div
        ref={stackRef}
        className="relative w-full"
        data-image-column={column}
        style={{ minHeight: minH }}
      >
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
  );
}

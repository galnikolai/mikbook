"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ColumnId, ImageItem } from "@/lib/landing/layout-types";
import { sortByOrder } from "@/lib/landing/stack";
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
  const rootRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const sorted = sortByOrder(images.filter((i) => i.column === column));
  const selectedInCol = sorted.find((i) => i.id === selectedId);

  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    const report = () => onColumnWidth(column, el.clientWidth);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [column, onColumnWidth]);

  useEffect(() => {
    if (!editMode || !selectedInCol) return;
    const node = rootRef.current?.querySelector(
      `[data-image-id="${selectedInCol.id}"]`,
    ) as HTMLElement | null;
    if (!node) return;
    const id = requestAnimationFrame(() => {
      node.scrollIntoView({ block: "nearest", behavior: "smooth", inline: "nearest" });
    });
    return () => cancelAnimationFrame(id);
  }, [
    editMode,
    selectedInCol?.id,
    selectedInCol?.order,
    selectedInCol?.x,
    selectedInCol?.width,
    selectedInCol?.scale,
  ]);

  return (
    <div ref={rootRef} className={className}>
      {header ? (
        <div className="min-w-0 max-w-full overflow-x-hidden px-3 pt-3 pb-2">
          {header}
        </div>
      ) : null}
      <div
        ref={stackRef}
        className="relative flex w-full flex-col"
        data-image-column={column}
        style={{ minHeight: header ? undefined : contentHeight }}
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

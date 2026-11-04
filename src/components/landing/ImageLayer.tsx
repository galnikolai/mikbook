"use client";

import {
  useCallback,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { ImageItem } from "@/lib/landing/layout-types";
import { clampImageInColumn } from "@/lib/landing/stack";

type Props = {
  image: ImageItem;
  editMode: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<ImageItem>) => void;
};

export function ImageLayer({ image, editMode, selected, onSelect, onChange }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    mode: "move" | "scale";
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origScale: number;
    colWidth: number;
  } | null>(null);

  const onPointerDownMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect(image.id);
      const col = (e.currentTarget as HTMLElement).closest("[data-image-column]");
      const colWidth = col?.clientWidth ?? 1;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        mode: "move",
        startX: e.clientX,
        startY: e.clientY,
        origX: image.x,
        origY: image.y,
        origScale: image.scale,
        colWidth,
      };
    },
    [editMode, image.id, image.scale, image.x, image.y, onSelect],
  );

  const onPointerDownScale = useCallback(
    (e: ReactPointerEvent) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect(image.id);
      const col = (e.currentTarget as HTMLElement).closest("[data-image-column]");
      const colWidth = col?.clientWidth ?? 1;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        mode: "scale",
        startX: e.clientX,
        startY: e.clientY,
        origX: image.x,
        origY: image.y,
        origScale: image.scale,
        colWidth,
      };
    },
    [editMode, image.id, image.scale, image.x, image.y, onSelect],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (drag.mode === "move") {
        const nextX = drag.origX + (dx / drag.colWidth) * 100;
        const clamped = clampImageInColumn(
          { x: nextX, width: image.width, scale: image.scale },
          "x",
        );
        onChange(image.id, {
          x: clamped.x,
          y: Math.round(drag.origY + dy),
        });
      } else {
        const delta = dx / 120;
        const nextScale = drag.origScale + delta;
        const clamped = clampImageInColumn(
          { x: image.x, width: image.width, scale: nextScale },
          "scale",
        );
        onChange(image.id, { scale: clamped.scale, x: clamped.x });
      }
    },
    [image.id, image.scale, image.width, image.x, onChange],
  );

  const onPointerUp = useCallback((e: ReactPointerEvent) => {
    if (dragRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      dragRef.current = null;
    }
  }, []);

  // Flow layout: no absolute top — browser stacks flush; x via margin.
  const style: CSSProperties = {
    width: `${image.width * image.scale}%`,
    marginLeft: `${image.x}%`,
    zIndex: image.zIndex,
  };

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (!el.naturalWidth) return;
    const aspect = el.naturalHeight / el.naturalWidth;
    if (
      !image.naturalAspect ||
      Math.abs(image.naturalAspect - aspect) > 0.01
    ) {
      onChange(image.id, { naturalAspect: aspect });
    }
  };

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      alt=""
      draggable={false}
      className="m-0 block h-auto w-full select-none align-top leading-none"
      onLoad={onImgLoad}
    />
  );

  if (!editMode) {
    if (image.href) {
      return (
        <a
          href={image.href}
          target="_blank"
          rel="noopener noreferrer"
          data-image-id={image.id}
          className="relative block leading-none"
          style={style}
        >
          {img}
        </a>
      );
    }
    return (
      <div data-image-id={image.id} className="relative block leading-none" style={style}>
        {img}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      data-image-id={image.id}
      tabIndex={selected ? 0 : -1}
      className={`relative block cursor-move touch-none leading-none outline-none ${selected ? "outline outline-2 outline-black -outline-offset-2" : ""}`}
      style={style}
      onPointerDown={onPointerDownMove}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(image.id);
      }}
    >
      {img}
      {selected && (
        <button
          type="button"
          aria-label="Scale"
          className="absolute -right-2 -bottom-2 h-4 w-4 cursor-nwse-resize rounded-full border border-black bg-white"
          onPointerDown={onPointerDownScale}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      )}
    </div>
  );
}

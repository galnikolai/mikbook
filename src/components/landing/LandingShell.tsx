"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { useLandingLayout } from "@/lib/landing/useLandingLayout";
import { ColumnLayout } from "./ColumnLayout";
import { ImageEditorPanel } from "./ImageEditorPanel";
import { SubscribeWidget } from "./SubscribeWidget";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable=true]"));
}

export function LandingShell() {
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "1";
  const {
    layout,
    ready,
    dirty,
    updateLayout,
    updateImage,
    addImage,
    removeImage,
    save,
    setColumnWidth,
    nudgeOrder,
    nudgeX,
  } = useLandingLayout();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  useEffect(() => {
    if (!editMode) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      const id = selectedIdRef.current;
      if (!id) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        nudgeOrder(id, -1);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        nudgeOrder(id, 1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        nudgeX(id, e.shiftKey ? -5 : -1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nudgeX(id, e.shiftKey ? 5 : 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editMode, nudgeOrder, nudgeX]);

  if (!ready || !layout) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--landing-bg)] text-sm text-black/50">
        Loading…
      </div>
    );
  }

  return (
    <LocaleProvider>
      <ColumnLayout
        layout={layout}
        editMode={editMode}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onChange={updateImage}
        onColumnWidth={setColumnWidth}
      />
      {editMode && (
        <ImageEditorPanel
          layout={layout}
          selectedId={selectedId}
          dirty={dirty}
          onSelect={setSelectedId}
          onChange={updateImage}
          onAdd={(column) => {
            const id = addImage(column);
            setSelectedId(id);
          }}
          onRemove={removeImage}
          onSave={save}
          onSplitsChange={(columnSplits) =>
            updateLayout((prev) => ({ ...prev, columnSplits }))
          }
        />
      )}
      {!editMode && <SubscribeWidget />}
    </LocaleProvider>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLandingLayout } from "@/lib/landing/useLandingLayout";
import { ColumnLayout } from "./ColumnLayout";
import { ImageEditorPanel } from "./ImageEditorPanel";
import { SubscribeWidget } from "./SubscribeWidget";

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
    reset,
    exportJson,
    setColumnWidth,
  } = useLandingLayout();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!ready || !layout) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--landing-bg)] text-sm text-black/50">
        Loading…
      </div>
    );
  }

  return (
    <>
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
          onReset={reset}
          onExport={exportJson}
          onWidthsChange={(columnWidths) =>
            updateLayout((prev) => ({ ...prev, columnWidths }))
          }
        />
      )}
      <SubscribeWidget />
    </>
  );
}

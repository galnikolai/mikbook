"use client";

import { CHAPTERS } from "@/lib/landing/chapters";
import type { ColumnId, ImageItem, LandingLayout } from "@/lib/landing/layout-types";
import { MagnetColumn } from "./MagnetColumn";

type Props = {
  layout: LandingLayout;
  editMode: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<ImageItem>) => void;
  onColumnWidth: (column: ColumnId, widthPx: number) => void;
};

function Col1Text() {
  return (
    <div className="landing-col1-inner">
      <h1 className="landing-brand">MIKBOOK</h1>
      <p>
        Devenir un interne sous-alimenté puis un médecin assigné en justice n&apos;est
        pas facile ; il faut d&apos;abord une dure préparation.
      </p>
      <p>
        Synthèse méthodique du programme des EDN, le MIKBOOK propose aux étudiants un
        outil de mémorisation visuelle et logique des points essentiels, s&apos;appuyant
        sur un graphisme particulier et un code de couleurs identique pour chaque item
        de chaque chapitre, visant à un projet pédagogique global.
      </p>
      <p className="landing-cta">
        <strong>Read the Mikbook</strong>
        <br />
        or just play with it.
      </p>
      <address className="landing-meta not-italic">
        @mikbook
        <br />
        Editions Eyrolles
        <br />
        1 rue Thénard
        <br />
        75005 Paris
        <br />
        <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
          Follow us on instagram
        </a>
      </address>
    </div>
  );
}

function Col2Chapters() {
  return (
    <nav className="landing-chapters relative z-[5]" aria-label="Chapitres">
      <p className="landing-chapters__label">24 chapitres</p>
      <ol className="landing-chapters__list">
        {CHAPTERS.map((ch) => (
          <li key={ch.code}>
            <span className="landing-chapters__code">
              {ch.n}-{ch.code}
            </span>
            <span className="landing-chapters__title">{ch.title}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ColumnLayout({
  layout,
  editMode,
  selectedId,
  onSelect,
  onChange,
  onColumnWidth,
}: Props) {
  const { col1, col2: w2, col3: w3 } = layout.columnWidths;

  return (
    <div
      className="min-h-dvh bg-[var(--landing-bg)] text-[var(--landing-fg)]"
      onClick={() => {
        if (editMode) onSelect(null);
      }}
    >
      <div
        className="hidden h-dvh overflow-hidden min-[900px]:grid"
        style={{ gridTemplateColumns: `${col1} ${w2} ${w3}` }}
      >
        <aside className="min-w-0 overflow-hidden p-5">
          <Col1Text />
        </aside>

        <MagnetColumn
          column={2}
          images={layout.images}
          contentHeight={layout.contentHeight}
          editMode={editMode}
          selectedId={selectedId}
          onSelect={onSelect}
          onChange={onChange}
          onColumnWidth={onColumnWidth}
          header={<Col2Chapters />}
          className="min-w-0 overflow-x-hidden overflow-y-auto border-l border-black/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        />

        <MagnetColumn
          column={3}
          images={layout.images}
          contentHeight={layout.contentHeight}
          editMode={editMode}
          selectedId={selectedId}
          onSelect={onSelect}
          onChange={onChange}
          onColumnWidth={onColumnWidth}
          className="min-w-0 overflow-x-hidden overflow-y-auto border-l border-black/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        />
      </div>

      <div className="block min-[900px]:hidden">
        <section className="border-b border-black/10 p-5">
          <Col1Text />
        </section>
        <MagnetColumn
          column={2}
          images={layout.images}
          contentHeight={Math.min(layout.contentHeight, 1400)}
          editMode={editMode}
          selectedId={selectedId}
          onSelect={onSelect}
          onChange={onChange}
          onColumnWidth={onColumnWidth}
          header={<Col2Chapters />}
          className="relative border-b border-black/10"
        />
        <MagnetColumn
          column={3}
          images={layout.images}
          contentHeight={Math.min(layout.contentHeight, 1400)}
          editMode={editMode}
          selectedId={selectedId}
          onSelect={onSelect}
          onChange={onChange}
          onColumnWidth={onColumnWidth}
          className="relative"
        />
      </div>
    </div>
  );
}

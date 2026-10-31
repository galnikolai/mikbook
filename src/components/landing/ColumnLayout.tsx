"use client";

import { CHAPTERS } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { percentsToGrid, splitsToPercents } from "@/lib/landing/column-splits";
import type { ColumnId, ImageItem, LandingLayout } from "@/lib/landing/layout-types";
import { LanguageToggle } from "./LanguageToggle";
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
  const { t } = useLocale();

  return (
    <div className="landing-col1">
      <div className="landing-col1-inner">
        <div className="landing-text">
          <p>
            {t.brand}.
            <br />
            {t.intro}
          </p>
          <p>{t.body}</p>
        </div>
        <div className="landing-text-btn">
          <button
            type="button"
            className="landing-cta-link"
            onClick={() => window.dispatchEvent(new Event("mikbook:subscribe"))}
          >
            {t.ctaLead}
          </button>
        </div>
        <div className="landing-text">
          <p>{t.ctaSub}</p>
          <p>
            <a href="mailto:hello@mikbook.com">{t.handle}</a>
            <br />
            {t.publisher}
          </p>
          <p>
            {t.address1}
            <br />
            {t.address2}
          </p>
          <p>
            <a
              href="https://www.instagram.com/mikbookofficiel/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.instagram}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Col2Menu() {
  const { locale, t } = useLocale();

  return (
    <nav className="landing-menu" aria-label={t.chapters}>
      <LanguageToggle className="landing-lang--title" />
      <div className="landing-menu__body">
        <section className="landing-menu__section">
          <h2 className="landing-menu__heading">{t.chapters}</h2>
          <p className="landing-chapters__line">
            {CHAPTERS.map((ch, i) => (
              <span key={ch.code}>
                {i > 0 ? " " : null}
                <span className="landing-chapters__item">
                  ({ch.n}){ch.short[locale]}
                </span>
              </span>
            ))}
          </p>
        </section>

        <section className="landing-menu__section">
          <h2 className="landing-menu__heading">{t.practices}</h2>
          <ul className="landing-menu__list">
            <li>{t.flashcards}</li>
            <li>{t.trivia}</li>
            <li>{t.cases}</li>
          </ul>
        </section>

        <section className="landing-menu__section">
          <h2 className="landing-menu__heading">{t.games}</h2>
          <ul className="landing-menu__list">
            <li>{t.snake}</li>
            <li>{t.drRex}</li>
          </ul>
        </section>

        <section className="landing-menu__section">
          <h2 className="landing-menu__heading">{t.videos}</h2>
          <ul className="landing-menu__list">
            <li>
              {t.operate} <span aria-hidden>▶</span>
            </li>
          </ul>
        </section>

        <section className="landing-menu__section">
          <h2 className="landing-menu__heading">{t.collection}</h2>
        </section>
      </div>
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
  const gridCols = percentsToGrid(splitsToPercents(layout.columnSplits));

  const { t } = useLocale();

  return (
    <div
      className="min-h-dvh bg-[var(--landing-bg)] text-[var(--landing-fg)]"
      onClick={() => {
        if (editMode) onSelect(null);
      }}
    >
      <p className="landing-corner-brand" aria-hidden>
        {t.brand.toLowerCase()}
      </p>
      <div
        className="landing-kline-grid hidden min-[900px]:grid"
        style={editMode ? { gridTemplateColumns: gridCols } : undefined}
      >
        <aside className="landing-col-pad min-w-0 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          header={<Col2Menu />}
          className={`min-w-0 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden${editMode ? " border-l border-black/10" : ""}`}
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
          className={`min-w-0 overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden${editMode ? " border-l border-black/10" : ""}`}
        />
      </div>

      <div className="block min-[900px]:hidden">
        <section className={`landing-col-pad${editMode ? " border-b border-black/10" : ""}`}>
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
          header={<Col2Menu />}
          className={`relative${editMode ? " border-b border-black/10" : ""}`}
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

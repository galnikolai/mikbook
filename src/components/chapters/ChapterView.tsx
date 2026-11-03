"use client";

import Image from "next/image";
import Link from "next/link";
import {
  chapterTitle,
  getAdjacentChapter,
  getChapterContent,
  getChapterMeta,
  topicId,
} from "@/lib/chapters/content";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Props = {
  n: number;
};

export function ChapterView({ n }: Props) {
  const { locale, t } = useLocale();
  const meta = getChapterMeta(n);
  const content = getChapterContent(n);
  const prev = getAdjacentChapter(n, -1);
  const next = getAdjacentChapter(n, 1);
  const title = chapterTitle(n, locale);

  if (!meta) {
    return (
      <div className="chapter-page">
        <div className="chapter-main">
          <p className="chapter-missing">Chapitre introuvable.</p>
          <Link href="/" className="chapter-back">
            {t.brand}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-page">
      <div className="chapter-main">
        <Link href="/" className="chapter-brand">
          {t.brand}
        </Link>
        <Link href="/" className="chapter-menu-label">
          {t.menu}
        </Link>

        <div className="chapter-content">
          <div className="chapter-heading-row">
            <h1 className="chapter-title">
              ({meta.n}) {title}
            </h1>
            <nav className="chapter-nav" aria-label="Chapitres">
              {prev ? (
                <Link
                  href={`/chapters/${prev.n}`}
                  className="chapter-nav__btn"
                  aria-label={prev.title[locale]}
                >
                  <Image
                    src="/chapters/arrow-prev.svg"
                    alt=""
                    width={12}
                    height={10}
                    unoptimized
                  />
                </Link>
              ) : (
                <span className="chapter-nav__btn chapter-nav__btn--disabled" aria-hidden>
                  <Image
                    src="/chapters/arrow-prev.svg"
                    alt=""
                    width={12}
                    height={10}
                    unoptimized
                  />
                </span>
              )}
              {next ? (
                <Link
                  href={`/chapters/${next.n}`}
                  className="chapter-nav__btn"
                  aria-label={next.title[locale]}
                >
                  <Image
                    src="/chapters/arrow-next.svg"
                    alt=""
                    width={12}
                    height={10}
                    unoptimized
                  />
                </Link>
              ) : (
                <span className="chapter-nav__btn chapter-nav__btn--disabled" aria-hidden>
                  <Image
                    src="/chapters/arrow-next.svg"
                    alt=""
                    width={12}
                    height={10}
                    unoptimized
                  />
                </span>
              )}
            </nav>
          </div>

          {content ? (
            <div className="chapter-sections">
              {content.sections.map((section, si) => (
                <section
                  key={si}
                  className={
                    section.heading
                      ? "chapter-section chapter-section--sub"
                      : "chapter-section"
                  }
                >
                  {section.heading ? (
                    <h2 className="chapter-section__heading">
                      {section.heading[locale]}
                    </h2>
                  ) : null}
                  <ol className="chapter-topics">
                    {section.items.map((item, ii) => (
                      <li key={`${si}-${ii}-${item.n}`}>
                        <Link
                          href={`/chapters/${n}/${topicId(si, ii)}`}
                          className="chapter-topic"
                        >
                          <span className="chapter-topic__n">{item.n}.</span>{" "}
                          <span className="chapter-topic__title">
                            {item.title[locale]}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          ) : (
            <p className="chapter-empty">{t.chapterSoon}</p>
          )}
        </div>
      </div>

      {content?.imageSrc ? (
        <aside className="chapter-media" aria-hidden>
          <Image
            src={content.imageSrc}
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 100vw, 40vw"
            className="chapter-media__img"
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
        </aside>
      ) : (
        <aside className="chapter-media chapter-media--empty" aria-hidden />
      )}
    </div>
  );
}

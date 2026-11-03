"use client";

import Image from "next/image";
import Link from "next/link";
import {
  chapterTitle,
  getAdjacentTopic,
  getChapterContent,
  getChapterMeta,
  getTopic,
} from "@/lib/chapters/content";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ChapterMedia } from "./ChapterMedia";

type Props = {
  chapterN: number;
  topicId: string;
};

export function TopicView({ chapterN, topicId }: Props) {
  const { locale, t } = useLocale();
  const meta = getChapterMeta(chapterN);
  const content = getChapterContent(chapterN);
  const topic = getTopic(chapterN, topicId);
  const prev = getAdjacentTopic(chapterN, topicId, -1);
  const next = getAdjacentTopic(chapterN, topicId, 1);
  const title = chapterTitle(chapterN, locale);
  const imageSrcs = topic?.item.imageSrcs;
  const imageSrc =
    imageSrcs?.[0] ??
    topic?.item.imageSrc ??
    content?.topicImageSrc ??
    content?.imageSrc;
  // Real topic schemas and the chapter placeholder sheet use contain layout
  const schemaImage = Boolean(
    imageSrcs?.length || topic?.item.imageSrc || content?.topicImageSrc,
  );

  if (!meta || !topic) {
    return (
      <div className="chapter-page">
        <div className="chapter-main">
          <p className="chapter-missing">Sujet introuvable.</p>
          <Link href={`/chapters/${chapterN}`} className="chapter-back">
            {t.menu}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-page topic-page">
      <div className="chapter-main topic-main">
        <Link href="/" className="chapter-brand">
          {t.brand}
        </Link>
        <Link href={`/chapters/${chapterN}`} className="chapter-menu-label">
          {t.menu}
        </Link>

        <div className="topic-content">
          <p className="topic-chapter-label">
            ({meta.n}) {title}
          </p>
          <div className="topic-heading-row">
            <h1 className="topic-title">
              {topic.item.n}. {topic.item.title[locale]}
            </h1>
            <nav className="chapter-nav" aria-label="Sujets">
              {prev ? (
                <Link
                  href={`/chapters/${chapterN}/${prev.id}`}
                  className="chapter-nav__btn"
                  aria-label={prev.item.title[locale]}
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
                  href={`/chapters/${chapterN}/${next.id}`}
                  className="chapter-nav__btn"
                  aria-label={next.item.title[locale]}
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
        </div>
      </div>

      {imageSrcs?.length || imageSrc ? (
        <ChapterMedia
          src={imageSrc}
          srcs={imageSrcs}
          schema={schemaImage}
        />
      ) : (
        <aside className="chapter-media chapter-media--empty" aria-hidden />
      )}
    </div>
  );
}

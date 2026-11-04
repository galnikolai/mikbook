import { Suspense } from "react";
import { notFound } from "next/navigation";
import { TopicView } from "@/components/chapters/TopicView";
import {
  flattenTopics,
  getChapterContent,
  getTopic,
} from "@/lib/chapters/content";
import { CHAPTERS } from "@/lib/i18n/dictionary";

type Props = {
  params: Promise<{ n: string; topic: string }>;
};

export function generateStaticParams() {
  return CHAPTERS.flatMap((ch) => {
    if (!getChapterContent(ch.n)) return [];
    return flattenTopics(ch.n).map((t) => ({
      n: String(ch.n),
      topic: t.id,
    }));
  });
}

async function TopicPageInner({ params }: Props) {
  const { n: rawN, topic: topicId } = await params;
  const n = Number.parseInt(rawN, 10);
  if (!Number.isFinite(n) || !CHAPTERS.some((ch) => ch.n === n)) {
    notFound();
  }
  if (!getTopic(n, topicId)) {
    notFound();
  }

  return <TopicView chapterN={n} topicId={topicId} />;
}

export default function TopicPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="chapter-page">
          <p className="chapter-empty" style={{ padding: "2rem 16px" }}>
            …
          </p>
        </div>
      }
    >
      <TopicPageInner params={params} />
    </Suspense>
  );
}

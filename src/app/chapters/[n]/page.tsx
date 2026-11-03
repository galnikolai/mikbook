import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChapterView } from "@/components/chapters/ChapterView";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { CHAPTERS } from "@/lib/i18n/dictionary";

type Props = {
  params: Promise<{ n: string }>;
};

export function generateStaticParams() {
  return CHAPTERS.map((ch) => ({ n: String(ch.n) }));
}

async function ChapterPageInner({ params }: Props) {
  const { n: raw } = await params;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || !CHAPTERS.some((ch) => ch.n === n)) {
    notFound();
  }

  return <ChapterView n={n} />;
}

export default function ChapterPage({ params }: Props) {
  return (
    <LocaleProvider>
      <Suspense
        fallback={
          <div className="chapter-page">
            <p className="chapter-empty" style={{ padding: "2rem 16px" }}>
              …
            </p>
          </div>
        }
      >
        <ChapterPageInner params={params} />
      </Suspense>
    </LocaleProvider>
  );
}

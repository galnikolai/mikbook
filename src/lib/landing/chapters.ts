import { CHAPTERS as I18N_CHAPTERS } from "@/lib/i18n/dictionary";

export type Chapter = {
  n: number;
  code: string;
  title: string;
};

/** MIKBOOK — 24 chapitres EDN (libellés FR par défaut) */
export const CHAPTERS: Chapter[] = I18N_CHAPTERS.map((ch) => ({
  n: ch.n,
  code: ch.code,
  title: ch.title.fr,
}));

import { CHAPTERS } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/dictionary";

export type TopicItem = {
  n: number;
  title: { fr: string; en: string };
  /** Optional topic-only illustration (overrides chapter topicImageSrc) */
  imageSrc?: string;
};

export type TopicSection = {
  heading?: { fr: string; en: string };
  items: TopicItem[];
};

export type ChapterContent = {
  n: number;
  imageSrc?: string;
  /** Image for topic-detail screens within the chapter */
  topicImageSrc?: string;
  sections: TopicSection[];
};

export type FlatTopic = {
  id: string;
  sectionIndex: number;
  itemIndex: number;
  item: TopicItem;
};

const PEDIATRIE: ChapterContent = {
  n: 15,
  imageSrc: "/chapters/pediatrie.png",
  topicImageSrc: "/chapters/pediatrie-topic.png",
  sections: [
    {
      items: [
        { n: 1, title: { fr: "Ictère néonatal", en: "Neonatal jaundice" } },
        {
          n: 2,
          title: {
            fr: "Détresse respiratoire aiguë néonatale",
            en: "Neonatal acute respiratory distress",
          },
        },
        {
          n: 3,
          title: {
            fr: "Souffle cardiaque chez l'enfant",
            en: "Heart murmur in children",
          },
        },
        {
          n: 3,
          title: {
            fr: "Broncho-alvéolite du nourrisson",
            en: "Infant bronchiolitis",
          },
        },
        { n: 4, title: { fr: "Asthme de l'enfant", en: "Childhood asthma" } },
        {
          n: 5,
          title: {
            fr: "Toux chronique de l'enfant",
            en: "Chronic cough in children",
          },
        },
        {
          n: 6,
          title: {
            fr: "Infections broncho-pulmonaires",
            en: "Bronchopulmonary infections",
          },
        },
        { n: 7, title: { fr: "Coqueluche", en: "Whooping cough" } },
        {
          n: 8,
          title: {
            fr: "Reflux gastro-oesophagien de l'enfant",
            en: "Pediatric gastroesophageal reflux",
          },
        },
        {
          n: 9,
          title: {
            fr: "Vomissements du nourrisson",
            en: "Infant vomiting",
          },
        },
        {
          n: 10,
          title: {
            fr: "Invagination intestinale aiguë du nourrisson",
            en: "Infant intussusception",
          },
        },
        {
          n: 11,
          title: {
            fr: "Sténose hypertrophique du pylore",
            en: "Hypertrophic pyloric stenosis",
          },
        },
        {
          n: 12,
          title: {
            fr: "Constipation de l'enfant",
            en: "Constipation in children",
          },
        },
        {
          n: 13,
          title: {
            fr: "Diarrhée aiguë chez l'enfant",
            en: "Acute diarrhea in children",
          },
        },
        {
          n: 14,
          title: {
            fr: "Déshydratation aiguë du nourrisson",
            en: "Acute dehydration in infants",
          },
        },
        {
          n: 15,
          title: {
            fr: "Convulsions du nourrisson",
            en: "Infant seizures",
          },
          imageSrc: "/chapters/schema-agitation.png",
        },
        {
          n: 16,
          title: {
            fr: "Malaise grave et mort inattendue (subite) du nourrisson",
            en: "ALTE and sudden unexpected infant death",
          },
        },
        {
          n: 17,
          title: {
            fr: "Fièvre aiguë de l'enfant - Gravité d'un syndrome infectieux",
            en: "Acute fever in children — severity of infection",
          },
        },
        {
          n: 18,
          title: {
            fr: "Infections urinaires de l'enfant",
            en: "Urinary tract infections in children",
          },
        },
        {
          n: 19,
          title: { fr: "Purpura de l'enfant", en: "Purpura in children" },
        },
        { n: 20, title: { fr: "Purpura rhumatoïde", en: "Henoch–Schönlein purpura" } },
        {
          n: 21,
          title: {
            fr: "Purpura thrombopénique idiopathique de l'enfant",
            en: "Idiopathic thrombocytopenic purpura in children",
          },
        },
        {
          n: 22,
          title: {
            fr: "Syndrome hémolytique et urémique",
            en: "Hemolytic uremic syndrome",
          },
        },
        {
          n: 23,
          title: {
            fr: "Syndrome néphrotique idiopathique de l'enfant (néphrose lipoïdique)",
            en: "Idiopathic nephrotic syndrome in children",
          },
        },
        {
          n: 24,
          title: { fr: "Cancers de l'enfant", en: "Childhood cancers" },
        },
        {
          n: 25,
          title: { fr: "Boiterie de l'enfant", en: "Limping in children" },
        },
      ],
    },
    {
      heading: {
        fr: "Croissance et développement",
        en: "Growth and development",
      },
      items: [
        {
          n: 1,
          title: {
            fr: "Alimentation et besoins nutritionnels du nourrisson et de l'enfant",
            en: "Infant and child nutrition and requirements",
          },
        },
        {
          n: 2,
          title: {
            fr: "Allergie aux protéines de lait de vache",
            en: "Cow's milk protein allergy",
          },
        },
        {
          n: 3,
          title: {
            fr: "Evaluation et soins du nouveau-né à terme",
            en: "Assessment and care of the term newborn",
          },
        },
        {
          n: 4,
          title: {
            fr: "Suivi d'un nourrisson, d'un enfant et d'un adolescent normaux",
            en: "Follow-up of a healthy infant, child and adolescent",
          },
        },
        { n: 5, title: { fr: "Vaccinations", en: "Vaccinations" } },
        {
          n: 6,
          title: {
            fr: "Développement psychomoteur du nourrisson et de l'enfant",
            en: "Psychomotor development of infants and children",
          },
        },
        {
          n: 7,
          title: {
            fr: "Troubles de la miction chez l'enfant",
            en: "Voiding disorders in children",
          },
        },
        {
          n: 8,
          title: {
            fr: "Développement bucco-dentaire et anomalies",
            en: "Oral and dental development and anomalies",
          },
        },
        {
          n: 9,
          title: {
            fr: "Retard de croissance staturo-pondérale",
            en: "Growth failure",
          },
        },
        { n: 10, title: { fr: "Rachitisme", en: "Rickets" } },
        {
          n: 11,
          title: { fr: "Syndrome de Turner", en: "Turner syndrome" },
        },
        {
          n: 12,
          title: {
            fr: "Puberté normale et pathologique",
            en: "Normal and pathological puberty",
          },
        },
        {
          n: 13,
          title: {
            fr: "Troubles du comportement de l'adolescent et de l'enfant",
            en: "Behavioral disorders in children and adolescents",
          },
        },
        {
          n: 14,
          title: {
            fr: "Maltraitance et enfants en danger - PMI",
            en: "Child abuse and children at risk — maternal and child protection",
          },
        },
      ],
    },
  ],
};

const BY_N: Record<number, ChapterContent> = {
  [PEDIATRIE.n]: PEDIATRIE,
};

export function getChapterMeta(n: number) {
  return CHAPTERS.find((ch) => ch.n === n) ?? null;
}

export function getChapterContent(n: number): ChapterContent | null {
  return BY_N[n] ?? null;
}

export function getAdjacentChapter(n: number, dir: -1 | 1) {
  const idx = CHAPTERS.findIndex((ch) => ch.n === n);
  if (idx < 0) return null;
  const next = CHAPTERS[idx + dir];
  return next ?? null;
}

export function chapterTitle(n: number, locale: Locale) {
  return getChapterMeta(n)?.title[locale] ?? "";
}

export function topicId(sectionIndex: number, itemIndex: number) {
  return `${sectionIndex}-${itemIndex}`;
}

export function flattenTopics(n: number): FlatTopic[] {
  const content = getChapterContent(n);
  if (!content) return [];
  return content.sections.flatMap((section, sectionIndex) =>
    section.items.map((item, itemIndex) => ({
      id: topicId(sectionIndex, itemIndex),
      sectionIndex,
      itemIndex,
      item,
    })),
  );
}

export function getTopic(n: number, id: string): FlatTopic | null {
  return flattenTopics(n).find((t) => t.id === id) ?? null;
}

export function getAdjacentTopic(n: number, id: string, dir: -1 | 1) {
  const list = flattenTopics(n);
  const idx = list.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  return list[idx + dir] ?? null;
}

export type Chapter = {
  n: number;
  code: string;
  title: string;
};

/** MIKBOOK — 24 chapitres EDN */
export const CHAPTERS: Chapter[] = [
  { n: 1, code: "OPH", title: "Ophtalmologie" },
  { n: 2, code: "ORL", title: "ORL — Stomatologie" },
  { n: 3, code: "NEU", title: "Neurologie" },
  { n: 4, code: "PSY", title: "Psychiatrie" },
  { n: 5, code: "CAR", title: "Cardiologie" },
  { n: 6, code: "PNE", title: "Pneumologie" },
  { n: 7, code: "HGE", title: "Hépato-gastro-entérologie" },
  { n: 8, code: "URO", title: "Urologie" },
  { n: 9, code: "NEP", title: "Néphrologie" },
  { n: 10, code: "GYN", title: "Gynécologie — Obstétrique" },
  { n: 11, code: "ORT", title: "Orthopédie" },
  { n: 12, code: "RHU", title: "Rhumatologie" },
  { n: 13, code: "END", title: "Endocrinologie — Diabétologie" },
  { n: 14, code: "HEM", title: "Hématologie" },
  { n: 15, code: "PED", title: "Pédiatrie" },
  { n: 16, code: "DER", title: "Dermatologie" },
  { n: 17, code: "INF", title: "Maladies infectieuses" },
  { n: 18, code: "CAN", title: "Cancérologie" },
  { n: 19, code: "GER", title: "Gériatrie — Douleur — Soins palliatifs" },
  { n: 20, code: "TOX", title: "Réanimation — Toxiques" },
  { n: 21, code: "SAN", title: "Santé publique — Médecine légale" },
  { n: 22, code: "THE", title: "Thérapeutique" },
  { n: 23, code: "NUT", title: "Nutrition — Métabolisme" },
  { n: 24, code: "EPI", title: "Épilogue" },
];

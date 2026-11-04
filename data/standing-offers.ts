import type { StandingOfferGroup } from "@/lib/menu-types";

/**
 * Standing offers exactly as listed on the legacy homepage (CONTENT_INVENTORY.md §2), grouped
 * by when and how they are served. The source names categories only, without items or prices.
 *
 * Used ONLY while Sanity is not configured and as the initial CMS import; afterwards the
 * "Speisen & Getränke" document in Sanity is the source of truth.
 * Not included: "Festlichkeiten bis 30 Personen" (older poster only, awaiting owner confirmation).
 */
export const standingOfferGroupsFixture: StandingOfferGroup[] = [
  {
    title: "Am Morgen und zu Mittag",
    offers: [
      { title: "Frühstück", detail: "nach Angebot", when: "ab 08:00 Uhr" },
      { title: "Mittagstisch", detail: "Speisen im wöchentlichen Wechsel", when: "11:30 – 14:00 Uhr" },
    ],
  },
  {
    title: "Kaffee und Kuchen",
    offers: [
      { title: "Kaffee und Tee", detail: "verschiedene Kaffee- und Teesorten" },
      { title: "Hausgebackener Kuchen", detail: "aus eigener Herstellung" },
    ],
  },
  {
    title: "Auf Bestellung",
    offers: [
      { title: "Kuchenplatten und Canapés", detail: "auf Bestellung" },
      { title: "Zum Mitnehmen", detail: "auch zum Abholen nach Vorbestellung" },
    ],
  },
];

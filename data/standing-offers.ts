import { cafe } from "@/lib/cafe";
import type { StandingOffer, StandingOfferGroup } from "@/lib/menu-types";

/**
 * Standing offers exactly as listed on the legacy homepage (see CONTENT_INVENTORY.md §2).
 * The source names categories only, without individual items or prices, so nothing more
 * detailed is shown. Becomes Sanity-managed in Milestone 3 if the café supplies item lists.
 *
 * Not included here: "Festlichkeiten bis 30 Personen" (older poster only, awaiting owner confirmation).
 */
const breakfast: StandingOffer = { title: "Frühstück", detail: "nach Angebot", when: `ab ${cafe.breakfastFrom} Uhr` };
const coffeeTea: StandingOffer = { title: "Kaffee und Tee", detail: "verschiedene Kaffee- und Teesorten" };
const lunch: StandingOffer = {
  title: "Mittagstisch",
  detail: "Speisen im wöchentlichen Wechsel",
  when: `${cafe.lunch.from} – ${cafe.lunch.to} Uhr`,
};
const cake: StandingOffer = { title: "Hausgebackener Kuchen", detail: "aus eigener Herstellung" };
const platters: StandingOffer = { title: "Kuchenplatten und Canapés", detail: "auf Bestellung" };
const takeaway: StandingOffer = { title: "Zum Mitnehmen", detail: "auch zum Abholen nach Vorbestellung" };

/** Flat list in the order of the legacy homepage. */
export const standingOffers: StandingOffer[] = [breakfast, coffeeTea, lunch, cake, platters, takeaway];

/** The same offers grouped by when and how they are served (Speisekarte page). */
export const standingOfferGroups: StandingOfferGroup[] = [
  { title: "Am Morgen und zu Mittag", offers: [breakfast, lunch] },
  { title: "Kaffee und Kuchen", offers: [coffeeTea, cake] },
  { title: "Auf Bestellung", offers: [platters, takeaway] },
];

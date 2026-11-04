import type { WeeklyMenu } from "@/lib/menu-types";

/**
 * Development fixture ONLY: used while Sanity is not configured. Never imported into the CMS
 * and never used as a fallback when Sanity is connected (see lib/content.ts).
 * The selection logic in `lib/weekly-menu.ts` decides what is current, upcoming or expired,
 * so this week disappears from the site automatically after its end date.
 *
 * 2026-11-02 week transcribed verbatim from
 * https://www.cafeamlindenplatzzeitz.de/index.php/speisekarte on 2026-11-04. The legacy table has
 * no weekday labels except "Mittwoch: Geschlossen!" in row 3; dates are mapped from row order.
 */
export const weeklyMenusFixture: WeeklyMenu[] = [
  {
    validFrom: "2026-11-02",
    validTo: "2026-11-06",
    source: "legacy website, retrieved 2026-11-04",
    days: [
      { date: "2026-11-02", dishes: [{ name: "Weiße Bohnen Eintopf, Dessert", priceEur: 6.2 }] },
      { date: "2026-11-03", dishes: [{ name: "Sülze, Bratkartoffeln, Beilage", priceEur: 10.9 }] },
      { date: "2026-11-04", closed: true, dishes: [] },
      { date: "2026-11-05", dishes: [{ name: "Spaghetti Bolognese, Dessert", priceEur: 10.9 }] },
      { date: "2026-11-06", dishes: [{ name: "Geschnetzeltes nach Gyros Art, Reis, Beilage", priceEur: 13.9 }] },
    ],
    notes: [
      "Änderungen vorbehalten.",
      "Speisen auch zum Mitnehmen sowie auf Vorbestellung.",
      "Bei Fragen zu Allergenen und Zusatzstoffen wenden Sie sich bitte an unser Personal.",
    ],
  },
];

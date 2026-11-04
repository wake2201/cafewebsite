/**
 * Weekly lunch menu ("Speisekarteplan").
 *
 * Transcribed verbatim from https://www.cafeamlindenplatzzeitz.de/index.php/speisekarte
 * on 2026-11-04. The legacy table lists dishes in row order without weekday labels,
 * except "Mittwoch: Geschlossen!" in the third row; weekdays below are mapped from that
 * order (Mo, Di, Mi closed, Do, Fr). Confirm with the café.
 *
 * This static plan is replaced by Sanity data in Milestone 3. The validity window is
 * enforced at render time so an outdated week is never presented as current.
 */

export type WeeklyMenuDay = {
  date: string; // ISO yyyy-mm-dd
  weekday: string;
  closed?: boolean;
  dishes: { name: string; priceEur: number }[];
};

export type WeeklyMenu = {
  validFrom: string; // ISO date, inclusive
  validTo: string; // ISO date, inclusive
  days: WeeklyMenuDay[];
  notes: string[];
};

export const weeklyMenu: WeeklyMenu = {
  validFrom: "2026-11-02",
  validTo: "2026-11-06",
  days: [
    { date: "2026-11-02", weekday: "Montag", dishes: [{ name: "Weiße Bohnen Eintopf, Dessert", priceEur: 6.2 }] },
    { date: "2026-11-03", weekday: "Dienstag", dishes: [{ name: "Sülze, Bratkartoffeln, Beilage", priceEur: 10.9 }] },
    { date: "2026-11-04", weekday: "Mittwoch", closed: true, dishes: [] },
    { date: "2026-11-05", weekday: "Donnerstag", dishes: [{ name: "Spaghetti Bolognese, Dessert", priceEur: 10.9 }] },
    {
      date: "2026-11-06",
      weekday: "Freitag",
      dishes: [{ name: "Geschnetzeltes nach Gyros Art, Reis, Beilage", priceEur: 13.9 }],
    },
  ],
  notes: [
    "Änderungen vorbehalten.",
    "Speisen auch zum Mitnehmen sowie auf Vorbestellung.",
    "Bei Fragen zu Allergenen und Zusatzstoffen wenden Sie sich bitte an unser Personal.",
  ],
};

/** Returns the menu only while `isoDate` lies inside its validity window. */
export function getActiveWeeklyMenu(isoDate: string): WeeklyMenu | null {
  return isoDate >= weeklyMenu.validFrom && isoDate <= weeklyMenu.validTo ? weeklyMenu : null;
}

const priceFormat = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
export const formatPrice = (eur: number) => priceFormat.format(eur);

const dayMonth = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", timeZone: "UTC" });
const dayMonthYear = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2. bis 6. November 2026" */
export function formatRange(fromIso: string, toIso: string): string {
  return `${dayMonth.format(new Date(fromIso))} bis ${dayMonthYear.format(new Date(toIso))}`;
}

/** "2.11." */
export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}.${Number(m)}.`;
}

/**
 * Operational business facts for Café am Lindenplatz.
 *
 * Source: legacy website https://www.cafeamlindenplatzzeitz.de/ (homepage, Kontakt,
 * Impressum), retrieved 2026-11-04. See CONTENT_INVENTORY.md for provenance and the
 * items that still need confirmation by the café before go-live.
 *
 * Milestone 3 moves hours and contact details into Sanity; until then this file is the
 * single source of truth so header, footer, homepage and stub pages stay consistent.
 */

export const cafe = {
  name: "Café am Lindenplatz",
  owner: "Kerstin Leithold",
  address: {
    street: "Röntgenstraße 1",
    postalCode: "06712",
    city: "Zeitz",
    region: "Sachsen-Anhalt",
  },
  phone: {
    display: "03441 2 79 77 78",
    href: "tel:+4934412797778",
  },
  // External link only (no embedded map). Query by address, no personal data.
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=R%C3%B6ntgenstra%C3%9Fe+1%2C+06712+Zeitz",
  breakfastFrom: "08:00",
  lunch: { from: "11:30", to: "14:00" },
  maxPartySize: 30,
} as const;

/** 0 = Sunday … 6 = Saturday (matches Date#getDay). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DayHours = { open: string; close: string } | null;

export const weekdayNames: Record<Weekday, string> = {
  0: "Sonntag",
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
};

export const openingHours: Record<Weekday, DayHours> = {
  1: { open: "08:00", close: "17:00" },
  2: { open: "08:00", close: "17:00" },
  3: null, // Ruhetag
  4: { open: "08:00", close: "17:00" },
  5: { open: "08:00", close: "17:00" },
  6: { open: "14:00", close: "17:00" },
  0: { open: "14:00", close: "17:00" },
};

/** Compact rows for display, in the same grouping the café uses on its own poster. */
export const openingHoursSummary = [
  { days: "Montag, Dienstag", hours: "08:00 – 17:00 Uhr" },
  { days: "Mittwoch", hours: "Ruhetag" },
  { days: "Donnerstag, Freitag", hours: "08:00 – 17:00 Uhr" },
  { days: "Samstag, Sonntag", hours: "14:00 – 17:00 Uhr" },
] as const;

/** Calendar date and weekday in the café's own time zone. */
export function berlinToday(now: Date = new Date()): { isoDate: string; weekday: Weekday } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    isoDate: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: weekdayIndex as Weekday,
  };
}

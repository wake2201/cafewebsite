import type { Weekday } from "./site-types";

/**
 * Fixed identity facts that stay in code (not CMS-editable): the café's name, the owner
 * named in the logo and Impressum, and the unconfirmed party size from an older poster.
 * Editable business data (contact details, hours, menus, offers) comes from `lib/content.ts`.
 * Provenance: legacy website, retrieved 2026-11-04 (CONTENT_INVENTORY.md).
 */
export const cafe = {
  name: "Café am Lindenplatz",
  owner: "Kerstin Leithold", // non-breaking space keeps the name on one line
  /** From an older poster only; awaiting owner confirmation (CONTENT_INVENTORY.md §6). */
  maxPartySize: 30,
} as const;

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

/** "03441 2 79 77 78" → "tel:+4934412797778" (German numbers; keeps an existing +country code). */
export function toTelHref(display: string): string {
  const compact = display.replace(/[^\d+]/g, "");
  if (compact.startsWith("+")) return `tel:${compact}`;
  if (compact.startsWith("00")) return `tel:+${compact.slice(2)}`;
  if (compact.startsWith("0")) return `tel:+49${compact.slice(1)}`;
  return `tel:${compact}`;
}

/** External directions link by address only (no embed, no personal data). */
export function directionsUrl(address: { street: string; postalCode: string; city: string }): string {
  const query = `${address.street}, ${address.postalCode} ${address.city}`.replace(/ /g, " ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

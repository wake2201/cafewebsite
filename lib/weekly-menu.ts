import type { WeeklyMenu, WeeklyMenuSelection } from "./menu-types";

/**
 * Chooses what to show for `isoDate` (Europe/Berlin calendar date):
 * - "current": a menu whose validity window contains the date,
 * - "upcoming": otherwise the earliest menu that starts later (shown as a preview, never as current),
 * - "none": nothing valid; `lastValidTo` names the most recent expired week for context.
 * Expired menus are never returned.
 */
export function selectWeeklyMenu(menus: WeeklyMenu[], isoDate: string): WeeklyMenuSelection {
  const current = menus.find((m) => m.validFrom <= isoDate && isoDate <= m.validTo);
  if (current) return { status: "current", menu: current };

  const upcoming = menus
    .filter((m) => m.validFrom > isoDate)
    .sort((a, b) => a.validFrom.localeCompare(b.validFrom))[0];
  if (upcoming) return { status: "upcoming", menu: upcoming };

  const lastValidTo = menus
    .filter((m) => m.validTo < isoDate)
    .map((m) => m.validTo)
    .sort()
    .at(-1);
  return { status: "none", lastValidTo };
}

/** The current menu for `isoDate`, or null. */
export function getActiveWeeklyMenu(menus: WeeklyMenu[], isoDate: string): WeeklyMenu | null {
  const selection = selectWeeklyMenu(menus, isoDate);
  return selection.status === "current" ? selection.menu : null;
}

const priceFormat = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
export const formatPrice = (eur: number) => priceFormat.format(eur);

const utcDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const weekdayFormat = new Intl.DateTimeFormat("de-DE", { weekday: "long", timeZone: "UTC" });
const dayMonth = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", timeZone: "UTC" });
const dayMonthYear = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "Montag" */
export const formatWeekday = (iso: string) => weekdayFormat.format(utcDate(iso));

/** "2. November" */
export const formatDayMonth = (iso: string) => dayMonth.format(utcDate(iso));

/** "2. bis 6. November 2026" style range (month repeated, as the source dates may span months). */
export function formatRange(fromIso: string, toIso: string): string {
  return `${dayMonth.format(utcDate(fromIso))} bis ${dayMonthYear.format(utcDate(toIso))}`;
}

/** "2.11." */
export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}.${Number(m)}.`;
}

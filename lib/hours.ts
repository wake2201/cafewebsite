import type { HoursException, OpeningHoursData, TimeRange, Weekday } from "./site-types";

/**
 * Pure opening-hours logic. Dates are ISO strings (yyyy-mm-dd) that already represent the
 * Europe/Berlin calendar day (see `berlinToday()`), so no time-zone math happens here.
 */

export const weekdayNames: Record<Weekday, string> = {
  0: "Sonntag",
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
};

/** Monday-first order used for display. */
export const weekdayOrder: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

export function weekdayOf(iso: string): Weekday {
  return utc(iso).getUTCDay() as Weekday;
}

export function addDays(iso: string, days: number): string {
  const d = utc(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The exception covering `iso`, if any. Later entries win when several overlap. */
export function exceptionFor(data: OpeningHoursData, iso: string): HoursException | undefined {
  let match: HoursException | undefined;
  for (const ex of data.exceptions) {
    if (ex.from <= iso && iso <= (ex.to || ex.from)) match = ex;
  }
  return match;
}

/** Effective hours for a calendar day: exception first, then the regular weekday pattern. */
export function hoursForDate(
  data: OpeningHoursData,
  iso: string,
): { hours: TimeRange | null; exception?: HoursException } {
  const exception = exceptionFor(data, iso);
  if (exception) {
    return { hours: exception.closed ? null : (exception.hours ?? null), exception };
  }
  return { hours: data.regular[weekdayOf(iso)] };
}

/** First day after `iso` (within `horizon` days) on which the café opens, honouring exceptions. */
export function nextOpening(
  data: OpeningHoursData,
  iso: string,
  horizon = 60,
): { date: string; weekday: Weekday; hours: TimeRange } | null {
  for (let step = 1; step <= horizon; step++) {
    const date = addDays(iso, step);
    const { hours } = hoursForDate(data, date);
    if (hours) return { date, weekday: weekdayOf(date), hours };
  }
  return null;
}

export const formatRange = (range: TimeRange) => `${range.open} – ${range.close} Uhr`;

/**
 * Groups the regular week into rows of consecutive weekdays with identical hours,
 * e.g. "Montag, Dienstag" / "Mittwoch: Ruhetag" / "Samstag, Sonntag".
 */
export function summarizeRegular(
  data: OpeningHoursData,
): { days: string; weekdays: Weekday[]; hours: string }[] {
  const key = (w: Weekday) => {
    const h = data.regular[w];
    return h ? `${h.open}-${h.close}` : "closed";
  };
  const rows: { weekdays: Weekday[]; key: string }[] = [];
  for (const w of weekdayOrder) {
    const last = rows.at(-1);
    if (last && last.key === key(w)) last.weekdays.push(w);
    else rows.push({ weekdays: [w], key: key(w) });
  }
  return rows.map(({ weekdays }) => {
    const names = weekdays.map((w) => weekdayNames[w]);
    const days = names.length <= 2 ? names.join(", ") : `${names[0]} bis ${names.at(-1)}`;
    const h = data.regular[weekdays[0]];
    return { days, weekdays, hours: h ? formatRange(h) : "Ruhetag" };
  });
}

/** Exceptions that touch the window [iso, iso + days], sorted by start date. */
export function upcomingExceptions(data: OpeningHoursData, iso: string, days = 21): HoursException[] {
  const end = addDays(iso, days);
  return data.exceptions
    .filter((ex) => (ex.to || ex.from) >= iso && ex.from <= end)
    .sort((a, b) => a.from.localeCompare(b.from));
}

/** The business notice if it is active on `iso`. */
export function activeNotice(data: OpeningHoursData, iso: string): string | null {
  const n = data.notice;
  if (!n?.text?.trim()) return null;
  if (n.from && iso < n.from) return null;
  if (n.until && iso > n.until) return null;
  return n.text.trim();
}

const shortDate = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "numeric",
  month: "numeric",
  timeZone: "UTC",
});

/** "Do., 24.12." */
export const formatShortWeekdayDate = (iso: string) => shortDate.format(utc(iso));

/** "Do., 24.12." or "Do., 24.12. bis Sa., 26.12." */
export function formatExceptionDates(ex: HoursException): string {
  const to = ex.to || ex.from;
  return to === ex.from
    ? formatShortWeekdayDate(ex.from)
    : `${formatShortWeekdayDate(ex.from)} bis ${formatShortWeekdayDate(to)}`;
}

/** "geschlossen" or "10:00 – 14:00 Uhr" */
export function describeException(ex: HoursException): string {
  if (ex.closed || !ex.hours) return "geschlossen";
  return formatRange(ex.hours);
}

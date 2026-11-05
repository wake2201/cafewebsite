/**
 * Pure validation helpers shared by the Sanity schemas (and unit-tested in tests/).
 * Each returns `true` when valid or a German message for the editor.
 */

export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateTime(value: string | undefined, required: boolean): true | string {
  if (!value) return required ? "Bitte eine Uhrzeit eintragen, z. B. 08:00." : true;
  return TIME_PATTERN.test(value) ? true : "Bitte im Format HH:MM eintragen, z. B. 08:00 oder 17:30.";
}

export function validateTimeRange(range: { closed?: boolean; open?: string; close?: string } | undefined): true | string {
  if (!range || range.closed) return true;
  const open = validateTime(range.open, true);
  if (open !== true) return `Öffnet um: ${open}`;
  const close = validateTime(range.close, true);
  if (close !== true) return `Schließt um: ${close}`;
  return range.open! < range.close! ? true : "Die Schließzeit muss nach der Öffnungszeit liegen.";
}

export function validateDateOrder(from: string | undefined, to: string | undefined): true | string {
  if (!from || !to) return true;
  return to >= from ? true : "Das Enddatum darf nicht vor dem Anfangsdatum liegen.";
}

type MenuDayInput = { date?: string; closed?: boolean; dishes?: { name?: string }[] };

/** Days must lie inside the menu's date range and each date may appear only once. */
export function validateMenuDays(
  days: MenuDayInput[] | undefined,
  validFrom: string | undefined,
  validTo: string | undefined,
): true | string {
  if (!days || days.length === 0) return "Bitte mindestens einen Tag eintragen.";
  const seen = new Set<string>();
  for (const day of days) {
    if (!day.date) continue; // the day's own required rule reports this
    if (seen.has(day.date)) return `Der Tag ${formatGermanDate(day.date)} ist doppelt eingetragen.`;
    seen.add(day.date);
    if (validFrom && day.date < validFrom) {
      return `Der Tag ${formatGermanDate(day.date)} liegt vor dem Beginn der Wochenkarte.`;
    }
    if (validTo && day.date > validTo) {
      return `Der Tag ${formatGermanDate(day.date)} liegt nach dem Ende der Wochenkarte.`;
    }
  }
  return true;
}

/** Prices: 0 to 999 €, at most two decimal places. Empty is allowed (no price shown). */
export function validatePrice(value: number | undefined): true | string {
  if (value === undefined || value === null) return true;
  if (value < 0) return "Der Preis darf nicht negativ sein.";
  if (value > 999) return "Bitte den Preis prüfen (über 999 €).";
  // Tolerance absorbs binary floating-point noise (e.g. 10.9 * 100 = 1090.0000000000002).
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-6
    ? true
    : "Bitte höchstens zwei Nachkommastellen eingeben, z. B. 10.90.";
}

/**
 * Warning (not an error) when a weekly menu runs longer than one calendar week. A "Gültig bis" that
 * reaches into the next Monday is a likely typo, and because published weeks may not overlap it would
 * block publishing the following week's menu.
 */
export function validateMenuSpan(validFrom: string | undefined, validTo: string | undefined): true | string {
  if (!validFrom || !validTo || validTo < validFrom) return true;
  const days = (Date.parse(`${validTo}T00:00:00Z`) - Date.parse(`${validFrom}T00:00:00Z`)) / 86_400_000;
  return days <= 6
    ? true
    : `Diese Karte gilt ${days + 1} Tage (bis ${formatGermanDate(validTo)}). Bitte prüfen, ob das Enddatum stimmt: Eine Karte, die in die nächste Woche reicht, verhindert das Veröffentlichen der nächsten Wochenkarte.`;
}

/** True when the two inclusive ISO date ranges share at least one day. */
export function rangesOverlap(aFrom: string, aTo: string, bFrom: string, bTo: string): boolean {
  return aFrom <= bTo && bFrom <= aTo;
}

export function formatGermanDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(d)}.${Number(m)}.${y}`;
}

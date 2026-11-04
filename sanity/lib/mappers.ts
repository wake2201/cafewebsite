/**
 * Pure mapping from Sanity query results to the website's content types.
 * Tolerant of missing optional fields; never invents values.
 */
import { directionsUrl, toTelHref } from "../../lib/cafe";
import type { StandingOfferGroup, WeeklyMenu } from "../../lib/menu-types";
import type { ContactInfo, OpeningHoursData, RegularHours, TimeRange, Weekday } from "../../lib/site-types";

type DayDoc = { closed?: boolean; open?: string; close?: string } | null | undefined;

export type WeeklyMenuDoc = {
  validFrom?: string;
  validTo?: string;
  notes?: (string | null)[] | null;
  days?: {
    date?: string;
    closed?: boolean;
    note?: string;
    dishes?: { name?: string; description?: string; price?: number }[] | null;
  }[] | null;
};

export type OpeningHoursDoc = {
  monday?: DayDoc;
  tuesday?: DayDoc;
  wednesday?: DayDoc;
  thursday?: DayDoc;
  friday?: DayDoc;
  saturday?: DayDoc;
  sunday?: DayDoc;
  breakfastFrom?: string;
  lunchFrom?: string;
  lunchTo?: string;
  exceptions?: { from?: string; to?: string; closed?: boolean; open?: string; close?: string; reason?: string }[] | null;
  notice?: { text?: string; showFrom?: string; showUntil?: string } | null;
};

export type StandingOffersDoc = {
  groups?: {
    title?: string;
    items?: { title?: string; detail?: string; when?: string; price?: number; visible?: boolean }[] | null;
  }[] | null;
};

export type ContactInfoDoc = {
  phone?: string;
  email?: string;
  street?: string;
  postalCode?: string;
  city?: string;
};

const clean = (s: string | undefined | null) => (typeof s === "string" && s.trim() ? s.trim() : undefined);

export function mapWeeklyMenus(docs: WeeklyMenuDoc[] | null | undefined): WeeklyMenu[] {
  return (docs ?? [])
    .filter((d): d is WeeklyMenuDoc & { validFrom: string; validTo: string } => Boolean(d.validFrom && d.validTo))
    .map((d) => ({
      validFrom: d.validFrom,
      validTo: d.validTo,
      notes: (d.notes ?? []).map(clean).filter((n): n is string => Boolean(n)),
      days: (d.days ?? [])
        .filter((day): day is NonNullable<typeof day> & { date: string } => Boolean(day?.date))
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((day) => ({
          date: day.date,
          closed: Boolean(day.closed),
          note: clean(day.note),
          dishes: day.closed
            ? []
            : (day.dishes ?? [])
                .filter((dish) => clean(dish?.name))
                .map((dish) => ({
                  name: clean(dish.name)!,
                  description: clean(dish.description),
                  priceEur: typeof dish.price === "number" ? dish.price : undefined,
                })),
        })),
    }));
}

const range = (open?: string, close?: string): TimeRange | null =>
  open && close ? { open, close } : null;

const dayRange = (day: DayDoc): TimeRange | null => (!day || day.closed ? null : range(day.open, day.close));

export function mapOpeningHours(doc: OpeningHoursDoc | null | undefined): OpeningHoursData | null {
  if (!doc) return null;
  const regular: RegularHours = {
    1: dayRange(doc.monday),
    2: dayRange(doc.tuesday),
    3: dayRange(doc.wednesday),
    4: dayRange(doc.thursday),
    5: dayRange(doc.friday),
    6: dayRange(doc.saturday),
    0: dayRange(doc.sunday),
  } satisfies Record<Weekday, TimeRange | null>;
  const lunch = range(doc.lunchFrom, doc.lunchTo) ?? undefined;
  return {
    regular,
    exceptions: (doc.exceptions ?? [])
      .filter((ex): ex is NonNullable<typeof ex> & { from: string } => Boolean(ex?.from))
      .map((ex) => {
        // Special hours without valid times are treated as closed (safer than claiming "open").
        const hours = ex.closed === false ? range(ex.open, ex.close) : null;
        return {
          from: ex.from,
          to: ex.to && ex.to >= ex.from ? ex.to : ex.from,
          closed: !hours,
          hours: hours ?? undefined,
          reason: clean(ex.reason),
        };
      }),
    notice: clean(doc.notice?.text)
      ? { text: clean(doc.notice?.text)!, from: doc.notice?.showFrom, until: doc.notice?.showUntil }
      : undefined,
    breakfastFrom: clean(doc.breakfastFrom),
    lunch,
  };
}

export function mapStandingOffers(doc: StandingOffersDoc | null | undefined): StandingOfferGroup[] | null {
  if (!doc) return null;
  return (doc.groups ?? [])
    .map((group) => ({
      title: clean(group.title) ?? "",
      offers: (group.items ?? [])
        .filter((item) => item.visible !== false && clean(item.title))
        .map((item) => ({
          title: clean(item.title)!,
          detail: clean(item.detail),
          when: clean(item.when),
          priceEur: typeof item.price === "number" ? item.price : undefined,
        })),
    }))
    .filter((group) => group.title && group.offers.length > 0);
}

export function mapContactInfo(doc: ContactInfoDoc | null | undefined): ContactInfo | null {
  const phone = clean(doc?.phone);
  const street = clean(doc?.street);
  const postalCode = clean(doc?.postalCode);
  const city = clean(doc?.city);
  if (!phone || !street || !postalCode || !city) return null;
  // Keep street and house number together on one line.
  const address = { street: street.replace(/ (\d+\s*\w?)$/, " $1"), postalCode, city };
  return {
    phone: { display: phone, href: toTelHref(phone) },
    email: clean(doc?.email),
    address,
    directionsUrl: directionsUrl(address),
  };
}

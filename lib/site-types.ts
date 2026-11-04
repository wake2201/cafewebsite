/**
 * Content shapes for business data that staff edit in Sanity (Milestone 3).
 * The public components only depend on these types, never on Sanity documents directly.
 */

/** 0 = Sunday … 6 = Saturday (matches Date#getDay). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** "HH:MM", 24-hour clock, Europe/Berlin local time. */
export type TimeRange = { open: string; close: string };

/** Regular weekly pattern; `null` = closed that weekday (Ruhetag). */
export type RegularHours = Record<Weekday, TimeRange | null>;

/** A dated deviation from the regular pattern: holiday closure or special hours. */
export type HoursException = {
  /** ISO date, inclusive. */
  from: string;
  /** ISO date, inclusive (same as `from` for a single day). */
  to: string;
  closed: boolean;
  /** Only when `closed` is false. */
  hours?: TimeRange;
  reason?: string;
};

export type BusinessNotice = {
  text: string;
  /** ISO dates, inclusive; open-ended when omitted. */
  from?: string;
  until?: string;
};

export type OpeningHoursData = {
  regular: RegularHours;
  exceptions: HoursException[];
  notice?: BusinessNotice;
  breakfastFrom?: string;
  lunch?: TimeRange;
};

export type ContactInfo = {
  phone: { display: string; href: string };
  /** Only set when the café approved publishing it. */
  email?: string;
  address: { street: string; postalCode: string; city: string };
  directionsUrl: string;
};

/**
 * Content shapes for menu data. These are the contract between the data source
 * (static files in `data/` today, Sanity from Milestone 3) and the presentational components.
 */

export type Dish = {
  name: string;
  /** Omitted when the café publishes no price for the dish. */
  priceEur?: number;
  note?: string;
};

export type WeeklyMenuDay = {
  /** ISO date yyyy-mm-dd; the weekday name is derived from it. */
  date: string;
  closed?: boolean;
  /** Free text for the day, e.g. a holiday remark. */
  note?: string;
  dishes: Dish[];
};

export type WeeklyMenu = {
  /** ISO date, inclusive. */
  validFrom: string;
  /** ISO date, inclusive. */
  validTo: string;
  /** Only the days the café lists; a week may have fewer or more than five. */
  days: WeeklyMenuDay[];
  notes: string[];
  /** Where the data came from (internal provenance, not rendered). */
  source?: string;
};

/** Result of choosing which weekly menu to show for a given day. */
export type WeeklyMenuSelection =
  | { status: "current"; menu: WeeklyMenu }
  | { status: "upcoming"; menu: WeeklyMenu }
  | { status: "none"; lastValidTo?: string };

export type StandingOffer = {
  title: string;
  detail: string;
  /** Time cue shown in the italic menu-card voice, only where the source gives one. */
  when?: string;
};

export type StandingOfferGroup = {
  title: string;
  offers: StandingOffer[];
};

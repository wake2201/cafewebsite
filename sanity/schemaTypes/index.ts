import { contactInfoType } from "./contactInfo";
import { openingHoursType } from "./openingHours";
import { standingOffersType } from "./standingOffers";
import { weeklyMenuType } from "./weeklyMenu";

export const schemaTypes = [weeklyMenuType, standingOffersType, openingHoursType, contactInfoType];

/** Document types that exist exactly once, with a fixed document ID. */
export const SINGLETONS = {
  standingOffers: "standingOffers",
  openingHours: "openingHours",
  contactInfo: "contactInfo",
} as const;

export const singletonTypes = new Set<string>(Object.keys(SINGLETONS));

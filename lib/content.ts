import "server-only";
import { cacheLife } from "next/cache";
import { standingOfferGroupsFixture } from "@/data/standing-offers";
import { weeklyMenusFixture } from "@/data/weekly-menus";
import { contactFixture, openingHoursFixture } from "@/data/site-fixtures";
import { sanityClient } from "@/sanity/lib/client";
import {
  mapContactInfo,
  mapOpeningHours,
  mapStandingOffers,
  mapWeeklyMenus,
  type ContactInfoDoc,
  type OpeningHoursDoc,
  type StandingOffersDoc,
  type WeeklyMenuDoc,
} from "@/sanity/lib/mappers";
import {
  CONTACT_INFO_QUERY,
  OPENING_HOURS_QUERY,
  STANDING_OFFERS_QUERY,
  WEEKLY_MENUS_QUERY,
} from "@/sanity/lib/queries";
import { berlinToday } from "./cafe";
import { addDays } from "./hours";
import type { StandingOfferGroup, WeeklyMenu } from "./menu-types";
import type { ContactInfo, OpeningHoursData } from "./site-types";

/*
 * The single entry point for editable business data.
 *
 * Source rules
 * - Sanity configured: Sanity is the source of truth. Query errors are thrown (not hidden), so
 *   Next keeps serving the last good cached value at runtime and a build fails loudly rather than
 *   publishing guessed data. Weekly menus are never substituted with fixtures.
 * - Sanity configured but a singleton (hours, contact, offers) has not been published yet: the
 *   verified legacy values from data/ are used, so the site stays correct during setup.
 * - Sanity not configured (local development, preview builds): verified legacy fixtures.
 *
 * Freshness: every function uses the "cms" cache profile (next.config.ts): revalidate after
 * 2 minutes, so published changes and date changes appear within about 2 to 3 minutes.
 */

async function query<T>(groq: string, params: Record<string, string> = {}): Promise<T> {
  // Only called when sanityClient exists.
  return sanityClient!.fetch<T>(groq, params);
}

export async function getWeeklyMenus(): Promise<WeeklyMenu[]> {
  "use cache";
  cacheLife("cms");
  if (!sanityClient) return weeklyMenusFixture;
  const since = addDays(berlinToday().isoDate, -42);
  return mapWeeklyMenus(await query<WeeklyMenuDoc[]>(WEEKLY_MENUS_QUERY, { since }));
}

export async function getStandingOfferGroups(): Promise<StandingOfferGroup[]> {
  "use cache";
  cacheLife("cms");
  if (!sanityClient) return standingOfferGroupsFixture;
  return mapStandingOffers(await query<StandingOffersDoc | null>(STANDING_OFFERS_QUERY)) ?? standingOfferGroupsFixture;
}

export async function getOpeningHours(): Promise<OpeningHoursData> {
  "use cache";
  cacheLife("cms");
  if (!sanityClient) return openingHoursFixture;
  return mapOpeningHours(await query<OpeningHoursDoc | null>(OPENING_HOURS_QUERY)) ?? openingHoursFixture;
}

export async function getContactInfo(): Promise<ContactInfo> {
  "use cache";
  cacheLife("cms");
  if (!sanityClient) return contactFixture;
  return mapContactInfo(await query<ContactInfoDoc | null>(CONTACT_INFO_QUERY)) ?? contactFixture;
}

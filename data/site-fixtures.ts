import { directionsUrl, toTelHref } from "@/lib/cafe";
import type { ContactInfo, OpeningHoursData } from "@/lib/site-types";

/**
 * Verified legacy facts (legacy website, retrieved 2026-11-04; CONTENT_INVENTORY.md §1).
 *
 * Used ONLY while Sanity is not configured (local development, preview builds) and as the
 * content of the initial CMS import. Once Sanity is connected, the CMS is the source of truth
 * and these values are not read by the public site.
 */

const address = { street: "Röntgenstraße 1", postalCode: "06712", city: "Zeitz" };

export const contactFixture: ContactInfo = {
  phone: { display: "03441 2 79 77 78", href: toTelHref("03441 2 79 77 78") },
  address,
  directionsUrl: directionsUrl(address),
};

export const openingHoursFixture: OpeningHoursData = {
  regular: {
    1: { open: "08:00", close: "17:00" },
    2: { open: "08:00", close: "17:00" },
    3: null, // Mittwoch Ruhetag
    4: { open: "08:00", close: "17:00" },
    5: { open: "08:00", close: "17:00" },
    6: { open: "14:00", close: "17:00" },
    0: { open: "14:00", close: "17:00" },
  },
  exceptions: [],
  breakfastFrom: "08:00",
  lunch: { open: "11:30", close: "14:00" },
};

// @sanity/icons v5: one subpath per icon (the root entry no longer exports them).
import { CalendarIcon } from "@sanity/icons/Calendar";
import { ClockIcon } from "@sanity/icons/Clock";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { ThListIcon } from "@sanity/icons/ThList";
import type { ComponentType } from "react";
import { SINGLETONS } from "./schemaTypes";

/**
 * The four areas café staff edit, in the order of how often they are used.
 * Shared by the Studio structure (navigation) and the overview pane (descriptions).
 */
export interface StudioArea {
  /** Pane id; also the URL segment, e.g. /admin/structure/wochenkarte */
  id: string;
  title: string;
  description: string;
  icon: ComponentType;
}

export const STUDIO_AREAS: StudioArea[] = [
  {
    id: "wochenkarte",
    title: "Wochenkarte",
    description: "Wöchentliche Gerichte und Preise bearbeiten",
    icon: CalendarIcon,
  },
  {
    id: SINGLETONS.standingOffers,
    title: "Speisen & Getränke",
    description: "Dauerhafte Angebote und Preise verwalten",
    icon: ThListIcon,
  },
  {
    id: SINGLETONS.openingHours,
    title: "Öffnungszeiten & Urlaub",
    description: "Öffnungszeiten und Ausnahmen festlegen",
    icon: ClockIcon,
  },
  {
    id: SINGLETONS.contactInfo,
    title: "Kontaktdaten",
    description: "Telefon, E-Mail und Adresse verwalten",
    icon: EnvelopeIcon,
  },
];

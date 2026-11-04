import type { StructureResolver } from "sanity/structure";
import { SINGLETONS } from "./schemaTypes";

/**
 * The four areas café staff work with, in German, nothing else.
 * This is a navigation simplification only: on Sanity Free every member who can publish has
 * administrator rights. Hiding tools here is NOT an access restriction (see ARCHITECTURE.md).
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Café am Lindenplatz")
    .items([
      S.listItem()
        .title("Wochenkarte")
        .id("wochenkarte")
        .schemaType("weeklyMenu")
        .child(
          S.documentTypeList("weeklyMenu")
            .title("Wochenkarten")
            .defaultOrdering([{ field: "validFrom", direction: "desc" }]),
        ),
      S.divider(),
      S.listItem()
        .title("Speisen & Getränke")
        .id(SINGLETONS.standingOffers)
        .child(S.document().schemaType("standingOffers").documentId(SINGLETONS.standingOffers).title("Speisen & Getränke")),
      S.listItem()
        .title("Öffnungszeiten & Urlaub")
        .id(SINGLETONS.openingHours)
        .child(
          S.document().schemaType("openingHours").documentId(SINGLETONS.openingHours).title("Öffnungszeiten & Urlaub"),
        ),
      S.listItem()
        .title("Kontaktdaten")
        .id(SINGLETONS.contactInfo)
        .child(S.document().schemaType("contactInfo").documentId(SINGLETONS.contactInfo).title("Kontaktdaten")),
    ]);

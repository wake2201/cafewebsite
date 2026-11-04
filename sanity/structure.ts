import type { StructureBuilder, StructureResolver } from "sanity/structure";
import { STUDIO_AREAS } from "./areas";
import { StudioOverview } from "./components/StudioOverview";
import { SINGLETONS } from "./schemaTypes";

/**
 * The four areas café staff work with, in German, nothing else.
 * The root pane is a short overview (logo, the areas with a one-line explanation, weekly-menu
 * status); each area opens as the next pane. Document IDs and types are unchanged.
 *
 * This is a navigation simplification only: on Sanity Free every member who can publish has
 * administrator rights. Hiding tools here is NOT an access restriction (see ARCHITECTURE.md).
 */
function areaPane(S: StructureBuilder, id: string) {
  const area = STUDIO_AREAS.find((a) => a.id === id);
  if (!area) return undefined;
  if (id === "wochenkarte") {
    return S.documentTypeList("weeklyMenu")
      .id("wochenkarte")
      .title("Wochenkarten")
      .defaultOrdering([{ field: "validFrom", direction: "desc" }]);
  }
  const type = id as keyof typeof SINGLETONS;
  return S.document().schemaType(SINGLETONS[type]).documentId(SINGLETONS[type]).title(area.title);
}

export const structure: StructureResolver = (S) =>
  S.component(StudioOverview)
    .id("start")
    .title("Café am Lindenplatz")
    // Sized like a list pane, so the opened area gets the room.
    .minWidth(320)
    .maxWidth(400)
    .child((id: string) => areaPane(S, id));

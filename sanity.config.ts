"use client";

/**
 * Sanity Studio configuration, embedded at /admin (app/(studio)/admin/[[...tool]]/page.tsx).
 * Only the structure tool is enabled; no query playground or other technical plugins.
 */
import { deDELocale } from "@sanity/locale-de-de";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./sanity/env";
import { schemaTypes, singletonTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";
import { studioTheme } from "./sanity/theme";
import { StudioIcon } from "./sanity/components/StudioIcon";
import { localeOverrides } from "./sanity/locale";

// Singletons can only be edited and published, never created twice, duplicated or deleted.
const singletonActions = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  name: "cafe-am-lindenplatz",
  title: "Café am Lindenplatz",
  basePath: "/admin",
  icon: StudioIcon,
  projectId,
  dataset,
  theme: studioTheme,
  i18n: { bundles: localeOverrides },
  // Features the café does not use (most are paid-plan features that only add menus and
  // upgrade prompts). Off = hidden in the UI; this changes no data and no permissions.
  releases: { enabled: false },
  scheduledDrafts: { enabled: false },
  scheduledPublishing: { enabled: false },
  tasks: { enabled: false },
  plugins: [structureTool({ structure, title: "Inhalte" }), deDELocale()],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    // Field comments are a collaboration feature the café does not use; they add a button to every field.
    comments: { enabled: false },
    actions: (input, context) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }) => action && singletonActions.has(action))
        : input,
    newDocumentOptions: (prev) => prev.filter((item) => !singletonTypes.has(item.templateId)),
  },
});

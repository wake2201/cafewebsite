import { defineLocaleResourceBundle } from "sanity";

/**
 * Small corrections to the German Studio texts (@sanity/locale-de-de), via Sanity's documented
 * i18n override. Only keys the café's editors actually see:
 * - "Neues {{schemaType}}" is wrong for feminine types ("Neues Wochenkarte"); "Neu: …" fits all.
 * - "Show all {{count}} items" has no German translation in the language pack.
 */
export const localeOverrides = [
  defineLocaleResourceBundle({
    locale: "de-DE",
    namespace: "structure",
    resources: {
      "panes.document-header-title.new.text": "Neu: {{schemaType}}",
      "browser-document-title.new-document": "Neu: {{schemaType}}",
    },
  }),
  defineLocaleResourceBundle({
    locale: "de-DE",
    namespace: "studio",
    resources: {
      "inputs.array.action.show-all-items": "Alle {{count}} anzeigen",
    },
  }),
];

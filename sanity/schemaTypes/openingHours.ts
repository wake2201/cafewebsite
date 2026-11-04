import { defineArrayMember, defineField, defineType } from "sanity";
import { formatGermanDate, validateDateOrder, validateTime, validateTimeRange } from "../validation";

type DayValue = { closed?: boolean; open?: string; close?: string };

/** One weekday's regular hours: closed, or open from–to. */
function weekdayField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: "object",
    fieldset: "regular",
    // "Ruhetag" across the full width, the two times side by side below it (also on phones).
    // The fieldset only groups the inputs; the stored object keeps the same fields.
    fieldsets: [{ name: "times", title: "Zeiten", options: { columns: 2 } }],
    fields: [
      defineField({ name: "closed", title: "Ruhetag", type: "boolean", initialValue: false }),
      defineField({
        name: "open",
        title: "Öffnet um",
        type: "string",
        fieldset: "times",
        placeholder: "08:00",
        hidden: ({ parent }) => Boolean((parent as DayValue | undefined)?.closed),
      }),
      defineField({
        name: "close",
        title: "Schließt um",
        type: "string",
        fieldset: "times",
        placeholder: "17:00",
        hidden: ({ parent }) => Boolean((parent as DayValue | undefined)?.closed),
      }),
    ],
    validation: (rule) =>
      rule
        .required()
        .error(`Bitte die Zeiten für ${title} eintragen oder „Ruhetag“ wählen.`)
        .custom((value: DayValue | undefined) => validateTimeRange(value)),
  });
}

/** Singleton: regular hours, holidays/exceptions and an optional notice ("Öffnungszeiten & Urlaub"). */
export const openingHoursType = defineType({
  name: "openingHours",
  title: "Öffnungszeiten & Urlaub",
  type: "document",
  fieldsets: [
    { name: "regular", title: "Regelmäßige Öffnungszeiten", options: { collapsible: false } },
    { name: "service", title: "Frühstück und Mittagstisch", options: { collapsible: false } },
  ],
  fields: [
    weekdayField("monday", "Montag"),
    weekdayField("tuesday", "Dienstag"),
    weekdayField("wednesday", "Mittwoch"),
    weekdayField("thursday", "Donnerstag"),
    weekdayField("friday", "Freitag"),
    weekdayField("saturday", "Samstag"),
    weekdayField("sunday", "Sonntag"),

    defineField({
      name: "breakfastFrom",
      title: "Frühstück ab",
      type: "string",
      fieldset: "service",
      placeholder: "08:00",
      validation: (rule) => rule.custom((v: string | undefined) => validateTime(v, false)),
    }),
    defineField({
      name: "lunchFrom",
      title: "Mittagstisch von",
      type: "string",
      fieldset: "service",
      placeholder: "11:30",
      validation: (rule) => rule.custom((v: string | undefined) => validateTime(v, false)),
    }),
    defineField({
      name: "lunchTo",
      title: "Mittagstisch bis",
      type: "string",
      fieldset: "service",
      placeholder: "14:00",
      validation: (rule) =>
        rule.custom((v: string | undefined, context) => {
          const time = validateTime(v, false);
          if (time !== true) return time;
          const from = (context.document as { lunchFrom?: string } | undefined)?.lunchFrom;
          return v && from && v <= from ? "„Mittagstisch bis“ muss nach „von“ liegen." : true;
        }),
    }),

    defineField({
      name: "exceptions",
      title: "Urlaub, Feiertage und Sonderöffnungszeiten",
      type: "array",
      description:
        "Gilt nur für die eingetragenen Tage und hat Vorrang vor den regelmäßigen Zeiten. Abgelaufene Einträge können gelöscht werden.",
      of: [
        defineArrayMember({
          type: "object",
          name: "hoursException",
          title: "Ausnahme",
          fields: [
            defineField({
              name: "from",
              title: "Von",
              type: "date",
              options: { dateFormat: "DD.MM.YYYY" },
              validation: (rule) => rule.required().error("Bitte das Anfangsdatum wählen."),
            }),
            defineField({
              name: "to",
              title: "Bis (für einen einzelnen Tag leer lassen)",
              type: "date",
              options: { dateFormat: "DD.MM.YYYY" },
              validation: (rule) =>
                rule.custom((to: string | undefined, context) =>
                  validateDateOrder((context.parent as { from?: string } | undefined)?.from, to),
                ),
            }),
            defineField({ name: "closed", title: "Geschlossen", type: "boolean", initialValue: true }),
            defineField({
              name: "open",
              title: "Öffnet um",
              type: "string",
              placeholder: "10:00",
              hidden: ({ parent }) => (parent as DayValue | undefined)?.closed !== false,
            }),
            defineField({
              name: "close",
              title: "Schließt um",
              type: "string",
              placeholder: "14:00",
              hidden: ({ parent }) => (parent as DayValue | undefined)?.closed !== false,
            }),
            defineField({
              name: "reason",
              title: "Anlass (optional, wird angezeigt)",
              type: "string",
              description: "Z. B. „Betriebsurlaub“ oder „Weihnachten“.",
              validation: (rule) => rule.max(60),
            }),
          ],
          validation: (rule) =>
            rule.custom((value: DayValue | undefined) =>
              value && value.closed === false ? validateTimeRange(value) : true,
            ),
          preview: {
            select: { from: "from", to: "to", closed: "closed", open: "open", close: "close", reason: "reason" },
            prepare: ({ from, to, closed, open, close, reason }) => ({
              title: from ? (to && to !== from ? `${formatGermanDate(from)} bis ${formatGermanDate(to)}` : formatGermanDate(from)) : "Datum fehlt",
              subtitle: `${closed === false ? `${open ?? "?"} – ${close ?? "?"} Uhr` : "geschlossen"}${reason ? ` (${reason})` : ""}`,
            }),
          },
        }),
      ],
    }),

    defineField({
      name: "notice",
      title: "Hinweis auf der Website (optional)",
      type: "object",
      description: "Kurzer Hinweis, z. B. zu Urlaub oder geänderten Zeiten. Erscheint bei den Öffnungszeiten.",
      fields: [
        defineField({ name: "text", title: "Text", type: "text", rows: 2, validation: (rule) => rule.max(280) }),
        defineField({ name: "showFrom", title: "Anzeigen ab (optional)", type: "date", options: { dateFormat: "DD.MM.YYYY" } }),
        defineField({
          name: "showUntil",
          title: "Anzeigen bis (optional)",
          type: "date",
          options: { dateFormat: "DD.MM.YYYY" },
          validation: (rule) =>
            rule.custom((to: string | undefined, context) =>
              validateDateOrder((context.parent as { showFrom?: string } | undefined)?.showFrom, to),
            ),
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Öffnungszeiten & Urlaub" }) },
});

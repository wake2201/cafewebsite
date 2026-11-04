import { CalendarIcon } from "@sanity/icons/Calendar";
import { defineArrayMember, defineField, defineType } from "sanity";
import {
  formatGermanDate,
  rangesOverlap,
  validateDateOrder,
  validateMenuDays,
  validatePrice,
} from "../validation";
import { apiVersion } from "../env";

/** Monday of the coming week (or today when today is Monday), as yyyy-mm-dd in local time. */
function nextMonday(): string {
  const d = new Date();
  const offset = (8 - d.getDay()) % 7;
  d.setDate(d.getDate() + offset);
  // Local calendar parts (not toISOString, which converts to UTC and can shift the day).
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const dish = defineArrayMember({
  type: "object",
  name: "dish",
  title: "Gericht",
  fields: [
    defineField({
      name: "name",
      title: "Gericht",
      type: "string",
      description: "So wie es auf der Karte stehen soll, z. B. „Spaghetti Bolognese, Dessert“.",
      validation: (rule) => rule.required().error("Bitte den Namen des Gerichts eintragen.").max(140),
    }),
    defineField({
      name: "price",
      title: "Preis in Euro (optional)",
      type: "number",
      description: "Nur die Zahl, mit Punkt statt Komma: 10.90. Leer lassen, wenn kein Preis angezeigt werden soll.",
      validation: (rule) => rule.custom((value: number | undefined) => validatePrice(value)),
    }),
    defineField({
      name: "description",
      title: "Beschreibung (optional)",
      type: "string",
      description: "Kurzer Zusatz, erscheint klein unter dem Gericht.",
      validation: (rule) => rule.max(200),
    }),
  ],
  preview: {
    select: { title: "name", price: "price" },
    prepare: ({ title, price }) => ({
      title: title || "Neues Gericht",
      subtitle: typeof price === "number" ? `${price.toFixed(2).replace(".", ",")} €` : "ohne Preis",
    }),
  },
});

const menuDay = defineArrayMember({
  type: "object",
  name: "menuDay",
  title: "Tag",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "date",
      title: "Datum",
      type: "date",
      options: { dateFormat: "DD.MM.YYYY" },
      validation: (rule) => rule.required().error("Bitte das Datum des Tages wählen."),
    }),
    defineField({
      name: "closed",
      title: "An diesem Tag geschlossen",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "dishes",
      title: "Gerichte",
      type: "array",
      of: [dish],
      hidden: ({ parent }) => Boolean((parent as { closed?: boolean } | undefined)?.closed),
    }),
    defineField({
      name: "note",
      title: "Hinweis für diesen Tag (optional)",
      type: "string",
      description: "Z. B. „Feiertag“. Erscheint klein unter den Gerichten.",
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: { date: "date", closed: "closed", dishes: "dishes" },
    prepare: ({ date, closed, dishes }) => ({
      title: date
        ? new Date(`${date}T00:00:00Z`).toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: "UTC",
          })
        : "Datum fehlt",
      // The dish names themselves, so a week can be checked without opening every day.
      subtitle: closed
        ? "geschlossen"
        : ((dishes as { name?: string }[] | undefined) ?? [])
            .map((d) => d.name)
            .filter(Boolean)
            .join(", ") || "noch keine Gerichte",
    }),
  },
});

export const weeklyMenuType = defineType({
  name: "weeklyMenu",
  title: "Wochenkarte",
  icon: CalendarIcon,
  type: "document",
  // Both dates side by side (one column on narrow screens).
  fieldsets: [{ name: "zeitraum", title: "Zeitraum", options: { columns: 2 } }],
  fields: [
    defineField({
      name: "validFrom",
      title: "Gültig ab",
      type: "date",
      fieldset: "zeitraum",
      description: "Ab diesem Tag auf der Website.",
      options: { dateFormat: "DD.MM.YYYY" },
      validation: (rule) => rule.required().error("Bitte den ersten Tag wählen."),
    }),
    defineField({
      name: "validTo",
      title: "Gültig bis",
      type: "date",
      fieldset: "zeitraum",
      description: "Danach automatisch ausgeblendet.",
      options: { dateFormat: "DD.MM.YYYY" },
      validation: (rule) =>
        rule
          .required()
          .error("Bitte den letzten Tag wählen.")
          .custom((validTo: string | undefined, context) =>
            validateDateOrder((context.document as { validFrom?: string } | undefined)?.validFrom, validTo),
          ),
    }),
    defineField({
      name: "days",
      title: "Tage",
      type: "array",
      of: [menuDay],
      description: "Jeder Tag kann mehrere Gerichte haben. Ruhetage als „geschlossen“ markieren.",
      validation: (rule) =>
        rule.custom((days: unknown, context) => {
          const doc = context.document as { validFrom?: string; validTo?: string } | undefined;
          return validateMenuDays(days as Parameters<typeof validateMenuDays>[0], doc?.validFrom, doc?.validTo);
        }),
    }),
    defineField({
      name: "notes",
      title: "Hinweise unter der Karte",
      type: "array",
      of: [{ type: "string" }],
      description: "Erscheinen klein unter der Wochenkarte.",
    }),
  ],
  // Published weeks must not overlap, otherwise the website could not tell which one is current.
  validation: (rule) =>
    rule.custom(async (doc, context) => {
      const d = doc as { _id?: string; validFrom?: string; validTo?: string } | undefined;
      if (!d?.validFrom || !d?.validTo || !d._id) return true;
      const publishedId = d._id.replace(/^drafts\./, "");
      const others = await context
        .getClient({ apiVersion })
        .fetch<{ validFrom: string; validTo: string }[]>(
          `*[_type == "weeklyMenu" && !(_id in path("drafts.**")) && _id != $id && defined(validFrom) && defined(validTo)]{validFrom, validTo}`,
          { id: publishedId },
        );
      const clash = others.find((o) => rangesOverlap(d.validFrom!, d.validTo!, o.validFrom, o.validTo));
      return clash
        ? `Diese Wochenkarte überschneidet sich mit der veröffentlichten Karte vom ${formatGermanDate(clash.validFrom)} bis ${formatGermanDate(clash.validTo)}. Bitte die Daten anpassen oder die alte Karte korrigieren.`
        : true;
    }),
  initialValue: () => {
    const monday = nextMonday();
    // Mo–Fr prefilled; Mittwoch as Ruhetag like the café's current pattern. Editable.
    return {
      validFrom: monday,
      validTo: addDays(monday, 4),
      days: [0, 1, 2, 3, 4].map((offset) => ({
        _key: `tag-${offset}`,
        _type: "menuDay",
        date: addDays(monday, offset),
        closed: offset === 2,
        dishes: [],
      })),
      notes: [
        "Änderungen vorbehalten.",
        "Speisen auch zum Mitnehmen sowie auf Vorbestellung.",
        "Bei Fragen zu Allergenen und Zusatzstoffen wenden Sie sich bitte an unser Personal.",
      ],
    };
  },
  orderings: [
    { title: "Neueste zuerst", name: "validFromDesc", by: [{ field: "validFrom", direction: "desc" }] },
  ],
  preview: {
    select: { from: "validFrom", to: "validTo" },
    prepare: ({ from, to }) => {
      const today = new Date().toISOString().slice(0, 10);
      const status = !from || !to ? "unvollständig" : to < today ? "abgelaufen" : from > today ? "geplant" : "aktuell";
      return {
        title: from && to ? `Wochenkarte ${formatGermanDate(from)} bis ${formatGermanDate(to)}` : "Neue Wochenkarte",
        subtitle: status,
      };
    },
  },
});

import { ThListIcon } from "@sanity/icons/ThList";
import { defineArrayMember, defineField, defineType } from "sanity";
import { validatePrice } from "../validation";

/** Singleton: the café's standing food and drink offers ("Speisen & Getränke"). */
export const standingOffersType = defineType({
  name: "standingOffers",
  title: "Speisen & Getränke",
  type: "document",
  fields: [
    defineField({
      name: "groups",
      title: "Bereiche",
      type: "array",
      description:
        "Die Bereiche erscheinen auf der Speisekarte als Spalten, auf der Startseite als eine Liste. Reihenfolge per Ziehen ändern.",
      of: [
        defineArrayMember({
          type: "object",
          name: "offerGroup",
          title: "Bereich",
          icon: ThListIcon,
          fields: [
            defineField({
              name: "title",
              title: "Überschrift",
              type: "string",
              description: "Z. B. „Kaffee und Kuchen“.",
              validation: (rule) => rule.required().error("Bitte eine Überschrift eintragen.").max(60),
            }),
            defineField({
              name: "items",
              title: "Einträge",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "offerItem",
                  title: "Eintrag",
                  fields: [
                    defineField({
                      name: "title",
                      title: "Name",
                      type: "string",
                      validation: (rule) => rule.required().error("Bitte einen Namen eintragen.").max(80),
                    }),
                    defineField({
                      name: "detail",
                      title: "Beschreibung (optional)",
                      type: "string",
                      description: "Kurz, z. B. „auf Bestellung“.",
                      validation: (rule) => rule.max(140),
                    }),
                    defineField({
                      name: "when",
                      title: "Zeitangabe (optional)",
                      type: "string",
                      description: "Z. B. „ab 08:00 Uhr“. Wird kursiv neben dem Namen angezeigt.",
                      validation: (rule) => rule.max(40),
                    }),
                    defineField({
                      name: "price",
                      title: "Preis in Euro (optional)",
                      type: "number",
                      description: "Mit Punkt statt Komma, z. B. 3.20. Leer lassen, wenn kein Preis gezeigt werden soll.",
                      validation: (rule) => rule.custom((value: number | undefined) => validatePrice(value)),
                    }),
                    defineField({
                      name: "visible",
                      title: "Auf der Website zeigen",
                      type: "boolean",
                      initialValue: true,
                    }),
                  ],
                  preview: {
                    select: { title: "title", detail: "detail", visible: "visible", price: "price" },
                    prepare: ({ title, detail, visible, price }) => ({
                      title: title || "Neuer Eintrag",
                      subtitle: [
                        visible === false ? "ausgeblendet" : null,
                        typeof price === "number" ? `${price.toFixed(2).replace(".", ",")} €` : null,
                        detail,
                      ]
                        .filter(Boolean)
                        .join(", "),
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: "title", items: "items" },
            prepare: ({ title, items }) => ({
              title: title || "Neuer Bereich",
              subtitle: `${(items as unknown[] | undefined)?.length ?? 0} Einträge`,
            }),
          },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Speisen & Getränke" }) },
});

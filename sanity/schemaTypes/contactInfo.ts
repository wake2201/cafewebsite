import { defineField, defineType } from "sanity";

/**
 * Singleton: public contact details ("Kontaktdaten").
 * Deliberately NOT here: the contact-form recipient and sender, which are server settings
 * (environment variables) so they cannot be changed or exposed through the CMS.
 */
export const contactInfoType = defineType({
  name: "contactInfo",
  title: "Kontaktdaten",
  type: "document",
  fields: [
    defineField({
      name: "phone",
      title: "Telefonnummer",
      type: "string",
      description: "So wie sie auf der Website erscheinen soll, z. B. „03441 2 79 77 78“.",
      validation: (rule) =>
        rule
          .required()
          .error("Bitte die Telefonnummer eintragen.")
          .regex(/^\+?[\d\s/()-]{6,30}$/, { name: "Telefonnummer" })
          .error("Bitte nur Ziffern, Leerzeichen und ggf. + / ( ) - verwenden."),
    }),
    defineField({
      name: "email",
      title: "Öffentliche E-Mail-Adresse (optional)",
      type: "string",
      description:
        "Nur eintragen, wenn diese Adresse öffentlich auf der Website stehen soll. Wohin das Kontaktformular sendet, wird hier nicht eingestellt.",
      validation: (rule) =>
        rule.email().error("Bitte eine gültige E-Mail-Adresse eintragen, z. B. info@beispiel.de."),
    }),
    defineField({
      name: "street",
      title: "Straße und Hausnummer",
      type: "string",
      validation: (rule) => rule.required().error("Bitte Straße und Hausnummer eintragen.").max(80),
    }),
    defineField({
      name: "postalCode",
      title: "Postleitzahl",
      type: "string",
      validation: (rule) =>
        rule.required().regex(/^\d{5}$/, { name: "Postleitzahl" }).error("Bitte eine fünfstellige Postleitzahl eintragen."),
    }),
    defineField({
      name: "city",
      title: "Ort",
      type: "string",
      validation: (rule) => rule.required().error("Bitte den Ort eintragen.").max(60),
    }),
  ],
  preview: { prepare: () => ({ title: "Kontaktdaten" }) },
});

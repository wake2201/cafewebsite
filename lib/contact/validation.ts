/**
 * Server-side validation and normalisation of contact-form input. The client validates too,
 * but only this function decides. Pure and unit-tested (tests/contact.test.ts).
 */

export const LIMITS = {
  name: 100,
  email: 200,
  subject: 150,
  messageMin: 10,
  message: 2000,
} as const;

export type ContactField = "name" | "email" | "subject" | "message" | "privacy";

export type ContactMessage = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export type ValidationResult =
  | { ok: true; data: ContactMessage }
  | { ok: false; fieldErrors: Partial<Record<ContactField, string>> };

// Pragmatic address check (one @, no spaces, a dot in the domain); deliverability is the provider's job.
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

/** Removes control characters; for single-line fields also line breaks (header-injection guard). */
function normalize(value: unknown, singleLine: boolean): string {
  if (typeof value !== "string") return "";
  let s = value.normalize("NFC");
  s = singleLine
    ? s.replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ")
    : s.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");
  return singleLine ? s.replace(/\s+/g, " ").trim() : s.trim();
}

const INVALID = "Diese Eingabe konnte nicht verarbeitet werden.";

export function validateContact(input: Record<string, unknown>): ValidationResult {
  const fieldErrors: Partial<Record<ContactField, string>> = {};
  // A supplied value that is not text (e.g. a file) is an error, never silently ignored.
  for (const field of ["name", "email", "subject", "message"] as const) {
    if (input[field] !== undefined && typeof input[field] !== "string") fieldErrors[field] = INVALID;
  }

  const name = normalize(input.name, true);
  const email = normalize(input.email, true);
  const subject = normalize(input.subject, true);
  const message = normalize(input.message, false);
  const privacy = input.privacy === "on" || input.privacy === true || input.privacy === "true";

  if (fieldErrors.name) {
    /* keep the type error */
  } else if (!name) fieldErrors.name = "Bitte geben Sie Ihren Namen ein.";
  else if (name.length > LIMITS.name) fieldErrors.name = `Bitte höchstens ${LIMITS.name} Zeichen.`;

  if (fieldErrors.email) {
    /* keep the type error */
  } else if (!email) fieldErrors.email = "Bitte geben Sie Ihre E-Mail-Adresse ein.";
  else if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel name@beispiel.de.";
  }

  if (!fieldErrors.subject && subject.length > LIMITS.subject) fieldErrors.subject = `Bitte höchstens ${LIMITS.subject} Zeichen.`;

  if (fieldErrors.message) {
    /* keep the type error */
  } else if (!message) fieldErrors.message = "Bitte schreiben Sie Ihre Nachricht.";
  else if (message.length < LIMITS.messageMin) fieldErrors.message = `Bitte schreiben Sie mindestens ${LIMITS.messageMin} Zeichen.`;
  else if (message.length > LIMITS.message) fieldErrors.message = `Bitte höchstens ${LIMITS.message} Zeichen.`;

  if (!privacy) fieldErrors.privacy = "Bitte bestätigen Sie den Datenschutzhinweis.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, data: { name, email, subject: subject || undefined, message } };
}

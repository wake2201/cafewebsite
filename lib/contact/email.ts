import type { ContactMessage } from "./validation";

/**
 * Builds the e-mail the café receives. Deterministic for the same input. Plain text only: no HTML is rendered, so visitor input
 * cannot inject markup or links that look trustworthy. Values are already normalised
 * (single-line fields contain no line breaks).
 */
export function buildContactEmail(msg: ContactMessage): { subject: string; text: string } {
  // No timestamp in the body: the e-mail's own Date header carries it, and an identical retry
  // must produce an identical payload for the provider's idempotency key.
  const subject = `Kontaktformular Website: ${msg.subject ?? `Nachricht von ${msg.name}`}`.slice(0, 200);
  const text = [
    "Neue Nachricht über das Kontaktformular der Website (Café am Lindenplatz).",
    "",
    `Name: ${msg.name}`,
    `E-Mail: ${msg.email}`,
    `Betreff: ${msg.subject ?? "(kein Betreff)"}`,
    "",
    "Nachricht:",
    msg.message,
    "",
    "--",
    "Antworten Sie direkt auf diese E-Mail, um der Absenderin oder dem Absender zu antworten.",
    "Die Nachricht wird von der Website nicht gespeichert.",
  ].join("\n");

  return { subject, text };
}

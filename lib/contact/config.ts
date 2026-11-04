/**
 * Server-controlled gate for live e-mail delivery. Sending is possible ONLY when every value is
 * present and well-formed AND CONTACT_FORM_ENABLED is exactly "true". Otherwise the form stays
 * visibly disabled and the server action refuses to send. Values live in server environment
 * variables (never NEXT_PUBLIC_, never in Sanity, never in the repository).
 */

export type DeliveryConfig = {
  apiKey: string;
  /** Verified sender, e.g. "Website Café am Lindenplatz <kontakt@example.de>". */
  from: string;
  /** Confirmed café inbox (exactly one address). */
  to: string;
};

// Exactly one mailbox: no whitespace, angle brackets, commas, semicolons or quotes.
const MAILBOX = String.raw`[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]{2,}`;
const ADDRESS = new RegExp(`^${MAILBOX}$`);
// Either a bare address or `Display Name <address>` with balanced brackets.
const SENDER = new RegExp(String.raw`^(?:${MAILBOX}|[^<>\r\n,;"]{1,80} <${MAILBOX}>)$`);

export function readDeliveryConfig(env: Record<string, string | undefined> = process.env): DeliveryConfig | null {
  if (env.CONTACT_FORM_ENABLED !== "true") return null;
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.CONTACT_FROM_EMAIL?.trim();
  const to = env.CONTACT_TO_EMAIL?.trim();
  if (!apiKey || !apiKey.startsWith("re_")) return null;
  if (!from || !SENDER.test(from)) return null;
  if (!to || !ADDRESS.test(to)) return null;
  return { apiKey, from, to };
}

export function isDeliveryEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return readDeliveryConfig(env) !== null;
}

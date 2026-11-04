import type { DeliveryConfig } from "./config";
import { buildContactEmail } from "./email";
import type { RateLimiter } from "./rate-limit";
import type { SendInput, SendResult } from "./resend";
import type { ContactState } from "./state";
import { validateContact } from "./validation";

export type { ContactState } from "./state";

export type ContactDeps = {
  config: DeliveryConfig | null;
  limiter: RateLimiter;
  /** Used when the shared limiter is unavailable, so a limit always applies. */
  fallbackLimiter: RateLimiter;
  clientKey: string;
  send: (input: SendInput) => Promise<SendResult>;
  /** Receives event codes only, never message content or personal data. */
  log: (event: string, detail?: Record<string, string | number>) => void;
};

const MSG_UNAVAILABLE =
  "Das Kontaktformular ist derzeit nicht freigeschaltet. Bitte rufen Sie uns an.";
const MSG_FAILED =
  "Ihre Nachricht konnte gerade nicht gesendet werden. Ihre Eingaben bleiben erhalten. Bitte versuchen Sie es später erneut oder rufen Sie uns an.";
const MSG_TOO_MANY =
  "Sie haben in kurzer Zeit mehrere Nachrichten gesendet. Bitte versuchen Sie es in einigen Minuten erneut oder rufen Sie uns an.";

const REQUEST_ID = /^[0-9a-f-]{16,64}$/i;

/**
 * Orchestrates one submission: gate, honeypot, validation, rate limit, send.
 * Pure apart from the injected dependencies, so it is fully unit-testable without network.
 */
export async function handleContactSubmission(form: Record<string, unknown>, deps: ContactDeps): Promise<ContactState> {
  if (!deps.config) {
    deps.log("disabled");
    return { status: "disabled", message: MSG_UNAVAILABLE };
  }

  // Honeypot: invisible to people, often filled by bots. Anything other than an empty string
  // (text of any length, a file, a non-string value) is rejected without sending or detail.
  if (form.website !== undefined && form.website !== "") {
    deps.log("honeypot");
    return { status: "error", message: MSG_FAILED };
  }

  const result = validateContact(form);
  if (!result.ok) return { status: "invalid", fieldErrors: result.fieldErrors };

  let allowed: boolean;
  try {
    allowed = await deps.limiter.hit(deps.clientKey);
  } catch {
    // Shared limiter down or malformed: fall back to the per-instance limit instead of none.
    deps.log("rate_limiter_unavailable");
    allowed = await deps.fallbackLimiter.hit(deps.clientKey);
  }
  if (!allowed) {
    deps.log("rate_limited");
    return { status: "error", message: MSG_TOO_MANY };
  }

  const { subject, text } = buildContactEmail(result.data);
  const requestId = typeof form.requestId === "string" && REQUEST_ID.test(form.requestId) ? form.requestId : undefined;

  const sent = await deps.send({
    apiKey: deps.config.apiKey,
    from: deps.config.from,
    to: deps.config.to,
    replyTo: result.data.email,
    subject,
    text,
    idempotencyKey: requestId ? `kontakt-${requestId}` : undefined,
  });

  if (!sent.ok) {
    deps.log("send_failed", { reason: sent.reason, ...(sent.status ? { status: sent.status } : {}) });
    return { status: "error", message: sent.reason === "rate_limited" ? MSG_TOO_MANY : MSG_FAILED };
  }
  deps.log("sent");
  return { status: "success" };
}

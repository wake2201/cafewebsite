/**
 * Minimal Resend adapter over its REST API (https://resend.com/docs/api-reference/emails/send-email).
 * Plain fetch instead of the SDK: one request, no extra dependency. `fetchImpl` is injectable so
 * tests never reach the network.
 */

export type SendInput = {
  apiKey: string;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  /** Same key for a retried submission makes Resend send it only once. */
  idempotencyKey?: string;
};

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "rejected" | "rate_limited" | "provider_error" | "network"; status?: number };

export async function sendViaResend(input: SendInput, fetchImpl: typeof fetch = fetch): Promise<SendResult> {
  let response: Response;
  try {
    response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
        ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: input.from,
        to: [input.to],
        reply_to: input.replyTo,
        subject: input.subject,
        text: input.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  if (response.ok) {
    const body = (await response.json().catch(() => null)) as { id?: unknown } | null;
    // Only a provider-issued id counts as accepted; anything else is treated as failure.
    return typeof body?.id === "string" && body.id
      ? { ok: true, id: body.id }
      : { ok: false, reason: "provider_error", status: response.status };
  }
  if (response.status === 429) return { ok: false, reason: "rate_limited", status: 429 };
  if (response.status >= 400 && response.status < 500) return { ok: false, reason: "rejected", status: response.status };
  return { ok: false, reason: "provider_error", status: response.status };
}

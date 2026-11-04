"use server";

import { headers } from "next/headers";
import { readDeliveryConfig } from "@/lib/contact/config";
import { handleContactSubmission } from "@/lib/contact/handle";
import type { ContactState } from "@/lib/contact/state";
import { createMemoryLimiter, createUpstashLimiter, hashClientKey, type RateLimiter } from "@/lib/contact/rate-limit";
import { sendViaResend } from "@/lib/contact/resend";

// Module scope: the in-memory limiter lives as long as this server instance (see rate-limit.ts).
const memoryLimiter = createMemoryLimiter();
const limiter: RateLimiter =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? createUpstashLimiter(process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN)
    : memoryLimiter;

const FIELDS = ["name", "email", "subject", "message", "privacy", "website", "requestId"] as const;

/**
 * Server action behind the Kontakt form. Server-side validation, honeypot, rate limit and the
 * delivery gate all run here; credentials never leave the server. Nothing is stored.
 */
export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Values are passed on as received (strings or files); validation rejects anything that is not
  // acceptable text, and the honeypot rejects any non-empty value. Nothing is silently dropped.
  // Total size is bounded by Next's server-action body limit (1 MB by default).
  const form: Record<string, unknown> = {};
  for (const field of FIELDS) {
    const value = formData.get(field);
    if (value !== null) form[field] = value;
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

  return handleContactSubmission(form, {
    config: readDeliveryConfig(),
    limiter,
    fallbackLimiter: memoryLimiter,
    clientKey: await hashClientKey(ip),
    send: (input) => sendViaResend(input),
    log: (event, detail) => {
      // Event codes only: no names, addresses or message text in logs.
      const line = `[kontakt] ${event}${detail ? ` ${JSON.stringify(detail)}` : ""}`;
      if (event === "sent" || event === "disabled") console.info(line);
      else console.warn(line);
    },
  });
}

import { describe, expect, it, vi } from "vitest";
import { readDeliveryConfig } from "@/lib/contact/config";
import { buildContactEmail } from "@/lib/contact/email";
import { handleContactSubmission, type ContactDeps } from "@/lib/contact/handle";
import { createMemoryLimiter, createUpstashLimiter } from "@/lib/contact/rate-limit";
import { sendViaResend } from "@/lib/contact/resend";
import { validateContact } from "@/lib/contact/validation";

const valid = {
  name: "Erika Muster",
  email: "erika@example.org",
  subject: "Kuchenplatte",
  message: "Ich möchte für Samstag eine Kuchenplatte bestellen.",
  privacy: "on",
};

const config = { apiKey: "re_test_key", from: "Website <kontakt@example.org>", to: "cafe@example.org" };

function deps(overrides: Partial<ContactDeps> = {}): ContactDeps & { log: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn> } {
  return {
    config,
    limiter: createMemoryLimiter(),
    fallbackLimiter: createMemoryLimiter(),
    clientKey: "client-a",
    send: vi.fn(async () => ({ ok: true as const, id: "email_123" })),
    log: vi.fn(),
    ...overrides,
  } as ContactDeps & { log: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn> };
}

describe("validateContact", () => {
  it("accepts a complete message and normalises it", () => {
    const r = validateContact({ ...valid, name: "  Erika   Muster ", subject: "" });
    expect(r).toEqual({ ok: true, data: { name: "Erika Muster", email: "erika@example.org", subject: undefined, message: valid.message } });
  });

  it("reports every missing required field", () => {
    const r = validateContact({});
    expect(r.ok).toBe(false);
    expect(!r.ok && Object.keys(r.fieldErrors).sort()).toEqual(["email", "message", "name", "privacy"]);
  });

  it.each(["kein-at", "a@b", "a b@example.org", "x@example.org\nBcc: y@example.org"])("rejects e-mail %j", (email) => {
    const r = validateContact({ ...valid, email });
    expect(!r.ok && r.fieldErrors.email).toBeTruthy();
  });

  it("enforces length limits", () => {
    expect(validateContact({ ...valid, name: "x".repeat(101) }).ok).toBe(false);
    expect(validateContact({ ...valid, subject: "x".repeat(151) }).ok).toBe(false);
    expect(validateContact({ ...valid, message: "zu kurz" }).ok).toBe(false);
    expect(validateContact({ ...valid, message: "x".repeat(2001) }).ok).toBe(false);
  });

  it("strips line breaks from single-line fields (header injection) but keeps them in the message", () => {
    const r = validateContact({ ...valid, subject: "Hallo\r\nBcc: spam@example.org", message: "Zeile 1\r\nZeile 2 ist lang genug" });
    expect(r.ok && r.data.subject).toBe("Hallo Bcc: spam@example.org");
    expect(r.ok && r.data.message).toBe("Zeile 1\nZeile 2 ist lang genug");
  });

  it("does not accept non-string input as content", () => {
    expect(validateContact({ ...valid, name: { toString: () => "x" } }).ok).toBe(false);
  });
});

describe("delivery gate", () => {
  const env = { CONTACT_FORM_ENABLED: "true", RESEND_API_KEY: "re_abc", CONTACT_FROM_EMAIL: "Website <k@example.org>", CONTACT_TO_EMAIL: "c@example.org" };

  it("is open only with every value present and the flag set", () => {
    expect(readDeliveryConfig(env)).toEqual({ apiKey: "re_abc", from: "Website <k@example.org>", to: "c@example.org" });
    expect(readDeliveryConfig({ ...env, CONTACT_FORM_ENABLED: "false" })).toBeNull();
    expect(readDeliveryConfig({ ...env, CONTACT_FORM_ENABLED: undefined })).toBeNull();
    expect(readDeliveryConfig({ ...env, RESEND_API_KEY: undefined })).toBeNull();
    expect(readDeliveryConfig({ ...env, CONTACT_TO_EMAIL: "kein-at" })).toBeNull();
    expect(readDeliveryConfig({ ...env, CONTACT_FROM_EMAIL: "" })).toBeNull();
    expect(readDeliveryConfig({})).toBeNull();
  });

  it.each([
    ["sender with unbalanced bracket", { CONTACT_FROM_EMAIL: "Website <k@example.org" }],
    ["sender with two addresses", { CONTACT_FROM_EMAIL: "a@example.org, b@example.org" }],
    ["recipient list", { CONTACT_TO_EMAIL: "a,b@example.org" }],
    ["recipient with display name", { CONTACT_TO_EMAIL: "Café <c@example.org>" }],
  ])("stays closed for a malformed %s (review finding 4)", (_label, override) => {
    expect(readDeliveryConfig({ ...env, ...override })).toBeNull();
  });

  it("accepts a bare sender address", () => {
    expect(readDeliveryConfig({ ...env, CONTACT_FROM_EMAIL: "kontakt@example.org" })?.from).toBe("kontakt@example.org");
  });
});

describe("handleContactSubmission", () => {
  it("refuses to send when delivery is not configured", async () => {
    const d = deps({ config: null });
    const r = await handleContactSubmission(valid, d);
    expect(r.status).toBe("disabled");
    expect(d.send).not.toHaveBeenCalled();
  });

  it("drops honeypot submissions without sending or claiming success", async () => {
    const d = deps();
    const r = await handleContactSubmission({ ...valid, website: "http://spam.example" }, d);
    expect(r.status).toBe("error");
    expect(d.send).not.toHaveBeenCalled();
    expect(d.log).toHaveBeenCalledWith("honeypot");
  });

  it("returns field errors for invalid input without sending", async () => {
    const d = deps();
    const r = await handleContactSubmission({ ...valid, email: "kaputt" }, d);
    expect(r).toMatchObject({ status: "invalid", fieldErrors: { email: expect.any(String) } });
    expect(d.send).not.toHaveBeenCalled();
  });

  it("sends with the visitor as Reply-To (not as sender) and reports success only after acceptance", async () => {
    const d = deps();
    const r = await handleContactSubmission({ ...valid, requestId: "0f8c2a51-3c9e-4d7b-9a51-1f2e3d4c5b6a" }, d);
    expect(r.status).toBe("success");
    const sent = d.send.mock.calls[0][0];
    expect(sent).toMatchObject({ from: config.from, to: config.to, replyTo: "erika@example.org", idempotencyKey: "kontakt-0f8c2a51-3c9e-4d7b-9a51-1f2e3d4c5b6a" });
    expect(sent.text).toContain(valid.message);
  });

  it("never reports success when the provider rejects or is unreachable", async () => {
    for (const failure of [
      { ok: false as const, reason: "rejected" as const, status: 422 },
      { ok: false as const, reason: "network" as const },
      { ok: false as const, reason: "provider_error" as const, status: 500 },
    ]) {
      const d = deps({ send: vi.fn(async () => failure) });
      const r = await handleContactSubmission(valid, d);
      expect(r.status).toBe("error");
    }
  });

  it("rate-limits repeated submissions from the same client", async () => {
    const limiter = createMemoryLimiter(2, 600);
    const d = deps({ limiter });
    expect((await handleContactSubmission(valid, d)).status).toBe("success");
    expect((await handleContactSubmission(valid, d)).status).toBe("success");
    const third = await handleContactSubmission(valid, d);
    expect(third.status).toBe("error");
    expect(d.send).toHaveBeenCalledTimes(2);
    expect((await handleContactSubmission(valid, deps({ limiter, clientKey: "client-b" }))).status).toBe("success");
  });

  it("falls back to the per-instance limit when the shared limiter is down (review finding 1)", async () => {
    const down = { kind: "shared" as const, hit: async () => { throw new Error("down"); } };
    const d = deps({ limiter: down, fallbackLimiter: createMemoryLimiter(1, 600) });
    expect((await handleContactSubmission(valid, d)).status).toBe("success");
    expect(d.log).toHaveBeenCalledWith("rate_limiter_unavailable");
    // Still limited: the second attempt is refused instead of reaching the provider.
    expect((await handleContactSubmission(valid, d)).status).toBe("error");
    expect(d.send).toHaveBeenCalledTimes(1);
  });

  it("rejects an oversized or non-text honeypot value (review finding 3)", async () => {
    for (const website of ["x".repeat(6000), new Blob(["bot"]), 42]) {
      const d = deps();
      expect((await handleContactSubmission({ ...valid, website }, d)).status).toBe("error");
      expect(d.send).not.toHaveBeenCalled();
    }
  });

  it("rejects oversized and non-text fields instead of dropping them (review finding 3)", async () => {
    const d = deps();
    const oversized = await handleContactSubmission({ ...valid, subject: "x".repeat(6000) }, d);
    expect(oversized).toMatchObject({ status: "invalid", fieldErrors: { subject: expect.any(String) } });
    const fileAsName = await handleContactSubmission({ ...valid, name: new Blob(["x"]) }, d);
    expect(fileAsName).toMatchObject({ status: "invalid", fieldErrors: { name: expect.any(String) } });
    expect(d.send).not.toHaveBeenCalled();
  });

  it("builds an identical payload for an identical retry (review finding 2)", async () => {
    const d = deps({ send: vi.fn(async () => ({ ok: false as const, reason: "network" as const })) });
    const id = "0f8c2a51-3c9e-4d7b-9a51-1f2e3d4c5b6a";
    await handleContactSubmission({ ...valid, requestId: id }, d);
    await handleContactSubmission({ ...valid, requestId: id }, d);
    expect(d.send.mock.calls[0][0]).toEqual(d.send.mock.calls[1][0]);
  });

  it("logs event codes only, never personal data or message text", async () => {
    const d = deps({ send: vi.fn(async () => ({ ok: false as const, reason: "rejected" as const, status: 422 })) });
    await handleContactSubmission(valid, d);
    const logged = JSON.stringify(d.log.mock.calls);
    for (const secret of [valid.name, valid.email, valid.message, config.apiKey]) expect(logged).not.toContain(secret);
  });
});

describe("e-mail content", () => {
  it("is plain text with a clear source line and all fields", () => {
    const { subject, text } = buildContactEmail({
      name: "Erika",
      email: "e@example.org",
      subject: undefined,
      message: "<b>Hallo</b> Welt, bitte melden.",
    });
    expect(subject).toBe("Kontaktformular Website: Nachricht von Erika");
    expect(text).toContain("Kontaktformular der Website (Café am Lindenplatz)");
    expect(text).toContain("<b>Hallo</b>"); // shown literally, never rendered as HTML
    expect(text).toContain("(kein Betreff)");
  });
});

describe("Resend adapter (mocked fetch, no network)", () => {
  const input = { apiKey: "re_key", from: "W <k@example.org>", to: "c@example.org", replyTo: "v@example.org", subject: "S", text: "T", idempotencyKey: "kontakt-1" };

  it("posts the expected request and returns the provider id", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "abc" }), { status: 200 }));
    const r = await sendViaResend(input, fetchMock as unknown as typeof fetch);
    expect(r).toEqual({ ok: true, id: "abc" });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_key");
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe("kontakt-1");
    expect(JSON.parse(init.body as string)).toEqual({ from: input.from, to: ["c@example.org"], reply_to: "v@example.org", subject: "S", text: "T" });
  });

  it.each([
    [422, "rejected"],
    [429, "rate_limited"],
    [500, "provider_error"],
  ])("maps HTTP %i to %s", async (status, reason) => {
    const fetchMock = vi.fn(async () => new Response("{}", { status }));
    expect(await sendViaResend(input, fetchMock as unknown as typeof fetch)).toMatchObject({ ok: false, reason });
  });

  it("treats a 200 without id as failure, and network errors as failure", async () => {
    expect(await sendViaResend(input, (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch)).toMatchObject({ ok: false });
    expect(await sendViaResend(input, (async () => { throw new Error("offline"); }) as unknown as typeof fetch)).toEqual({ ok: false, reason: "network" });
  });
});

describe("Upstash limiter (mocked fetch)", () => {
  it("allows until the shared counter exceeds the limit", async () => {
    let count = 0;
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([{ result: ++count }, { result: 1 }]), { status: 200 }));
    const limiter = createUpstashLimiter("https://example.upstash.io", "token", 2, 600, fetchMock as unknown as typeof fetch);
    expect(await limiter.hit("k")).toBe(true);
    expect(await limiter.hit("k")).toBe(true);
    expect(await limiter.hit("k")).toBe(false);
  });

  it("treats a malformed answer as an outage, never as allowed (review finding 1)", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify([{ error: "ERR" }]), { status: 200 }));
    const limiter = createUpstashLimiter("https://example.upstash.io", "token", 2, 600, fetchMock as unknown as typeof fetch);
    await expect(limiter.hit("k")).rejects.toThrow();
  });
});

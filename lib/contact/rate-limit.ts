/**
 * Rate limiting for the contact form: at most LIMIT submissions per client per WINDOW.
 *
 * - With UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN set, counts are shared across all
 *   serverless instances (Upstash REST API via fetch, no SDK).
 * - Without them, an in-memory counter is used. It only applies within one server instance and
 *   resets on restart or cold start, so on serverless hosting it is a speed bump, NOT reliable
 *   protection. This limitation is documented in ARCHITECTURE.md.
 *
 * Client keys are SHA-256 hashes of the IP address; raw IPs are never stored.
 */

export const LIMIT = 5;
export const WINDOW_SECONDS = 600;

export type RateLimiter = {
  kind: "shared" | "memory";
  /** Records one attempt; returns false when the client is over the limit. */
  hit(key: string): Promise<boolean>;
};

export function createMemoryLimiter(limit = LIMIT, windowSeconds = WINDOW_SECONDS, now = () => Date.now()): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return {
    kind: "memory",
    async hit(key) {
      const t = now();
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
      }
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= t) {
        hits.set(key, { count: 1, resetAt: t + windowSeconds * 1000 });
        return true;
      }
      entry.count += 1;
      return entry.count <= limit;
    },
  };
}

export function createUpstashLimiter(
  url: string,
  token: string,
  limit = LIMIT,
  windowSeconds = WINDOW_SECONDS,
  fetchImpl: typeof fetch = fetch,
): RateLimiter {
  return {
    kind: "shared",
    async hit(key) {
      const redisKey = `kontakt:rl:${key}`;
      // INCR + EXPIRE NX in one pipeline: the window starts with the first hit.
      const response = await fetchImpl(`${url.replace(/\/$/, "")}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["EXPIRE", redisKey, String(windowSeconds), "NX"],
        ]),
        signal: AbortSignal.timeout(3_000),
      });
      if (!response.ok) throw new Error(`rate limiter unavailable (${response.status})`);
      const [incr] = (await response.json().catch(() => [])) as [{ result?: unknown }?];
      // A malformed answer is treated like an outage (the caller falls back), never as "allowed".
      if (typeof incr?.result !== "number") throw new Error("rate limiter returned no counter");
      return incr.result <= limit;
    },
  };
}

export async function hashClientKey(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`kontakt:${ip}`));
  return Array.from(new Uint8Array(digest).slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

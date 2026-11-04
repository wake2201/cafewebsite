import { afterEach, beforeEach, vi } from "vitest";

// No test may reach the network (no real e-mail, no real rate-limit service).
beforeEach(() => {
  vi.stubGlobal("fetch", () => {
    throw new Error("Network access is not allowed in tests; inject a mock fetch instead.");
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

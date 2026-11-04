/**
 * Sanity connection settings. Project ID and dataset are public identifiers (they also ship to
 * the browser for the Studio); reading published content needs no token. Nothing here is secret.
 * Values come from the environment only; no IDs are hardcoded (see .env.example).
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "";
/** Pinned API version for predictable query behaviour (Sanity's documented default as of 2026). */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-01";

/** True only when both identifiers are present and well-formed. */
export const isSanityConfigured = /^[a-z0-9]+$/.test(projectId) && /^[a-z0-9_-]+$/.test(dataset);

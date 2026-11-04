import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "../env";

/**
 * Read-only client for published content. No token: published documents in a public dataset
 * are readable without credentials, so nothing secret is needed on the server or in the browser.
 * `useCdn` serves reads from Sanity's API CDN; Next's own cache (cacheLife "cms") sits on top.
 */
export const sanityClient = isSanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published" })
  : null;

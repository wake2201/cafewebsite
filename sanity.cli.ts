/**
 * Sanity CLI settings (used for `npx sanity cors add`, `npx sanity dataset import/export`).
 * Reads the same public identifiers as the website; see .env.example.
 */
import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
});

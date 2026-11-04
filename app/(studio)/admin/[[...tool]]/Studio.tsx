"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

/** Client boundary for the embedded Studio; only loaded on /admin. */
export function Studio() {
  return <NextStudio config={config} />;
}

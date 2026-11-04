import type { ContactField } from "./validation";

/** What the form shows after a submission attempt. Never "success" without provider acceptance. */
export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "invalid"; fieldErrors: Partial<Record<ContactField, string>> }
  | { status: "error"; message: string }
  | { status: "disabled"; message: string };

export const initialContactState: ContactState = { status: "idle" };

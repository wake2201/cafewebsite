import type { StandingOffer } from "./menu-types";
import { formatPrice } from "./weekly-menu";

/** The italic side note of a standing offer: its time cue and/or price, if the café entered one. */
export function offerAside(offer: StandingOffer): string | undefined {
  const parts = [offer.when, offer.priceEur !== undefined ? formatPrice(offer.priceEur) : undefined].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(", ") : undefined;
}

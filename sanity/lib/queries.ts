/** GROQ queries for the public site. Published documents only (client perspective "published"). */

/** Weekly menus that ended on/after `$since` (a few weeks back is enough for the "last menu" hint). */
export const WEEKLY_MENUS_QUERY = /* groq */ `
*[_type == "weeklyMenu" && defined(validFrom) && defined(validTo) && validTo >= $since]
  | order(validFrom asc) {
    validFrom, validTo, notes,
    days[]{ date, closed, note, dishes[]{ name, description, price } }
  }`;

export const STANDING_OFFERS_QUERY = /* groq */ `
*[_id == "standingOffers"][0]{
  groups[]{ title, items[]{ title, detail, when, price, visible } }
}`;

export const OPENING_HOURS_QUERY = /* groq */ `
*[_id == "openingHours"][0]{
  monday, tuesday, wednesday, thursday, friday, saturday, sunday,
  breakfastFrom, lunchFrom, lunchTo,
  exceptions[]{ from, to, closed, open, close, reason },
  notice{ text, showFrom, showUntil }
}`;

export const CONTACT_INFO_QUERY = /* groq */ `
*[_id == "contactInfo"][0]{ phone, email, street, postalCode, city }`;

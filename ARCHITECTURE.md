# ARCHITECTURE.md — Café am Lindenplatz

Implementation record, maintained by Claude Code. Requirements live in `PROJECT_BRIEF.md`, design direction in `DESIGN.md`.
Last updated: 2026-11-04 (Milestone 3, Sanity CMS and contact backend).

## Stack
- **Next.js 16.4.5** (App Router, Turbopack, Cache Components + Partial Prefetching), **React 19.3**, **TypeScript 5**, npm.
- **Runtime dependencies:** `next`, `react`, `react-dom`, plus for the CMS only: `sanity` 6.22, `next-sanity` 13.4
  (brings `@sanity/client`), `styled-components` 6 (Studio peer), `@sanity/locale-de-de` (German Studio UI).
- **Dev:** ESLint 9 (`eslint-config-next`), `vitest` 4.1 (unit tests; 4.x because 5.x requires `@types/node` ≥ 22).
- **Styling:** plain CSS, tokens in `app/globals.css`, one CSS Module per component/page. No UI kit.
- `next.config.ts`: `agentRules: false` (keeps `next dev` out of the project-owned `AGENTS.md`), AVIF/WebP images,
  `poweredByHeader: false`, and the custom cache profile `cms` (see Caching).

## Directory layout
```
app/
  layout.tsx                 document shell only (html lang="de", fonts, robots noindex)
  not-found.tsx              404 with site chrome
  (site)/layout.tsx          public site: globals.css, skip link, header, main, footer, site metadata
  (site)/page.tsx, speisekarte/, ueber-uns/, kontakt/ (+ actions.ts), impressum/, datenschutz/
  (studio)/admin/[[...tool]]/page.tsx + Studio.tsx   embedded Sanity Studio (or a setup notice)
components/                  SiteChrome, SiteHeader, NavLinks*, SiteFooter, WeeklyMenu + WeeklyMenuView, TodayPanel,
                             OpeningHours, ContactForm*, PageStub          (* = client components)
lib/
  content.ts                 THE entry point for editable data: getWeeklyMenus, getStandingOfferGroups, getOpeningHours, getContactInfo
  site-types.ts, menu-types.ts   content contracts used by components (never Sanity documents directly)
  hours.ts                   pure opening-hours logic (exceptions, next opening, summaries, notices)
  weekly-menu.ts             pure menu selection (current / upcoming / none) and formatters
  cafe.ts                    code-managed identity (name, owner), Berlin date, tel: and directions helpers
  offers.ts                  offer side note (time cue / price)
  contact/                   validation, config gate, handler, e-mail text, Resend adapter, rate limit, form state
sanity/
  env.ts                     project ID / dataset / API version from env; isSanityConfigured
  schemaTypes/               weeklyMenu, standingOffers, openingHours, contactInfo (+ index with singleton IDs)
  structure.ts               the four German Studio entries
  validation.ts              pure validation rules used by the schemas (unit-tested)
  lib/client.ts, queries.ts, mappers.ts   read-only client, GROQ, document → content-type mapping
  seed/initial-content.ndjson   controlled initial import (verified legacy facts, no weekly menu)
sanity.config.ts, sanity.cli.ts
data/                        verified legacy fixtures: used only when Sanity is not configured, and as seed content
tests/                       vitest suites (network blocked in setup.ts)
```

## Routes
| Route | Status | Notes |
|---|---|---|
| `/` | Complete | Hero + Heute panel, menu card, offer board (CMS offers, flattened), collage, visit band |
| `/speisekarte` | Complete | Masthead with CMS breakfast/lunch times, menu card, grouped CMS offers, pre-order band |
| `/ueber-uns` | Complete | Editorial copy in code; address/phone from CMS |
| `/kontakt` | Complete | CMS contact + hours; form sends only when the delivery gate is open |
| `/impressum`, `/datenschutz` | Stubs | Clearly marked as not legally approved |
| `/admin` | CMS | Embedded Studio when configured; otherwise a German "not connected" notice. `noindex`. |

## Content boundaries
| Content | Source of truth | Editable by staff |
|---|---|---|
| Weekly menus | Sanity `weeklyMenu` documents | yes |
| Standing food & drink offers | Sanity `standingOffers` (singleton) | yes |
| Opening hours, holidays, special hours, notice, breakfast/lunch times | Sanity `openingHours` (singleton) | yes |
| Phone, public e-mail, address | Sanity `contactInfo` (singleton) | yes |
| Café name, owner, logo, photos, editorial copy, layout, design, navigation, legal texts | code | no |
| Contact-form sender, recipient, API keys | server environment variables | no (deliberately not in Sanity) |
| Contact messages | not stored anywhere; e-mailed only | – |

### Fallback rules (`lib/content.ts`)
- **Sanity not configured** (no/invalid `NEXT_PUBLIC_SANITY_*`): verified legacy fixtures from `data/`. This keeps
  development and preview builds working; it is not a "connected" state and `/admin` says so.
- **Sanity configured:** Sanity is authoritative. If a singleton (hours, contact, offers) has not been published yet, the
  verified legacy values are shown until it is. **Weekly menus are never substituted:** no published week means the
  "no menu" state. Query **errors are thrown**, so Next keeps serving the last good cached page at runtime and a
  build fails loudly instead of publishing guessed data.

## Sanity integration
- Embedded Studio per the official `next-sanity` guide (`[[...tool]]` catch-all, `'use client'` config,
  `next-sanity/studio` metadata/viewport). Without `export const dynamic = 'force-static'`, which is not allowed
  with Cache Components and unnecessary: the route is prerendered and the Studio loads its data in the browser.
- The `(studio)` route group has no site CSS or chrome; the `(site)` group never loads Studio code. Measured on the
  production build: public pages ≈ 580 KB uncompressed JS with 0 Sanity chunks; `/admin` ≈ 6.2 MB.
- **Studio structure:** Wochenkarte (list, newest first), Speisen & Getränke, Öffnungszeiten & Urlaub, Kontaktdaten.
  Singletons have fixed IDs, cannot be created twice, duplicated or deleted (document actions limited to publish,
  discard, restore). German UI via `@sanity/locale-de-de`; no Vision/query tool.
- **This is navigation, not access control.** On Sanity Free every member who can publish is effectively an
  administrator (can see project settings, invite members, delete documents via the API). Mitigations: one personal
  account per person, strong passwords + 2FA on the login provider, no shared logins, regular dataset exports (below).
- **Validation (in the Studio):** required fields; HH:MM times with close after open; date ranges in order; menu days
  inside the week and unique; prices 0–999 € with ≤ 2 decimals; five-digit postcode; phone characters; e-mail format;
  **no two published weeks may overlap** (async check against published documents).
- **New-week template:** next Monday to Friday prefilled, Wednesday marked closed (the café's current pattern), the
  three standard notes prefilled; everything editable.
- **Future menus:** publish ahead of time; the site shows a week automatically from `validFrom` to `validTo` (Berlin
  dates). No scheduled-publishing feature needed.

### Public queries
GROQ in `sanity/lib/queries.ts`, published perspective, no token: weekly menus ending within the last 6 weeks or later
(enough for the "last menu ended on …" hint); the three singletons by fixed ID. `sanity/lib/mappers.ts` turns results into
`WeeklyMenu`, `StandingOfferGroup[]`, `OpeningHoursData`, `ContactInfo`, dropping incomplete entries instead of inventing
values (e.g. special hours without times count as closed; hidden offers and empty groups are omitted).

## Caching and freshness
- One profile, `cms` = `{ stale: 60, revalidate: 120, expire: 3600 }` seconds, used by every data function and by the
  date-dependent components (`WeeklyMenu`, `TodayPanel`, `OpeningHours`). Pages stay prerendered; after 2 minutes the next
  request refreshes in the background.
- **Published changes appear within about 2–3 minutes** (2 min revalidation + Sanity API CDN propagation + up to 60 s
  client router cache). Date changes (new day, expired week, holiday start) follow the same rhythm.
- No webhooks, so no endpoint to secure. Time-based revalidation is enough for a café; if instant updates are ever
  needed, add a signed Sanity webhook (`next-sanity/webhook` `parseBody` with a secret) calling `revalidateTag`.
- API usage: each cached entry refetches at most every 2 minutes while visited, via the Sanity API CDN; far inside
  Sanity Free quotas.

## Weekly menu model and logic
- `WeeklyMenu { validFrom, validTo, days[], notes[] }`; day `{ date, closed?, note?, dishes[] }`; dish
  `{ name, description?, priceEur? }`. Any number of days and dishes.
- `selectWeeklyMenu` → `current` | `upcoming` (labelled "Vorschau", no "heute" marker) | `none` (names when the last
  week ended). Expired weeks are never returned. Berlin calendar dates via `berlinToday()`.

## Opening hours logic
- Effective hours for a date = matching exception (holiday closure or special hours; later entries win) else the
  weekday pattern. Used by the Heute panel ("Heute geschlossen (Betriebsurlaub). Wieder geöffnet am …") and the hours
  list, which also shows the active notice and exceptions in the next 21 days. Today's dishes only show when the café
  is actually open today.

## Contact form backend
- **Flow:** `ContactForm` (client) → server action `app/(site)/kontakt/actions.ts` → `handleContactSubmission`
  (`lib/contact/handle.ts`) → `sendViaResend` (REST via `fetch`, no SDK). Nothing is stored.
- **Delivery gate** (`lib/contact/config.ts`): sends only if `CONTACT_FORM_ENABLED === "true"` and `RESEND_API_KEY`
  (`re_…`), `CONTACT_FROM_EMAIL` (one mailbox, optional display name with balanced brackets) and `CONTACT_TO_EMAIL`
  (exactly one address) are valid. The page reads the gate on the server and passes only a boolean to the form. The env
  is read at build/render time, so changing it requires a redeploy.
- **Validation (server, authoritative):** required name/e-mail/message/privacy; e-mail format; limits name 100,
  e-mail 200, subject 150, message 10–2000; NFC normalisation; control characters removed; line breaks removed from
  single-line fields (header-injection guard); non-text values (e.g. files) rejected explicitly, never dropped.
- **E-mail:** plain text only, fixed subject prefix "Kontaktformular Website:", source line, all fields; visitor address
  only as `Reply-To`, sender is the configured verified identity. No auto-reply to visitors.
- **Spam/abuse:** honeypot field (`website`, off-screen, `aria-hidden`, any non-empty value rejected without sending and
  without claiming success); rate limit 5 per 10 minutes per client (SHA-256-hashed IP from `x-forwarded-for`/`x-real-ip`).
  - With `UPSTASH_REDIS_REST_URL/TOKEN`: shared across instances. If Upstash is down or answers malformed, the
    per-instance limiter applies instead (never "no limit").
  - Without Upstash: per-instance memory only. **On serverless hosting this is not reliable protection** (each instance
    and cold start has its own counter). Recommended before go-live: Upstash (free tier) or the host's firewall rules.
  - The client IP comes from proxy headers. Vercel sets these itself; on other hosts confirm the proxy overwrites them.
  - No CAPTCHA and no third-party scripts by default.
- **Duplicate submissions:** button disabled while pending; a per-message request id is sent as Resend
  `Idempotency-Key`; an unedited retry reuses it with an identical payload (no timestamp in the body), any edit starts a
  new id. Without JavaScript no id is sent.
- **States:** "success" only after Resend returns a message id (acceptance, not proof of inbox delivery; the copy says
  "abgeschickt"); errors keep the visitor's input and offer the phone number; status is a focused `role="status"` region.
- **Logging:** event codes only (`sent`, `disabled`, `honeypot`, `rate_limited`, `rate_limiter_unavailable`,
  `send_failed` + HTTP status). Never names, addresses, message text or keys.
- **Security review:** a read-only Codex review (M3) found four issues (limiter fail-open, idempotency payload drift,
  silently dropped oversized fields, loose config address checks); all fixed and covered by regression tests.

## Environment variables
See `.env.example` (names and explanations only). Public: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
optional `NEXT_PUBLIC_SANITY_API_VERSION`. Server-only secrets: `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`,
`CONTACT_TO_EMAIL`, `CONTACT_FORM_ENABLED`, optional `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
No Sanity token is needed (published content is read anonymously). Checked: no secret names in browser chunks.

## Setup steps that need the owner (not done; no accounts were created)
1. **Sanity:** create a free account and project at sanity.io/manage (dataset `production`, public), set the two
   `NEXT_PUBLIC_SANITY_*` variables locally and on the host, then add CORS origins with credentials:
   `npx sanity cors add http://localhost:3000 --credentials` and the production URL. Studio schemas need no deploy step.
2. **Initial content (needs explicit approval, writes to the real dataset):**
   `npx sanity dataset import sanity/seed/initial-content.ndjson production --missing`
   (`--missing` skips documents that already exist: no overwrites, no duplicates). Then add the first weekly menu in the Studio.
3. **Members:** invite each staff member with their own login (sanity.io/manage → Members).
4. **Resend:** create an account, verify a sending domain the operator controls (DNS records: needs approval), create a
   sending-only API key, choose the sender address; confirm the café recipient inbox.
5. **Host env:** set the variables from `.env.example`; set `CONTACT_FORM_ENABLED=true` only after an approved test
   message to a clearly identified test inbox.
6. **Rate limiting:** optionally create an Upstash Redis database and set its REST URL/token.

## Backup and recovery
- Sanity keeps document history (restore earlier versions in the Studio; retention per plan).
- Regular exports (e.g. monthly and before larger changes): `npx sanity dataset export production backup-YYYY-MM-DD.tar.gz`,
  stored outside Sanity. Restore with `npx sanity dataset import <file> production --replace` (deliberately, after review).
- Code, schemas, images and seed content are in Git.

## Design system implementation
- Tokens from `DESIGN.md` as CSS custom properties (colours, fluid type scale `--step-*`, spacing, radius 3 px, 180 ms motion).
- Type: **Newsreader** + **DM Sans**, self-hosted variable woff2 (SIL OFL 1.1, `app/fonts/OFL-*.txt`), no Google requests.
- Signature element: the dated Wochenkarte as a printed menu card; italic Newsreader for every time cue.
- Each page section has its own composition (no repeated card grids). One authored motion moment (homepage hero entrance),
  CSS only, disabled under `prefers-reduced-motion`.
- Accessibility basics: skip link, visible focus ring, `aria-current` for nav and today, semantic lists, German alt texts.

## Images
- Statically imported from `public/images` → `next/image` (intrinsic sizes, blur placeholders, AVIF/WebP). Sources ≤ 1200 px.
  Originals unmodified; only the logo trim and favicon crop are derivatives. No hotlinking or stock imagery. Not CMS-editable.

## Testing
`npm test` (vitest): opening-hours logic incl. exceptions and Berlin midnight, menu selection, Sanity mappers and validation
rules, seed file = verified fixtures, contact validation/gate/handler/Resend adapter/limiters with mocked fetch. A global
`fetch` stub makes any real network call fail the test, so tests cannot send e-mail.

## Open items
- Privacy acknowledgement wording and the Datenschutzerklärung (Resend, Sanity, hosting as processors) need legal review.
- Structured data, `metadataBase`/OG image: M6. `robots: noindex` stays until approved go-live (M7).
- `npm audit`: 3 high advisories (`js-yaml`, `smol-toml`, `undici`) in Sanity's CLI tooling tree (`@sanity/cli`), not on
  the public request path; fix requires a Sanity upgrade, re-check when updating.

# ARCHITECTURE.md — Café am Lindenplatz

Implementation record, maintained by Claude Code. Requirements live in `PROJECT_BRIEF.md`, design direction in `DESIGN.md`.
Last updated: 2026-11-04 (Milestone 4, art direction and CSS-first motion).

## Stack
- **Next.js 16.4.5** (App Router, Turbopack, Cache Components + Partial Prefetching), **React 19.3**, **TypeScript 5**, npm.
- **Runtime dependencies:** `next`, `react`, `react-dom`, plus for the CMS only: `sanity` 6.22, `next-sanity` 13.4
  (brings `@sanity/client`), `styled-components` 6 (Studio peer), `@sanity/locale-de-de` (German Studio UI),
  `@sanity/themer` 0.10 (official Studio theming), `@sanity/ui` 4 and `@sanity/icons` 5 (already installed with
  `sanity`, now declared because the Studio components import them).
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
  structure.ts               Studio navigation: overview root pane + the four German areas
  areas.ts                   the four areas (id, title, one-line description, icon)
  theme.ts, locale.ts        Studio theme (@sanity/themer + café fonts) and German text fixes
  components/                StudioOverview (root pane), StudioIcon (logo as workspace icon)
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
- **Studio structure:** root pane = overview (`sanity/components/StudioOverview.tsx`): café logo, the four areas with
  a one-line explanation each (`sanity/areas.ts`), and a read-only status line for the weekly menu (published week for
  today and the next published one, Berlin date). Each area is a `ChildLink`, so it opens as the next pane like a normal
  list item: Wochenkarte (list, newest first), Speisen & Getränke, Öffnungszeiten & Urlaub, Kontaktdaten. URLs stay
  `/admin/structure/<id>` with the same document IDs. Singletons have fixed IDs, cannot be created twice, duplicated or
  deleted (document actions limited to publish, discard, restore). German UI via `@sanity/locale-de-de`; no
  Vision/query tool.
- **Branded admin (Milestone 3.2), documented APIs only, no CSS overrides of Sanity internals:**
  - Theme: `sanity/theme.ts`, `buildTheme` from the official `@sanity/themer` (Studio 6, React 19). Light: accent
    `#905038`, text `#312820`, background `#FFFCF8`; dark: espresso ground with a lighter terracotta (contrast 95 so
    surfaces stay neutral). Fonts swapped on the built theme: DM Sans for text/labels, Newsreader for headings (CSS
    variables from `app/fonts.ts`, self-hosted). Radii `[0,1,2,3,5,8,16]`, focus rings 2px. Both schemes are themed;
    the Studio's own appearance switch still works. Measured AA contrast: muted text 6.3–7.6:1 (light), 5.5–10.5:1 (dark).
  - Workspace icon: the unaltered café logo on its paper ground (`StudioIcon.tsx`), shown in the navbar and login card.
  - Turned off (UI only, no data or permission change): Releases, scheduled drafts, scheduled publishing, tasks and
    field comments (`sanity.config.ts`). Mostly paid-plan features that only added menus and upgrade prompts.
  - German text fixes via `i18n.bundles` (`sanity/locale.ts`): "Neu: Wochenkarte" instead of "Neues Wochenkarte",
    and a translation for the untranslated "Show all {{count}} items".
  - Schema presentation only (stored data and IDs unchanged): date inputs show `DD.MM.YYYY` (the `dddd`/`MMMM` tokens
    rendered English weekday names); Wochenkarte dates side by side (fieldset, 2 columns); dish fields ordered name,
    price, description; each day's list row shows its dish names; weekday hours as "Ruhetag" toggle with both times in a
    row below; offer rows show price and "ausgeblendet"; contact address grouped as "Anschrift".
  - Still Sanity-branded: the login/provider screen ("Choose login provider", Sanity wordmark), account menu, help
    menu and some untranslated or generic labels such as "Element hinzufügen". Not white-labelled; not worth fragile workarounds.
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
- One profile, `cms` = `{ stale: 300, revalidate: 120, expire: 3600 }` seconds (`next.config.ts`), used by every data
  function and by the date-dependent components (`WeeklyMenu`, `TodayPanel`, `OpeningHours`). Pages stay prerendered;
  after 2 minutes the next request refreshes in the background; after an hour without traffic the next request renders
  fresh.
- **Why `stale: 300` (Milestone 3.3):** with Cache Components + Partial Prefetching, Next 16.4 puts cached data into a
  route's App Shell only when its `stale` is at least 5 minutes (bundled docs, `cacheLife` "Prerendering behavior").
  With the former `stale: 60`, every page that awaits CMS data at the top level (all public pages and the shared
  header/footer) blocked client navigation; dev validation reported "uncached data during prerendering or a
  navigation" (dev diagnostic; production still rendered complete pages, but client navigations waited for the server).
  A `<Suspense>` split was tried and rejected: in the prerendered HTML the date-dependent sections then shipped as
  fallbacks swapped in by script, so the homepage's weekly menu and hours were missing without JavaScript.
- **Published changes reach new page loads within about 2–3 minutes** (2 min revalidation + Sanity API CDN
  propagation). A visitor already browsing may reuse a prefetched page for up to 5 minutes during client navigation; a
  reload always gets the server's current version. Date changes (new day, expired week, holiday start) follow the same
  rhythm; the Berlin date is recomputed on every server refresh, never frozen into a long-lived cache.
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
1. **Sanity:** done by the owner (Milestone 3.1, 2026-11-04): project `39r5k6e8`, dataset `production` (public), set
   locally in `.env.local` (git-ignored); still to set on the host. CORS origins with credentials verified for
   `http://localhost:3100` (the project's preview port) and `:3333`; `http://localhost:3000` is NOT allowed, so
   `next dev` on its default port cannot authenticate the Studio. Add the production URL (and `:3000` if used) with
   credentials in sanity.io/manage → API → CORS origins. Studio schemas need no deploy step.
2. **Initial content (needs explicit approval, writes to the real dataset).** Sanity CLI 8.x syntax, after `npx sanity login`:
   `npx sanity datasets import sanity/seed/initial-content.ndjson --dataset production --missing`
   (`--missing` skips documents that already exist: no overwrites, no duplicates). Then add the first weekly menu in the Studio.
3. **Members:** invite each staff member with their own login (sanity.io/manage → Members).
4. **Resend:** create an account, verify a sending domain the operator controls (DNS records: needs approval), create a
   sending-only API key, choose the sender address; confirm the café recipient inbox.
5. **Host env:** set the variables from `.env.example`; set `CONTACT_FORM_ENABLED=true` only after an approved test
   message to a clearly identified test inbox.
6. **Rate limiting:** optionally create an Upstash Redis database and set its REST URL/token.

## Backup and recovery
- Sanity keeps document history (restore earlier versions in the Studio; retention per plan).
- Regular exports (e.g. monthly and before larger changes): `npx sanity datasets export production backup-YYYY-MM-DD.tar.gz`,
  stored outside Sanity. Restore with
  `npx sanity datasets import <file> --dataset production --replace` (deliberately, after review).
- Code, schemas, images and seed content are in Git.

## Design system implementation
- Tokens from `DESIGN.md` as CSS custom properties (colours, fluid type scale `--step-*`, spacing, radius 3 px, 180 ms motion).
- Type: **Newsreader** + **DM Sans**, self-hosted variable woff2 (SIL OFL 1.1, `app/fonts/OFL-*.txt`), no Google requests.
- Signature element: the dated Wochenkarte as a printed menu card; italic Newsreader for every time cue.
- Each page section has its own composition (no repeated card grids).
- **Motion (Milestone 4, CSS-first, no JS):** homepage hero entrance as CSS keyframes in `app/(site)/page.module.css`
  (`hero-rise`, `hero-open`, `hero-settle`; fill `both`, total ≤ 1.6 s). Scroll-linked effects use CSS scroll-driven
  animations (`animation-timeline: view()`) inside `@supports` + `prefers-reduced-motion: no-preference`:
  `party-depth` (homepage Festtafel, `.partyMain` is `align-self: start` so the frame equals the photo). Only
  transforms; overflow-hidden frame; verified cover ≥ 4.6 px at both drift extremes. (`tour-settle` / `tour-follow`
  on the Über uns Rundgang were removed in Milestone 4.3 in favour of `data-reveal="photo"` on both frames; the
  secondary photo tunes the shared window via `--window-inset`, `--window-duration` and `--reveal-delay`.) The global reduced-motion rule in `globals.css` collapses any remaining durations.
- **Interactions and reveals (Milestone 4.1):** shared vocabulary in `app/globals.css` (`.button`, `.text-link`,
  `.text-link-quiet`, `[data-reveal]`, `[data-reveal="photo"]`, `data-reveal-step`); nav underline in
  `SiteHeader.module.css`. Route motion uses one client component, `components/RevealObserver.tsx` (mounted in
  `SiteChrome`, no dependency), revised in Milestone 4.2:
  - *Diagnosis:* on returning to `/`, Next.js renders the homepage again (fresh DOM), so its CSS intro restarted;
    other routes are sometimes restored from a hidden copy instead (`display: none` while the effect runs, every
    rect at top 0), which made reveal decisions inconsistent between link navigation and Back/Forward.
  - *Intros:* `data-intro="<route>"` scopes a page's first-paint CSS entrance. When a route is left, its token is
    added to `<html data-intro-seen>`; CSS rules switch that route's intro off. No timing dependency; a reload
    (new document) plays intros again.
  - *Reveals:* only elements positively placed below the fold get `data-revealed="wait"` (the one hidden state),
    then `animate` on entry and `done` on `animationend`. A per-route index set in module memory marks earlier
    reveals `done` on re-rendered pages; leaving a route clears `wait` and settles `animate`, so restored copies
    neither hide content nor replay. Hidden route copies are skipped (`getClientRects()`), with a few frames' retry.
  - *Visibility thresholds (Milestone 5):* `data-reveal-at="<ratio>"` (the two Über uns Rundgang photos, 0.3) starts
    an element once that share is visible, via its own IntersectionObserver. At setup such an element counts as
    already seen only when its share is visible (or it lies above the viewport); a sliver at the bottom of the first
    screen waits instead, receding over 220 ms (`wait` has a short transition, so it never blinks out). The share is
    capped to 90 % of the viewport height for tall elements on short screens. All other elements keep the top-edge
    rule. Photo windows start from opacity 0, the `wait` value, so they never pop to a partial opacity on trigger.
  Native `animation-timeline: view()` was not used
  for these entrances: it scrubs with scroll position (DESIGN.md forbids scroll-tied opacity), cannot give a fixed
  400 to 650 ms entrance, and is not available in every target browser.
- **GSAP evaluated and removed:** the interrupted Milestone 4 prototype (`gsap`, `@gsap/react`, ScrollTrigger, SplitText,
  client wrappers, a CSS visibility gate with a 3 s failsafe and a `<noscript>` override) added ~49 KB gzip to the homepage
  and needed a client-side gate to avoid a first-paint flash. Removed entirely; `package.json` and the lockfile are back
  to the Milestone 3.3 state. Public pages remain Server Components; no motion code ships to any route or to `/admin`.
- Accessibility basics: skip link, visible focus ring, `aria-current` for nav and today, semantic lists, German alt texts.

## Images
- Statically imported from `public/images` → `next/image` (intrinsic sizes, blur placeholders, AVIF/WebP). Sources ≤ 1200 px.
  Originals unmodified; only the logo trim and favicon crop are derivatives. No hotlinking or stock imagery. Not CMS-editable.
- Where CSS sets `width: 100%; height: auto` on a lazy image, the `height` attribute no longer defines the box, so the
  image gets an explicit `aspect-ratio` from its static import (`style={{ aspectRatio: `${img.width} / ${img.height}` }}`).
  Done for the two homepage party photos (Milestone 3.3, measured CLS 0 at 1440x900 and 390x844) and the two Über uns
  filmstrip photos (Milestone 4); the Rundgang photo sits in a fixed 3:2 frame.
- Milestone 4 photo composition: homepage hero recomposed (headline and introduction share a row from 64 rem, photo at
  9:4 from y ≈ 390 px at 1440x900 instead of 595, "Heute" card overlapping its lower edge; tablets show introduction and
  "Heute" side by side). Über uns: the near-duplicate `tresen-selbstbedienung` replaced by `theke-mit-kuchen` in a
  left-anchored 3:2 crop that excludes the historical chalkboard price; `kuchen-und-canape-platten` (close-up) replaces
  `kaffeetafel-vor-wandlogo` next to the long table, matching the text about Kuchenplatten und Canapés.

## Testing
`npm test` (vitest): opening-hours logic incl. exceptions and Berlin midnight, menu selection, Sanity mappers and validation
rules, seed file = verified fixtures, contact validation/gate/handler/Resend adapter/limiters with mocked fetch. A global
`fetch` stub makes any real network call fail the test, so tests cannot send e-mail.

## Open items
- Privacy acknowledgement wording and the Datenschutzerklärung (Resend, Sanity, hosting as processors) need legal review.
- Structured data, `metadataBase`/OG image: M6. `robots: noindex` stays until approved go-live (M7).
- `npm audit`: 3 high advisories (`js-yaml`, `smol-toml`, `undici`) in Sanity's CLI tooling tree (`@sanity/cli`), not on
  the public request path; fix requires a Sanity upgrade, re-check when updating.

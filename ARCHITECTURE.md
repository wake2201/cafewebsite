# ARCHITECTURE.md — Café am Lindenplatz

Implementation record, maintained by Claude Code. Requirements live in `PROJECT_BRIEF.md`, design direction in `DESIGN.md`.
Last updated: 2026-11-04 (Milestone 2, public pages).

## Stack
- **Next.js 16.4.5** (App Router, Turbopack), **React 19.3**, **TypeScript 5**, npm. Scaffolded with `create-next-app@16.4.5`
  (defaults: Cache Components + Partial Prefetching on). ESLint 9 with `eslint-config-next`.
- **Styling:** plain CSS — global tokens/utilities in `app/globals.css`, one CSS Module per component/page. No Tailwind, no UI kit.
- **No runtime dependencies** beyond `next`, `react`, `react-dom`.
- `next.config.ts`: `agentRules: false` so `next dev` never injects its block into the project-owned `AGENTS.md`; AVIF/WebP image formats; `poweredByHeader: false`.

## Directory layout
```
app/
  layout.tsx            root layout: fonts, skip link, header, footer, metadata (lang="de", robots noindex pre-launch)
  page.tsx (+ .module.css)   homepage
  speisekarte/ ueber-uns/ kontakt/   full pages (M2), each with its own page.module.css
  impressum/ datenschutz/            clearly marked stubs until the legal milestone
  not-found.tsx
  fonts.ts, fonts/      self-hosted woff2 + OFL licence files
  icon.png, apple-icon.png
components/             SiteHeader, NavLinks*, SiteFooter, WeeklyMenu (loader) + WeeklyMenuView (pure view), TodayPanel,
                        OpeningHours, ContactForm*, PageStub, navigation.ts        (* = client components)
data/                   static business data, replaced by Sanity in M3
  weekly-menus.ts       list of dated weekly menus (current, future and past weeks)
  standing-offers.ts    standing offer categories from the legacy site, flat and grouped
lib/
  cafe.ts               business facts, opening hours, Europe/Berlin date helpers  ← fixed facts until Sanity
  menu-types.ts         content contract: WeeklyMenu, WeeklyMenuDay, Dish, WeeklyMenuSelection, StandingOffer(Group)
  weekly-menu.ts        getWeeklyMenus() (data access, becomes a Sanity query), selectWeeklyMenu(), formatters
public/images/{brand,cafe,feiern,speisen}/   curated, descriptively named legacy assets (provenance: CONTENT_INVENTORY.md)
assets/originals/       unmodified source files that are not served directly
```

## Routes
| Route | Status (M2) | Composition |
|---|---|---|
| `/` | Complete (M1.5) | Cover hero + Heute panel, menu card, offer board, photo collage, dark visit band |
| `/speisekarte` | Complete | Typographic masthead with serving times, menu card, standing offers grouped under one wide counter photo, pre-order band |
| `/ueber-uns` | Complete (short by design) | Factual intro, photo "Rundgang", filmstrip of laid tables, sign-off with the café's own tagline |
| `/kontakt` | Complete (form not sending) | Phone number as typographic lead, address/hours/route column, contact form |
| `/impressum` | Stub | Marked as unapproved draft, provider facts only |
| `/datenschutz` | Stub | "In Vorbereitung" |

No navigation link is dead; the two legal stubs say they are unfinished.

## Content boundaries
| Kind | Lives in | Editable later via |
|---|---|---|
| Weekly menus | `data/weekly-menus.ts` | Sanity (M3) |
| Standing offers | `data/standing-offers.ts` | Sanity (M3), only with real item data from the café |
| Opening hours, phone, address | `lib/cafe.ts` | Sanity (M3), plus closure/holiday notices |
| Editorial copy, photos, logo, layout, legal texts | page files, `public/images` | stays in code |
| Contact messages | not stored anywhere | M3 server action sends e-mail only |

## Weekly menu model
- `WeeklyMenu { validFrom, validTo, days[], notes[] }`. A day has `date`, optional `closed`, optional `note`, and any number
  of dishes; a dish has `name`, optional `priceEur`, optional `note`. Weeks may list fewer or more than five days.
- `selectWeeklyMenu(menus, today)` returns `current` (window contains today), else `upcoming` (earliest future week, shown
  with a visible "Vorschau" label and no "heute" marker), else `none` (fallback text naming when the last week ended).
  Expired weeks are never returned. Checked with a date-case table and with a rendered build using an expired week (M2).
- `WeeklyMenuView` is a pure component that takes a selection, so the Sanity switch only replaces `getWeeklyMenus()`.

## Rendering and time-sensitive data
- Server Components everywhere; `NavLinks` is a client component only for `aria-current` (links work without JS).
- With Cache Components, `new Date()` must be inside `"use cache"` or behind `io()`. `WeeklyMenu`, `TodayPanel` and
  `OpeningHours` are `"use cache"` components with short `cacheLife` (revalidate 15 min / 10 min, expire 1 h), so pages stay static/prerendered
  but the date logic re-runs regularly — an expired weekly plan disappears without a rebuild.
- All date logic uses **Europe/Berlin** (`berlinToday()`), independent of server time zone.

## Design system implementation
- Tokens from `DESIGN.md` as CSS custom properties (colours, fluid type scale `--step-*`, spacing, radius 3 px, 180 ms motion).
- Type: **Newsreader** (serif, headings, weekday names, prices context) + **DM Sans** (body/UI). Variable woff2, latin subset
  (includes umlauts, ß, €), via `next/font/local` — no request to Google at build or runtime. Licence: SIL OFL 1.1, files from
  `@fontsource-variable/*@5.3.0`, licence text in `app/fonts/OFL-*.txt`.
- Signature element: the dated **Wochenkarte** set like a printed menu card with today's row highlighted.
- Identity motif: italic Newsreader for every time cue (dates, hours, "Heute"), the menu-card voice repeated across sections.
- Homepage composition (M1.5): each section has its own layout. Cover hero (two-line headline over the wall-logo photo at
  native 1200 px, 2:1 crop desktop / 4:3 mobile, address as figcaption) with a `TodayPanel` (today's hours, today's dish
  from the valid weekly plan, or next opening on Ruhetag); menu card; text-only offer board; asymmetric two-photo
  collage for events; one dark espresso band for visit details. No eyebrows, no coloured side stripes, no card grids.
- Motion (M1.5): one authored moment only, the hero entrance (headline/intro rise, photo unveiled via `clip-path`,
  700–1000 ms, `cubic-bezier(0.16, 1, 0.3, 1)`), wrapped in `prefers-reduced-motion: no-preference` so content is static
  and visible otherwise. Supporting feedback: nav underline grows on hover (`transform: scaleX`), button press offset,
  colour transitions 180 ms. No scroll-triggered animation, no motion library.
- Buttons: one solid primary, one outlined quiet variant (`.button`, `.button-quiet`); 48 px min touch height.
- Accessibility basics: skip link, visible `:focus-visible` ring, `aria-current` on nav and today's menu row,
  semantic `dl`/`ol`/`address`, descriptive German alt texts, `prefers-reduced-motion` respected, no motion beyond hover colour.
- Mobile: header is logo + phone on row one, a plain horizontal nav row below (3 links) — no JS menu toggle needed.

## Images
- Statically imported from `public/images` → `next/image` gets intrinsic sizes, blur placeholders, responsive `srcset`, AVIF/WebP.
- Sources are ≤1200 px wide, so layouts never stretch them full-bleed on large screens. Originals are never modified;
  only the logo got a trimmed derivative and the favicon a crop (see inventory).
- No hotlinking; no third-party or stock imagery.

## Later milestones (planned, not implemented)
### Sanity CMS at `/admin` (M3)
- Sanity Free project, embedded Studio via `next-sanity` on a catch-all route `app/admin/[[...tool]]`.
- Schemas limited to: `weeklyMenu` (validFrom/validTo, days, dishes, prices, closed flag, notes), `standingOffer`
  (category, items, prices, availability — only where the café supplies real data), `openingHours` + `closureNotice`
  (date ranges), `contactInfo` (phone, e-mail, address) as a singleton.
- `lib/cafe.ts` and `lib/weekly-menu.ts` become typed fetchers with the same shapes; components stay unchanged.
  Revalidation via `cacheTag` + a Sanity webhook calling `revalidateTag`, plus the existing short `cacheLife` as a safety net.
- Simplified Studio structure is a UX convenience only; it is **not** an authorisation boundary on Sanity Free.
- Logo, photos, editorial copy, layout and legal texts stay in the repository.

### Contact form (M2 frontend done, sending later)
- M2 state: `components/ContactForm.tsx` renders labelled fields (`name`, `email`, optional `subject`, `message`, `privacy`),
  validates on blur with German messages (`aria-invalid`, `aria-describedby`, polite live region), and has no action and a
  disabled submit button in the server HTML (`SUBMISSION_ENABLED = false`), plus a visible notice with the phone number.
  Nothing is sent or stored; `onSubmit` also calls `preventDefault()` so no data can reach a URL.
- Next: Server Action (or Route Handler) with server-side validation (e.g. zod), honeypot + rate limiting, privacy-acknowledgement
  checkbox, accessible error/success states, progressive enhancement (works without JS).
- Delivery through a transactional e-mail provider (to be chosen; EU data processing preferred) using env-var credentials,
  verified sender domain, `Reply-To` = visitor. No message database. No real sends until recipient + provider are approved.

## Deferred decisions / open items
- JSON-LD `CafeOrCoffeeShop` structured data and `metadataBase`/Open Graph image: deferred until facts and domain are confirmed (M6).
- `robots: noindex` is set globally on purpose; flip at approved go-live (M7).
- Holiday/closure notices: `TodayPanel` and `OpeningHours` know only the weekly pattern; closures arrive with Sanity (M3).
- Hosting (Vercel plan), domain, e-mail provider: pending owner decisions.

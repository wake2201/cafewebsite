# QA_REPORT.md — Milestone 5: Final QA, Security Audit & Launch Readiness

Café am Lindenplatz website. Audit date **2026-11-05** (Thursday). Auditor: Claude Code (Opus 5.5), Claude-only, no Codex
delegation (no isolated backend task justified it; the contact backend had a Codex review in Milestone 3).
Environment: Windows 11, Node 26.13.0, npm 11.20.0, Next.js 16.4.5, React 19.3.0, Sanity 6.22.0, next-sanity 13.4.0.
All browser measurements are **local lab checks** against `next start` on localhost (no throttling, no CDN). There is no
real-user (field) data because the site is not deployed.

Status legend: **PASS** verified with evidence · **FAIL** verified defect · **NOT RUN** not executed · **BLOCKED** could not
be executed in this environment.

---

## A. Executive assessment

| Question | Answer |
|---|---|
| Technical readiness | **Good.** Lint, TypeScript, 66 unit tests and the production build pass; all public routes render complete, correct content without JavaScript; no console errors, no horizontal overflow at 390 / 1024 / 1440 / 1720 px, CLS 0 measured. No P0 code defect found. |
| Ready for **client demonstration** | **Yes**, on a local or access-protected preview. The contact form is visibly disabled with the phone number as the alternative; legal pages are clearly labelled as drafts; `noindex` is active. |
| Ready for **public production launch** | **No.** Blocked by owner/legal and configuration items, not by code defects: no Impressum/Datenschutz approved by the owner, no domain/hosting plan, contact delivery deliberately off, Studio CORS for the production origin, repository visibility, and a data entry to correct in Sanity (see F). |

Most significant risks (in order):
1. **Legal:** `/datenschutz` is an empty placeholder and `/impressum` lacks the required e-mail contact and an approved text. Publishing without them is a legal risk under German law (DDG § 5, DSGVO Art. 13).
2. **Live CMS data:** the only published Wochenkarte runs **02.11.–09.11.2026** (a Monday). Because published weeks may not overlap, the next week (from 09.11.) **cannot be published** until the café corrects "Gültig bis" to 06.11. (or 08.11.). Not a code defect; a Studio warning now flags such entries.
3. **Sanity Free permissions and backups:** every editor who can publish is an administrator; the plan includes no managed backups and only a few days of history. Regular CLI exports are the only real backup.
4. **Public GitHub repository** for a commercial client project (no secrets found, but code, legal drafts and internal docs are world-readable).
5. **Contact rate limit** is per serverless instance unless Upstash (or a firewall rule) is configured before the form is enabled.

---

## B. Findings

Severity: P0 critical (unsafe or unusable), P1 fix before launch/handover, P2 optional.

| # | Issue | Sev | Area | Evidence | Recommendation | Status |
|---|---|---|---|---|---|---|
| 1 | Datenschutzerklärung missing (placeholder text only) | P0 for launch | Legal | `app/(site)/datenschutz/page.tsx`: one "In Vorbereitung" note | Write with legal review once hosting, Resend and Sanity processors are fixed (see §13 list) | Open: owner/legal |
| 2 | Impressum incomplete, unapproved | P0 for launch | Legal | `/impressum` shows name, address, phone only; no e-mail (DDG § 5 requires electronic contact), no approval | Owner supplies/approves data incl. e-mail; legal review | Open: owner/legal |
| 3 | Published weekly menu spans 02.11.–09.11.2026 (8 days) | P1 | CMS data | Read-only GROQ query of the published dataset: `validFrom 2026-11-02, validTo 2026-11-09`, days 02.–06.11. Site shows "2. November bis 9. November 2026"; overlap rule blocks a week starting 09.11. | Café corrects "Gültig bis" to 06.11.2026 in the Studio before entering next week. Not changed by me (no production writes). | Open: owner. Prevention **fixed** (#9) |
| 4 | No HTTP security headers (framing allowed, no nosniff) | P1 | Security | `curl -I` before fix: only Next defaults | Add baseline headers | **Fixed** (C.1) |
| 5 | CMS guide promised restore via history; Sanity Free keeps only a few days | P1 | CMS ops | sanity.io/pricing (checked 2026-11-05): drafts history 3 days, complete history and backups "Not included" on Free | Correct staff guide; operator does monthly CLI exports | **Fixed** (docs) / export routine open |
| 6 | Repository is public | P1 | Hygiene | GitHub API: `"visibility": "public"` | Owner decides; private is appropriate for a client project. Secret scan clean (D.3) | Open: owner approval |
| 7 | Rate limit per instance only without Upstash | P1 (when form is enabled) | Contact | `lib/contact/rate-limit.ts`, `actions.ts` | Configure Upstash Redis or a host firewall rule before `CONTACT_FORM_ENABLED=true` | Open: deferred with email |
| 8 | Sanity Free: all publishers are administrators; only Admin/Viewer roles | P1 (operational) | CMS security | sanity.io/pricing: Free = Administrator + Viewer roles only | Personal accounts, 2FA at login provider, no shared logins, minimum number of admins; documented in CMS_GUIDE | Documented, accepted risk |
| 9 | Studio did not warn about weeks longer than 7 days | P2 | CMS UX | Finding #3 shows the real-world error | Non-blocking validation warning | **Fixed** (C.2) |
| 10 | `npm audit`: 3 high, 24 moderate | P2 (launch risk low) | Dependencies | See D.1; all in Sanity CLI / ESLint tooling | No compatible fix; re-check on next Sanity/Next update; never `audit fix --force` (it would downgrade to Sanity 5) | Documented |
| 11 | No full Content-Security-Policy | P2 | Security | Only `frame-ancestors` set | Nonce-based CSP is a separate tested change (Next inline scripts, Studio styled-components) | Open, optional |
| 12 | Cached "heute" may lag after midnight for at most one visitor | P2 | Freshness | `cms` profile: stale-while-revalidate; first request after midnight can get the pre-midnight render (bounded by `expire` 3600 s); next request is current | Accept (café opens 08:00; no time-of-day "open now" claims exist) | Accepted |
| 13 | Header phone link is 18 px tall at desktop | P2 | A11y (2.5.8) | Measured 109×18 px | Passes the WCAG 2.5.8 spacing exception (isolated target); optional padding | Accepted |
| 14 | Public JS ≈ 180 KB gzip per page | P2 | Performance | gzip of the scripts referenced by `/` and `/kontakt` | Mostly React/Next runtime; only 3 small client components. No action | Accepted |
| 15 | Console warning "CSS preloaded but not used" after client navigation | P2 | Performance | Built-in browser console after link/Back navigation | Next 16 prefetch behaviour, harmless; re-check on Next updates | Accepted |
| 16 | No `robots.txt`, `sitemap.xml`, canonical, OG, structured data | P2 now / P1 at launch | SEO | `/robots.txt`, `/sitemap.xml` → 404; no canonical/OG/JSON-LD | Add at launch with the real domain (§11) | Deferred by design |
| 17 | Stale statements in docs ("revalidates every 10 min", "seven offer categories") | P2 | Docs | CONTENT_INVENTORY §3, §8 | Corrected | **Fixed** |
| 18 | Facts needing owner confirmation | P1 | Content | CONTENT_INVENTORY §6: postcode 06712 vs 06711, opening hours, "Festlichkeiten bis 30 Personen", public e-mail, favicon crop | Confirm at handover | Open: owner |

No P0 **code** defects were found.

---

## C. Fixes implemented (uncommitted, branch `milestone-5-final-qa`)

### C.1 Security headers — `next.config.ts`
`headers()` for `/:path*`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Content-Security-Policy: frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`.
Reason: the signed-in Studio at `/admin` could be framed (clickjacking); nothing on the site needs framing.
Tests: production build PASS; `curl -I` on `/`, `/kontakt`, `/admin` shows all five headers (PASS); public pages render
without console errors (PASS); `/admin` Studio bundle loads and renders its UI with the headers (PASS, see H for the
sign-in limitation). Remaining risk: none known; if a Sanity Presentation/preview iframe is ever added, framing must be
allowed for that origin.

### C.2 Weekly-menu span warning — `sanity/validation.ts`, `sanity/schemaTypes/weeklyMenu.ts`
New `validateMenuSpan`: a **yellow, non-blocking** warning on "Gültig bis" when a menu covers more than 7 days, explaining
that it would block the next week. Publishing stays possible (e.g. a deliberate holiday week).
Tests: new unit test incl. the live 02.–09.11. case (PASS); typecheck/lint PASS. Studio rendering of the warning:
**NOT RUN** (Studio sign-in blocked locally, see H); the rule uses Sanity's documented `rule.custom().warning()` API.

### C.3 Deterministic date-boundary tests — `tests/menu-and-cms.test.ts`
Added: menu switch exactly at Berlin midnight (Friday 23:59:59 CET current, Saturday 00:00 upcoming, Monday current,
after the last week "none"); DST change days 29.03. and 25.10.2026; year end 31.12.→01.01. with weekdays; `addDays`
across a DST weekend. All PASS (66 tests total, previously 62). No code change was needed: the logic was already correct.

### C.4 Documentation
- `CMS_GUIDE.md`: real history limits on Sanity Free; how to avoid a week reaching into the next one.
- `ARCHITECTURE.md`: validation note, backup reality on Sanity Free, audit status, security headers.
- `CONTENT_INVENTORY.md`: removed stale "10 min revalidation" and "seven categories" statements.
- `QA_REPORT.md`: this report.

Not changed (deliberately): animation system, design, images, cache profile, dependencies, Sanity data, legal texts.

---

## D. Security results

### D.1 Dependency advisories (`npm audit`, 2026-11-05)
27 advisories: **3 high, 24 moderate**; `npm audit --omit=dev`: 20 (3 high, 17 moderate), because `sanity` and
`next-sanity` are runtime dependencies (the Studio is part of the app), even though the affected code is CLI tooling.
All packages are at their latest stable versions (`npm outdated`: only React 19.3.1 patch, ESLint/TS/Vitest majors).
npm's suggested fix (`sanity@5.14.1`, `next-sanity@11.6.13`, `eslint-config-next@15.5.29`) is a **downgrade/major
change** and was not applied.

| Package (installed) | Advisories | Dependency path | Where it runs | Reachable here? | Fix | Launch risk |
|---|---|---|---|---|---|---|
| `undici` 7.29.1 (hoisted) | 8 high/moderate: DoS, SRI bypass, TLS option drop, redirect cache poisoning (GHSA-4qv8-2p9j-2685, -f72v-6w45-q472, -xjj6-f33q-929c, -4w7w-5xrc-9h26, -2m5v-pch6-74hx, -qrxm-fqhp-jwvm, -9fm3-97px-rjf6, -55wc-3pg8-jfw6) | `sanity` → `@sanity/cli` → `@sanity/workbench-cli` → `@module-federation/vite` → `@module-federation/dts-plugin` → `undici` | Developer machine (Sanity CLI) | No. The public site's client (`next-sanity` → `@sanity/client` 7.28 → `get-it` 8.8.3) does not use undici; other Sanity packages carry patched 7.30.1 | None upstream yet | Low |
| `js-yaml` 3.13.1 | 5 high/moderate: prototype pollution in merge, quadratic DoS (GHSA-mh29-5h37-fv8m, -h67p-54hq-rp68, -52cp-r559-cp3m, -5p4m-2wfm-xmqj, -2883-xcg3-v3hh) | `@sanity/cli` → `@vercel/frameworks` 3.29 (latest 3.35 still pins 3.13.1) | Sanity CLI framework detection, parses local project files | No untrusted YAML input | None upstream | Low |
| `smol-toml` 1.5.2 | 3 high/moderate DoS (GHSA-v3rj-xjv7-4jmq, -7w5x-hrqm-74c2, -r4xh-jqrq-34v2) | same `@vercel/frameworks` path | Sanity CLI | No untrusted TOML input | None upstream | Low |
| `minimatch` 10.2.6 | moderate DoS (GHSA-g3hv-75wg-m249) | ESLint (`typescript-eslint`) and `@oclif/core` (Sanity CLI) | Dev tooling | No | Via upstream updates | Negligible |
| `@sanity/*`, `@oclif/*`, `next-sanity`, `sanity`, `eslint-config-next`, `typescript-eslint` (moderate) | Inherited from the packages above | — | — | — | — | — |

Conclusion: **no advisory affects the server request path of the public site or browser-delivered code.** Re-check at
every Sanity/Next update. Optional low-risk mitigation if a clean report is wanted: an `overrides` entry pinning
`undici` to ≥ 7.30.1 for `@module-federation/dts-plugin` (patch-level); not applied, because it only affects the CLI and
cannot be meaningfully verified without exercising the Sanity CLI.

### D.2 Configuration, environment and secrets — PASS
- Server-only secrets (`RESEND_API_KEY`, `CONTACT_*`, `UPSTASH_*`) are never `NEXT_PUBLIC_`; `.env*` is git-ignored except
  `.env.example` (names only); `.env.local` contains only the two public Sanity identifiers.
- Build output scan: no secret variable names or `re_…` keys in `.next/static` (PASS).
- Git history scan (all branches): no `.env` file ever committed, no API-key patterns (PASS).
- Sanity project ID `39r5k6e8` appears in ARCHITECTURE.md: a public identifier (shipped to the browser for the Studio), not a secret.
- No Sanity token anywhere; the site reads published content anonymously from a public dataset.

### D.3 Sanity
- Public queries use `perspective: "published"` and no token: drafts are never exposed (dataset is public, so published
  documents are readable by anyone with the project ID, which is the intended model for public menu/hours data). Read-only
  check: 0 drafts exist; document types are only the four schemas.
- Studio access is controlled by Sanity login, not by `/admin`. On Free, roles are Administrator and Viewer only, so every
  editor is an admin (can invite members, change CORS, delete via API). Navigation simplification is UX only.
- CORS: per ARCHITECTURE, `http://localhost:3100` and `:3333` with credentials; production origin must be added at launch.
- No webhooks or write endpoints exist in the app.

### D.4 Contact endpoint — PASS (disabled state)
- Gate: `readDeliveryConfig` returns `null` unless `CONTACT_FORM_ENABLED === "true"` and all values valid; the page passes
  only a boolean. Verified in the browser: submit button `disabled`, form has no `action` when disabled, the notice shows
  the phone number (PASS).
- The server action, if called directly, returns "disabled" before validation, rate limiting or any network call
  (code inspection + unit tests).
- Server validation, honeypot, header-injection guard, idempotency key, event-code-only logging: reviewed, unit-tested
  (`tests/contact.test.ts`), unchanged.
- Weakness: in-memory limiter is per instance (#7). Client IP comes from `x-forwarded-for`'s first entry: safe on Vercel
  (it sets the header); on another host confirm the proxy overwrites it.
- Next.js server actions include an Origin/Host check against cross-site posts (framework default).

### D.5 Third parties — PASS
No external request on any public page (resource timing on all four routes: only `localhost`). Fonts self-hosted (OFL),
no analytics, no map embed (Google Maps is an outbound link only, opened on click), no cookies set by the public site.
`/admin` talks to `*.sanity.io` (expected, staff only).

---

## E. Quality results

### E.1 Next.js / React — PASS
- Build: all public routes prerendered `○` with `revalidate 2m / expire 1h`; `/admin` partial prerender. Cache profile
  `cms { stale: 300, revalidate: 120, expire: 3600 }` is accepted by Next 16.4.5 and matches the documented reasoning
  (ARCHITECTURE "Caching and freshness"); unchanged. Response headers confirm `s-maxage=120, stale-while-revalidate=3480`,
  `x-nextjs-stale-time: 300`.
- Server/Client boundary: only `NavLinks`, `RevealObserver`, `ContactForm` (and the Studio) are client components;
  `server-only` guards the Sanity client and content module. Independent fetches use `Promise.all`
  (vercel-react-best-practices `async-parallel`); no serialization of large data to clients (`server-serialization`).
- No hydration warnings or runtime errors in the console on any route (built-in browser).
- Client navigation via header links works; Back/Forward restore pages without hidden content (PASS).
- Error handling: query errors throw so Next keeps the last good cache; unpublished singletons fall back to verified
  facts; weekly menus never fall back. 404 page has site chrome (`/gibtsnicht` → 404 PASS).
- Content freshness logic: current/upcoming/none, Berlin midnight, DST, year boundary covered by deterministic tests (PASS).
  Holidays/special hours covered by existing tests. Live CMS update propagation: **NOT RUN** (would need a production
  write; requires an authorized manual test).

### E.2 Performance (lab, localhost)
| Route @1440×900 | CLS | LCP | JS (gzip) | External requests |
|---|---|---|---|---|
| `/` | 0 | not captured* | ≈ 180 KB | none |
| `/speisekarte` | 0 | 244 ms (image) | ≈ 180 KB | none |
| `/ueber-uns` | 0 | not captured* | ≈ 180 KB | none |
| `/kontakt` | 0 | not captured* | ≈ 183 KB | none |

\*The built-in browser pane was hidden during most runs, so it rendered as a background page and LCP entries were not
always emitted. No Lighthouse run and no field data: **Core Web Vitals NOT MEASURED** for real users.
Images: `next/image` with static imports (intrinsic width/height, blur placeholder, AVIF/WebP); hero and Über uns
opening photo use `preload`; all other photos `loading="lazy"`; logo eager; sources ≤ 1200 px, ≤ 180 KB. Fonts: three
self-hosted woff2 preloaded via `Link` header. `/admin` ≈ 2 MB gzip JS (Studio, staff only).

### E.3 Accessibility — PASS (automated + manual checks; not a certification)
- One `h1` per page, no skipped levels; landmarks header / nav (2) / main / footer; `lang="de"`; skip link (first Tab
  stop, visible 2 px terracotta outline).
- All images have German alt text; `aria-current` on active nav and today's menu row; form labels, `aria-invalid`,
  `aria-describedby`, focused `role="status"` region; honeypot hidden from AT.
- Focus: global `:focus-visible` outline; form fields replace the outline with a 2 px ring; `main:focus` outline removed
  only for the skip-link target.
- Contrast (antislop checker): muted `#655D55` on ivory 5.7:1, on surface 6.3:1; accent `#905038` 5.46:1; visit band text
  8.0–10.1:1; error `#9B2C1F` 7.4:1. Sage `#6F7660` is 4.17:1 but used only as a border (≥ 3:1 required): PASS.
- Touch targets at 390 px: nav links 48 px tall; only inline text links and the header phone (18 px, isolated) are below 24 px.
- Reduced motion: global `prefers-reduced-motion: reduce` rule plus all entrances inside `no-preference` queries (code
  inspection). Emulated reduced-motion browser run: **NOT RUN** (built-in browser cannot emulate it; playwright-cli blocked).
- Screen-reader run with NVDA/VoiceOver: **NOT RUN**.

### E.4 Responsive — PASS
Checked `/`, `/speisekarte`, `/ueber-uns`, `/kontakt` at 390×844 and 1440×900; `/` and `/kontakt` at 1024×768; `/` at
1720×900: `scrollWidth == clientWidth` everywhere (no horizontal overflow), no clipped text or collisions seen in
screenshots. Mobile: Heute panel at y≈618 px on the homepage; on Speisekarte the Wochenkarte heading is at y≈531 px.
impeccable detector: no layout/type findings at any of these viewports (only `cream-palette`, see H).

### E.5 SEO — partially ready (by design)
Unique titles and descriptions on all routes (`%s – Café am Lindenplatz Zeitz`); semantic headings; internal links all
resolve; `robots: noindex, nofollow` on every page (PASS, must stay). Missing until a domain exists: `metadataBase`,
canonical, OG image, `robots.ts`, `sitemap.ts`, JSON-LD.
**Structured data recommendation:** a `CafeOrCoffeeShop` JSON-LD in the root site layout is worthwhile for local search,
using only: name, address (Röntgenstraße 1, 06712 Zeitz, DE), telephone, `openingHoursSpecification` generated from the
Sanity hours (so it never diverges), `url` = the real domain. No ratings, reviews, price range, social profiles or founding
date. Implement at launch, after the owner confirms the facts.
**How to enable indexing later (only after explicit go-live approval):**
1. `app/layout.tsx`: remove `robots: { index: false, follow: false }` (keep it in `app/(studio)/admin/[[...tool]]/page.tsx`).
2. Add `metadataBase: new URL("https://<real-domain>")` and `alternates: { canonical: "/" }` (per page relative canonicals).
3. Add `app/robots.ts` (allow `/`, disallow `/admin`, sitemap URL) and `app/sitemap.ts` (the four routes + legal pages).
4. Rebuild, deploy, verify `<meta name="robots">` is gone on public pages and present on `/admin`, then submit the
   sitemap in Google Search Console and claim/update the Google Business Profile.

### E.6 CMS — PASS where testable
- Four areas, singletons protected, German UI, validation rules incl. overlap check and the new span warning (code + tests).
- Published/draft separation verified read-only (0 drafts; site queries `published` only).
- Public data matches the site: hours (Mo/Di/Do/Fr 08–17, Mi Ruhetag, Sa/So 14–17), breakfast 08:00, lunch 11:30–14:00,
  phone 03441 2 79 77 78, address, 6 offer entries, no public e-mail, no exceptions or notice.
- Studio sign-in and editing: **BLOCKED** locally (port 3100, the only CORS-allowed origin, was occupied; the server ran
  on 3103 and Sanity refused CORS as expected). Publishing test: **NOT RUN** (needs an authorized manual test on production data).

### E.7 Animations — PASS
Hero entrance, page intros, scroll reveals and photo windows end fully visible; after scrolling every `[data-reveal]`
reached `done`/`animate` with opacity 1; no element left in `wait` above the scroll position; Back to `/` restores the
page at rest (`data-intro-seen="home speisekarte"`, no on-screen element below opacity 1); Forward the same. Without
JavaScript the HTML contains no `data-revealed` state, and the menu, hours and address are in the markup. The accepted
Rundgang limitation (no entrance when the photo is already partly visible at load) is unchanged.
Note: in a hidden browser pane `requestAnimationFrame` does not fire (measured: 1 s timeout), so reveals wait until the
page is shown. That is browser behaviour for background pages, not a site defect.

---

## F. Launch blockers

1. **Technical defects:** none open. (Security headers and the CMS span warning were fixed in this milestone.)
2. **Missing configuration:** production domain + DNS; commercial hosting plan; host environment variables
   (`NEXT_PUBLIC_SANITY_*`); Sanity CORS origin for the production URL (with credentials); Studio member accounts;
   `metadataBase`/robots/sitemap/canonical at go-live; monitoring/error reporting; backup routine.
3. **Legal / owner approvals:** Impressum data (incl. public e-mail) and Datenschutzerklärung with legal review;
   privacy-checkbox wording; confirmation of facts (CONTENT_INVENTORY §6: postcode, hours, party size, favicon crop);
   correction of the 02.–09.11. weekly menu end date; repository visibility; hosting provider choice and DPAs (Vercel,
   Sanity, Resend); go-live approval to remove `noindex`.
4. **Deferred functionality (intentional, not defects):** e-mail delivery via Resend (sender domain, recipient inbox, DNS,
   Upstash rate limit, test send); structured data; optional full CSP.

---

## G. Deployment and handover checklist (in order)

1. **Owner decisions:** repository visibility (recommend private); hosting provider and plan; who maintains the site.
2. **Hosting:** Vercel Hobby is restricted to non-commercial personal use; a site built or hosted for payment counts as
   commercial (vercel.com/docs/limits/fair-use-guidelines, updated 2026-09-14), so this project needs **Pro**:
   $20/month platform fee incl. one deploying seat and $20 usage credit, extra paid seats $20/month each, Viewer seats free
   (vercel.com/docs/plans/pro-plan, 2026-09-15). Check region (EU functions), DPA and costs before signing up. No account
   was created.
3. **Domain/DNS:** confirm who owns `cafeamlindenplatzzeitz.de` (legacy Joomla site) and plan the switch-over; keep the old
   site until the new one is approved.
4. **Environment variables on the host:** `NEXT_PUBLIC_SANITY_PROJECT_ID=39r5k6e8`, `NEXT_PUBLIC_SANITY_DATASET=production`;
   leave `CONTACT_FORM_ENABLED` unset/false until step 9.
5. **Sanity:** add the production origin (and preview origin if used) in sanity.io/manage → API → CORS with credentials;
   invite each staff member personally (Free: max 20 seats, Admin/Viewer roles only); enable 2FA at their login provider;
   remove unused members.
6. **Content:** café corrects the current Wochenkarte end date; confirms hours, postcode, party size, public e-mail.
7. **Legal:** Impressum + Datenschutz texts reviewed and approved; replace the draft notices.
8. **Production build & smoke test** on the preview URL: four routes, 404, `/admin` sign-in, publish a test change only
   with approval (or edit and discard), check it appears within ~3 minutes.
9. **Contact form (when approved):** Resend account, verified sending domain (DNS SPF/DKIM, approval), sending-only API
   key, confirmed recipient inbox, Upstash Redis (or firewall rule), env vars, one approved test message to a clearly
   identified test inbox, then `CONTACT_FORM_ENABLED=true` and redeploy. Update the Datenschutz text for Resend.
10. **Indexing (after explicit go-live approval):** steps in E.5; JSON-LD; Search Console; Google Business Profile.
11. **Monitoring:** host function logs (contact events are logged as codes only), an uptime check, optional error reporting
    (would be a new processor: privacy review first).
12. **Backups:** monthly and before larger changes, `npx sanity datasets export production backup-YYYY-MM-DD.tar.gz`,
    stored outside Sanity; Git remains the backup for code, images and schemas. Restore procedure in ARCHITECTURE.md.
13. **Handover:** CMS_GUIDE.md to staff (short walkthrough); owner keeps admin access to hosting, domain, Sanity and the
    repository (exit path); agree maintenance scope (dependency updates incl. re-running `npm audit`, legal changes,
    backups, menu support).

---

## H. Skills and verification

| Skill | Status | What was applied |
|---|---|---|
| `vercel-react-best-practices` | Loaded (SKILL.md rule index) | Server/Client boundaries, `async-parallel`, `server-serialization`, bundle size, hydration safety, image priority; no regressions found |
| `web-design-guidelines` | Loaded; guidelines fetched from the official `command.md` | Focus, forms (labels, autocomplete, `spellCheck`, inline errors, first-error focus), images (dimensions, lazy/priority), motion (reduced motion, no `transition: all`), touch, typography. Findings folded into E.3 / B |
| `playwright-cli` | Loaded; CLI 0.1.22 installed | **BLOCKED:** it found no Chrome or Edge at the expected paths, and installing browsers needs approval. Replaced by the built-in browser pane |
| `impeccable` | Loaded (`context`, `reference/audit.md`, detector) | Detector on four routes at 390/1024/1280/1720 px: only `cream-palette`, a false positive because DESIGN.md pins `#F5F0E8`. No code changes from it |
| `antislop` | Loaded (core skill + contrast checker) | Review only, as CLAUDE.md and this milestone require. No saved antislop mode, so no antislop-driven edits and no separate `anti-slop/` audit file: findings are in this report. Em dashes: none in UI copy. No fabricated stats, testimonials or claims; nav has no dead links; contrast as in E.3 |
| `frontend-design` | Not loaded: not needed | No confirmed visual defect required design work |
| Codex | Not used | No isolated backend task justified delegation |

Tools and checks: `npm run lint` PASS, `npm run typecheck` PASS, `npm test` PASS (66), `npm run build` PASS (twice),
`npm audit` (run), curl header/status checks, read-only Sanity GROQ queries (API CDN, published perspective), built-in
browser (navigation, JS measurements, screenshots), impeccable detector (headless). Screenshots are not committed
(`.verify/` is git-ignored).
Limitations: browser pane was hidden for most of the run (affects LCP capture and animation screenshots, not layout
measurements); no reduced-motion emulation; no screen-reader test; no real devices; no Lighthouse; Studio sign-in blocked
by CORS on the available port.

---

## I. Git

- Branch: `milestone-5-final-qa`, created from `milestone-4-premium-motion` at **`1e1d904`** (= `origin/main` =
  `origin/milestone-4-premium-motion`, verified with `git ls-remote` on 2026-11-05).
- Changed files (uncommitted): `next.config.ts`, `sanity/validation.ts`, `sanity/schemaTypes/weeklyMenu.ts`,
  `tests/menu-and-cms.test.ts`, `ARCHITECTURE.md`, `CMS_GUIDE.md`, `CONTENT_INVENTORY.md`; new `QA_REPORT.md`.
- Working tree: modified, nothing staged. **No commit, merge, push or deploy** performed. The new branch exists only
  locally (no upstream).
- AKSA Automobile project: not touched.

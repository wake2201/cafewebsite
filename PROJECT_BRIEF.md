# PROJECT_BRIEF.md — Café am Lindenplatz

Owner of brief: ChatGPT / human project owner. Last prepared: 2026-11-04.

## Objective
Deliver a visually exceptional, professionally presentable, sales-ready, maintainable multi-page website for **Café am Lindenplatz**, Zeitz, Germany. This is a real small café and a **single client installation**, not a demo SaaS platform. Code and design should be ready for later handover; do not publish or represent it as the official website without explicit go-live approval.

## Verified public source and source fidelity
- Official legacy website: https://www.cafeamlindenplatzzeitz.de/
- Public contact page: https://www.cafeamlindenplatzzeitz.de/index.php/kontakt
- Public menu page: https://www.cafeamlindenplatzzeitz.de/index.php/speisekarte
- Legacy public contact page lists: Röntgenstraße 1, 06712 Zeitz, Germany; phone +49 (0) 3441 2 79 77 78; owner Kerstin Leithold. Verify accuracy with café before production.
- Legacy homepage lists: Monday–Friday 08:00–17:00 except Wednesday (day off), Saturday–Sunday 14:00–17:00. Verify current schedule and any special closures at handover.
- The legacy homepage lists breakfast from 08:00 according to offer; coffee and tea; weekly-changing food; lunch 11:30–14:00; home-baked cake; cake platters and canapés by pre-order; takeaway by pre-order.
- Legacy menu URL can contain stale/expired weekly plan dates: always distinguish *historical source content* from active menu offerings. Don't show an old week as live in 2026 without verification.
- Existing contact form has name, email, subject, message and a privacy acknowledgement. Replace with a secure email-delivery flow during the relevant milestone.

## Client/user confirmations
- The café owners explicitly authorized reuse of their existing logo, photos and content for this project (as reported by the user). Save source provenance; no third-party reference-site assets.
- Keep their original logo and overall real-world identity.
- Build multi-page (not one-page); use Next.js/React/TypeScript and Warm Editorial / La Cabra-inspired restrained aesthetics.
- The finished website is intended as a full professional product, not an intentionally fake mockup.
- The user prefers to provide ongoing site hosting/maintenance if agreed, but client should have a practical path to transfer/exit.

## Approved functional scope
- Public routes: Home; Speisekarte; Über uns; Kontakt & Anfahrt; Impressum/Datenschutz as necessary.
- Correct real café offer groups and dishes must be carried across; don't add false evening/dinner categories or invented prices. Perform a content/asset inventory before migration.
- **Sanity Free, embedded at `/admin`, is the selected editorial CMS** for a compact, ergonomic workflow. Only business-maintained data are editable:
  1. weekly menu with date range, weekdays, individual dishes/descriptions/prices, closing days and notes; schedule/visibility must avoid stale 'current' claims;
  2. standing food/drink offerings, categories, prices and availability when the source contains real data;
  3. opening hours and temporary closure/holiday notices;
  4. operational contact information (telephone/email/address), with sensible cross-surface consistency.
- Logo, decorative photos, non-menu editorial texts, layout, branding and legal policies stay source-controlled by default.
- Simplified Sanity Studio navigation is a UX convenience, **not an authorization boundary**: on Sanity Free an administrator retains actual admin privileges. Use separate accounts, strong authentication and backups as operational precautions.
- Contact form sends to an authorized café inbox via secure server-side email provider. No bespoke inbox or contact-message database, unless scope later explicitly changes. Validate inputs; implement spam/abuse protection, error/success states, privacy review and delivery verification before go-live.
- Vercel hosting is preferred in principle, with a proper commercial-use plan and provider/privacy/operational cost review before launch. No accounts/expenses/deployment without user permission.

## Explicit exclusions
No full SaaS, multi-tenant support, custom customer auth, self-built CMS, ecommerce, reservation engine, online payments, admin editing of the entire visual website, massive animation library, generic AI-generated images, indiscriminate data extraction beyond authorized café content, or deployment without approval.

## Milestone plan (one milestone at a time)
1. **Project bootstrap, factual content/assets audit, design foundation and homepage v1.** Claude-only by default. Scaffold project without touching AKSA. Create `ARCHITECTURE.md`, `CONTENT_INVENTORY.md`, curated local assets, design tokens/shared primitives and initial polished homepage. Stop with report.
2. Complete public page layouts and source-faithful content: menu, about, contact. Verify responsive and visual consistency.
3. Implement compact Sanity Studio schemas/editor and public consumption of active weekly and standing offers, opening hours and contact fields. Use Codex only if isolated specialist implementation yields real value; sequential integration.
4. Implement/verify email contact form with secure backend and authorized mail provider configuration (may involve Codex handoff if warranted).
5. Visual refinement on real devices/resolutions, responsive navigation, accessibility, media and loading optimizations.
6. Production QA: SEO, structured data, legal/DSGVO checks, actual data, forms, CMS access roles, reliability and backup/recovery.
7. Client-ready handover/deployment planning and go-live **only after explicit approval**.

## Open operational items (not blockers for the first homepage milestone)
- Exact existing photo/logo file URLs, their dimensions and best compositions (audit first).
- Confirmed email inbox/provider and sender-domain verification for delivery.
- Sanity project ID and user account provisioning (no external account creation during milestone 1).
- Hosting commercial plan and domain/DNS ownership.
- Final legal text/processing agreements and actual business approval.
- Complete printed/offline itemized menus not shown on the official website must come from the café if later desired.

## Quality principles
Design-first but factual. Fast mobile experience, semantic accessibility, no needless JS or remote Google Fonts, safe credentials, readable code, decisive and evidenced checks. Weekly data should never silently show an expired plan as if it were current. Preserve content and brand fidelity over visual novelty.

# AGENTS.md — Café am Lindenplatz

## Purpose and authority
This repository is a **single-client, premium café website**, not a SaaS product, website builder, or multi-tenant platform.

Priority: explicit user instructions for the current milestone > `PROJECT_BRIEF.md` (requirements and decisions) > `DESIGN.md` (approved creative direction) > this shared agent policy > ordinary implementation preferences. If two documents conflict, report the conflict rather than silently changing the project's scope. Never interpret a vague instruction as authorization to deploy, purchase, send email, or expose credentials.

**Project direction:** ChatGPT defines numbered milestones, scope, acceptance criteria, and implementation prompts. Human owner approves consequential choices. Claude Code coordinates and implements primarily frontend/integration. OpenAI Codex is optional and, when justified, handles narrowly bounded backend, technical specialist, or review tasks. The user may explicitly assign implementers.

## Hard technical and product decisions
- Next.js App Router + React + TypeScript; multi-page, mobile-first website.
- Four primary public routes: `/`, `/speisekarte`, `/ueber-uns`, `/kontakt`; plus appropriate legal routes.
- Warm editorial creative direction inspired by La Cabra's restraint, **not a copy**. Follow `DESIGN.md`.
- Use the **existing Café am Lindenplatz identity, logo, and authorized photos** from the existing website; the user confirms permission from the owners to reuse their materials. Preserve source attribution/provenance internally; do not copy unrelated third-party media.
- Retain all real existing café offers and menu categories. No invented dishes, prices, stories, certifications, review claims, or other business details. Time-sensitive weekly menus require date context.
- Sanity Free is the preferred CMS, with a narrowly scoped, accessible, customized editor at `/admin`. Editable content: weekly menu, standing food/drink offerings and prices, opening-hours/holiday notices, and operational contact details. Logo, photography, general marketing text, layouts, and legal documents are **not** CMS-editable by default.
- Contact form sends inquiries to the café by email through a secure server-side handler; no own inbox/database for messages. Do not implement real delivery or send test emails without credentials, authorized recipient and approval.
- No unnecessary separate database, custom auth system, commerce, bookings, payments, user registration, multi-tenancy, or analytics.
- Vercel is a preferred hosting candidate, subject to commercial plan, cost, security/privacy and client approval; no deployment without authorization.
- German-language end-user content; English code, technical comments where appropriate, agent reports/prompts.

## Collaboration protocol: STRICTLY SEQUENTIAL
1. **One implementing agent at a time.** Never let Claude and Codex modify the repository concurrently.
2. Claude may develop the frontend until it encounters a backend dependency; then define a bounded delegation contract (objective, input files, permitted paths, API/interface, acceptance criteria, verification).
3. Before handing work to Codex, Claude pauses modifications to the delegated area, records the baseline and relevant outstanding changes, and avoids overlapping edits.
4. If Codex starts a background job, is queued, or returns only a task/job ID, that is **not completion**. Claude must wait for the final actual result and inspect changes before resuming implementation; no concurrent file work while delegated task remains active.
5. Codex must return a handoff: changed files, implemented behavior, tests/checks run and outcomes, known risks, any unfinished work.
6. Claude must inspect actual changes and run only the necessary integration checks before taking over again. A claim of success does not replace verification.
7. If a Codex plugin sandbox cannot run an external CLI/service, Codex should write the relevant implementation or migration files; Claude can later execute the blocked setup/migration/check **sequentially**, after Codex has fully completed. Never claim an external side effect was completed without evidence.
8. If Codex CLI is invoked from a shell, prefer a prompt file to avoid quoting/escaping problems (`--prompt-file` if supported by the installed CLI), and verify commands against installed capabilities. Do not hardcode a model name or assume a feature is available.
9. Codex delegation is **not mandatory**. Avoid invoking it solely to demonstrate a two-AI workflow or consume additional tokens.

## Scope and quality safeguards
- Follow the exact current milestone; do not rush ahead to unrelated pages, database integration, deployment or final launch.
- Inspect the repository before editing. Preserve existing work; do not overwrite or delete files without evaluating them.
- Prefer understandable, maintainable code. No speculative frameworks, dependency sprawl, large animations, generic AI template patterns, or broad refactoring outside scope.
- Server Components by default; Client Components only for real interactivity. Validate untrusted input on the server. Keep credentials in environment variables, never in committed files or browser bundles.
- Design system: typography, spacing, colors, imagery and interactive behavior follow `DESIGN.md`; semantic HTML, keyboard support and visible focus states are required.
- Use local/self-hosted font assets with appropriate licenses; no remotely loaded Google Fonts. Prefer real, authorized photos over stock/AI-generated substitutes. Optimize media without modifying originals irreversibly.
- Implement appropriate SEO metadata and local business structured data only from confirmed information. Keep map embeds and external trackers privacy-conscious.
- The public website must remain coherent without JavaScript when practical; keep mobile performance and reduced-motion preferences in mind.
- Do not copy legal policy text without case-specific review. Legal pages may have clearly marked pre-publication status until approved.

## Tests / verification: proportionate, evidenced
- Choose checks necessary for changes: lint, TypeScript, build, and targeted UI flow/responsive checks. Do not launch exhaustive full suites every milestone.
- When visuals change, inspect real browser screenshots at representative mobile and desktop sizes (e.g. 390×844 and 1440×900), not just development-server output.
- Do not claim a check has run if it has not. Report failures and blockers plainly. Avoid repeated test loops without a concrete reason.

## Completion report — required for each milestone/delegation
Report, concisely:
1. Scope completed and what remains out of scope.
2. Files created/changed (paths) and why.
3. Tests/screenshots actually performed with PASS/FAIL/NOT RUN.
4. Design/content fidelity to `DESIGN.md` and the source café site.
5. Risks, blockers, assumptions and any pending human approval.
6. Specific recommended next milestone; **stop** and wait for explicit instruction before implementing it.

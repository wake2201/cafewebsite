# DESIGN.md — Café am Lindenplatz / Warm Editorial

Status: approved **direction**, not permission to mimic another brand verbatim. Version 1.0, November 2026. Detailed visuals may be refined based on the café's real image assets and user feedback; do not silently change the design direction.

## Creative premise
A welcoming, established neighborhood café in Zeitz presented with the care of a good editorial hospitality website. Warm, tactile, human, confident. Use La Cabra as a reference for visual restraint, quality of composition, typography and photography — **not** its branding, trademark assets, copy, or exact layouts. Avoid pretending this is a Nordic specialty-coffee flagship or an invented luxury chain.

## Brand constraints
- Existing Café am Lindenplatz logo must remain intact. No unauthorized re-drawing or logo substitution.
- Use original, owner-authorized photos from the existing café website. Curate and optimize source photos rather than faking a new venue or using mismatched stock.
- Preserve real names, goods, services and categories; German, human, accessible copy. No fabricated history or claims.
- Overall impression: professional premium craft **without alienating the café's everyday customers**.

## Preliminary design tokens (adjust through evidence-based visual review)
- Background `#F5F0E8` (warm ivory)
- Surface `#FFFCF8` (near-white)
- Text `#312820` (warm espresso)
- Muted text `#655D55`
- Accent `#905038` (terracotta/burnt sienna)
- Secondary accent `#6F7660` (sage/olive)
- Delicate border `#DFD6CB`
- Reserve bright red/green for actual error/success states; don't decorate every component with colors.

Typography strategy: one characterful editorial serif for expressive headlines (candidate: `Newsreader`), one highly readable modern sans for body/nav/forms (candidate: `DM Sans`). Confirm actual license and locally host final font files; revise pairing if it clashes with the original logo. Avoid huge impractical display text on mobile. Use responsive type scale (`clamp`) and sensible line lengths, not arbitrary enormous spacing.

## Layout and composition
- Mobile-first, carefully art-directed desktop. Content max width roughly 1200–1320 px but allow deliberate full-bleed image sections.
- Layout should feel **designed**, not like stacked SaaS cards. Use considered typography, subtle rules and asymmetry where useful.
- Homepage hero: beautiful genuine café photo(s) + legible editorial headline. Preserve focal subject on different screens; no forced full-height hero if that pushes important info too far below the fold.
- Establish hierarchy: atmosphere and identity, weekly menu/food, core offers, personal/local story, visit details and contact CTA.
- Keep current weekly menu easily reachable. Mobile visitors should be able to locate the current week's dishes and opening hours quickly.
- Shared header with readable nav and obvious active state; mobile menu keyboard-accessible, useful route destinations, not dummy anchor links.
- Buttons are purposeful and consistent; avoid repeated large rounded pills or unnecessary CTA duplication.
- The contact page emphasizes practical info and straightforward message form rather than marketing theater.

## Motion and interaction
- Tasteful 120–250 ms microinteraction durations generally; motion supports interaction, not spectacle.
- Respect `prefers-reduced-motion`; avoid scroll-jacking, parallax gimmicks, image zoom-on-scroll, floating decorations, cursor effects, animated gradient background, excessive reveals.
- Menus, buttons and forms must have visible focus styles, proper hover/disabled states and reachable touch targets.

## Image guidance
- Review all legacy photos and select by narrative purpose: venue/arrival, baked cake, plated lunch, atmosphere, personal detail.
- Preserve aspect ratios and avoid awkward cropping or excessive filtering; use responsive `next/image` with proper sizes, LCP priority when necessary.
- Don't repeatedly display a single weak image as an abstract background to fill space. If source imagery is low-resolution, adjust compositions rather than hallucinating replacement photography.
- No hotlinked images in production. Record source page/URL and use local copies. No third-party reference website photography.

## Public pages / UX intentions
1. `/`: refined homepage, visual signature and clear paths to menu/contact; weekly highlights can appear here but must not incorrectly advertise an expired plan.
2. `/speisekarte`: faithful categories and currently valid weekday/week menu, plus all other real food/drink/service offerings shown on the legacy site. Do not invent entire itemized menus from generic overview text. Differentiate standing offers from changing dated items.
3. `/ueber-uns`: real story where verifiable, actual café photos, local personality; no made-up owner interview.
4. `/kontakt`: address, checked opening hours, phone, email when confirmed, accessible contact form, directions/map link without automatic third-party embed.
5. Legal pages: navigable, legible, and clearly not production-approved until the actual business/legal processing data is verified.

## Review rubric
- Is the café recognizable, authentic, and inviting?
- Is the photograph/content hierarchy stronger than a generic template?
- Does mobile support the critical user jobs (weekly menu, hours, find/contact)?
- Are the original brand and warm editorial direction respected?
- Are typography, crop, whitespace and contrast intentional?
- Would the design remain coherent without animation?
- Are source facts, content validity and responsive behavior correct?

Anti-slop is an optional critical lens, not a license to forcibly replace a deliberate design with a template.

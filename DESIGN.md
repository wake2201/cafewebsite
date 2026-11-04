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

### Approved motion system (Milestone 4, CSS-first)
- **No animation library.** A GSAP prototype was built and removed: the required effects do not justify ~49 KB of
  JavaScript, a client-side visibility gate and failure fallbacks. All motion is plain CSS in the page's CSS Module.
- **One authored moment, the homepage hero entrance** (first paint): headline, introduction, CTA and the "Heute" card rise
  0.75 rem with a short stagger (0, 120, 200, 280 ms); the café photo opens from a slight inset like a window onto the
  room while the image settles from 104 % scale. Visually at rest after about 0.6 to 0.8 s, exact by 1.6 s.
- **Scroll-linked photography, progressive enhancement only** (`@supports (animation-timeline: view())`): gentle depth on
  the homepage Festtafel (the image drifts ±2 % inside its frame at 106 % scale). The Über uns Rundgang settle from
  Milestone 4 was replaced in Milestone 4.3 by photo-window reveals (it scrubbed too subtly to read as motion and was
  absent where scroll timelines are unsupported). Never on menus, prices, opening hours or forms.
- **Never hides content:** no opacity or clip changes are tied to scroll; the entrance always runs to its end without
  JavaScript. `prefers-reduced-motion: reduce` disables every animation; unsupported browsers show the static layout.

### Interaction vocabulary (Milestone 4.1)
Six effects, reused site-wide, documented at the top of the interaction block in `app/globals.css`:
1. **Button lift:** espresso to terracotta, 2 px lift and a small soft shadow on hover (pointer devices only), presses
   flat and darker; disabled buttons never move.
2. **Nav underline:** draws in from the left on hover and keyboard focus, leaves to the right; the current page keeps
   its 2 px terracotta rule.
3. **Text-link ink:** `.text-link` shows a quiet rule that is inked in on hover/focus; `.text-link-quiet` (large serif
   phone numbers, footer lists) has no resting rule.
4. **Section rise:** `data-reveal` elements fade and rise 14 px once, 620 ms, when they first enter the viewport;
   stagger via `data-reveal-step` 1 to 3 (90 ms steps).
5. **Photo window:** `data-reveal="photo"` opens a photograph from a slight inset, the hero's own gesture repeated at
   smaller scale (homepage Feiern, Über uns Tafeln, Speisekarte strip).
6. **Scroll depth:** the existing Milestone 4 scroll-linked photo effects, unchanged.

Rules: only genuinely interactive elements get hover feedback (no photo or card on the site is a link, so none zoom);
reveals are time-based and trigger once, never scrubbed by scroll; never on individual dishes, prices, weekdays or
opening-hour rows; none on Kontakt. Reveals hide nothing until a small client script (`components/RevealObserver.tsx`)
is running and has marked everything already on screen as revealed; no JavaScript, reduced motion or print means no
hidden state.

### Motion policy (Milestone 4.2)
- **Once per route and document.** Page intros and scroll reveals play on the first visit of a route; returning by
  link, Back or Forward shows the page at rest. A full reload is a new visit and plays them again.
- **Homepage:** authored hero entrance (unchanged); section reveals for the weekly-menu preview, offer list, Feiern
  photos and text, and the visit band.
- **Speisekarte:** title and introduction rise on first paint (340 ms). Meal times, Wochenkarte, prices, weekdays and
  the standing offers are static; the theke photo opens as a window, plus the "Immer bei uns" heading and pre-order band.
- **Über uns:** title and introduction rise; the opening photograph opens from a slight inset (the page's one intro
  photo moment). Rundgang (Milestone 4.3): the counter view opens as a photo window on first encounter, the back-room
  detail follows 130 ms later with a quieter window (4 % / 3 % inset, 760 ms); both end fully static. The Tafeln photos
  open in turn; the sign-off rises as one. The Rundgang heading and Tafeln text do not fade (generic, repeated).
- **Wochenkarte (Milestone 4.3):** only the heading and the date range move. Homepage: scroll reveal ("soft", 10 px in
  420 ms, range 90 ms later). Speisekarte: part of the first-paint intro (steps 2 and 3, after title and lede), since
  the section is in the first screen there. Days, dishes, prices, dates, "heute", Mittagstisch time and notes are
  always static.
- **Kontakt:** only the title and introduction rise (340 ms). Phone, address, opening hours and form fields are never
  animated; the form is usable from the first frame.
- **Phones:** reveals travel 8 px in 420 ms without stagger, so text is readable sooner while scrolling.

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

# CONTENT_INVENTORY.md — Café am Lindenplatz

Audit of the legacy website **https://www.cafeamlindenplatzzeitz.de/** (Joomla, template "cafe_am_lindenplatz_20191012").
Retrieved **2026-11-04** with plain HTTP requests (all URLs below returned HTTP 200).
Reuse of logo, photos and content is authorised by the café owners as reported by the project owner.

Pages audited: `/` (Startseite), `/index.php/speisekarte`, `/index.php/kontakt`,
`/index.php/11-über-uns` (renders the Impressum), `/index.php/11-über-uns/4-impressum`,
`/index.php/11-über-uns/3-datenschutzerklärung`, `/index.php/11-über-uns/5-so-finden-sie-uns`.

---

## 1. Verified business facts (as published — confirm with café before go-live)

| Fact | Value on legacy site | Source page | Used in code |
|---|---|---|---|
| Name | "Cafe am Lindenplatz"; logo reads *Cafè "Am Lindenplatz"* | all pages, logo | `lib/cafe.ts` (written "Café am Lindenplatz", as in the brief) |
| Owner | Inhaberin Kerstin Leithold | Kontakt, Impressum, logo | yes |
| Address | Röntgenstraße 1, 06712 Zeitz, Sachsen-Anhalt | Kontakt, Impressum | yes |
| Phone | +49 (0) 3441 2 79 77 78 · `tel:+4934412797778` | Startseite, Kontakt, Impressum, poster | yes |
| E-mail | kerstinleithold@web.de (JS-cloaked on Impressum) | Impressum | **no** — not shown until the café confirms which inbox should be public |
| Opening hours | Mo–Fr 08:00–17:00, **Mittwoch Ruhetag**, Sa–So 14:00–17:00 | Startseite sidebar (all pages), poster `plakat_A1_…-02.png` | yes (`openingHours`) |
| Tagline | "das freundliche Team!" | page title, footer | not used yet |
| USt-IdNr. | "keine" | Impressum | no (legal milestone) |
| Bildrechte | Kerstin Leithold | Impressum | provenance note only |

## 2. Offer categories (complete list from the legacy site)

From the Startseite welcome block ("Cafe am Lindenplatz heißt Sie willkommen!") unless noted:

1. Frühstück ab 08:00 Uhr nach Angebot
2. Diverse Kaffee- und Teesorten (source typo: "Diesere Kaffee- Teesorten im Angebot")
3. Diverse Speisen im wöchentlichen Wechsel
4. Mittagstisch von 11:30 bis 14:00 Uhr
5. Hausgebackener Kuchen
6. Kuchenplatten und Canapés auf Bestellung
7. Auch zum Abholen nach Vorbestellung
8. **Festlichkeiten bis 30 Personen möglich** — only on poster image `plakat_A1_cafe_am_lindenplatz-02.png` (Speisekarte page)

No standing itemised food/drink menu, drink list or cake list with prices exists on the website. No evening/dinner offer. Items 1–8 are all shown on the new homepage; nothing else was added.

## 3. Weekly menu ("Speisekarteplan") — time-sensitive

Legacy table on `/index.php/speisekarte`, headed **"Speisekarteplan vom 02.11. - 06.11. 2026"** — this was the *current* week on the audit date.

| Row | Mapped weekday (inferred) | Dish (verbatim) | Price |
|---|---|---|---|
| 1 | Montag 2.11. | Weiße Bohnen Eintopf, Dessert | 6,20 € |
| 2 | Dienstag 3.11. | Sülze, Bratkartoffeln, Beilage | 10,90 € |
| 3 | Mittwoch 4.11. | "Mittwoch: Geschlossen!" | – |
| 4 | Donnerstag 5.11. | Spaghetti Bolognese, Dessert | 10,90 € |
| 5 | Freitag 6.11. | Geschnetzeltes nach Gyros Art, Reis, Beilage | 13,90 € |

Notes on the page: "Änderungen vorbehalten!", "Speisen auch zum mitnehmen, sowie auch Vorbestellungen!", "Bei Fragen zu Allergenen und Zusatzstoffen wenden Sie sich bitte an unser Personal."

- **Ambiguity:** the table has no weekday labels except the Wednesday row. Weekdays are inferred from row order. Confirm with the café.
- **Staleness rule implemented:** `lib/weekly-menu.ts` stores `validFrom/validTo`; the component only shows it while today (Europe/Berlin) is inside that window, otherwise it shows a "not yet entered — please call" notice naming the last known period. The homepage revalidates every 10 min, so this needs no rebuild. **After 2026-11-06 the site will correctly stop showing this plan**; a new week requires either a code edit (now) or Sanity (Milestone 3).

## 4. Asset inventory

All files downloaded unmodified unless stated. Local copies live in `public/images/` (served) or `assets/originals/` (not served).

### Logo / brand
| Source URL | Size | Local file | Use |
|---|---|---|---|
| `/images/cafe_am_lindenplatz/Plakate/plakat_A1_cafe_am_lindenplatz-01.png` | 1000×549 PNG, transparent | `assets/originals/plakat_A1_cafe_am_lindenplatz-01.png` (original) → `public/images/brand/cafe-am-lindenplatz-logo.png` (834×381, transparent margins trimmed only) | Header logo |
| same source | — | `app/icon.png` (512²), `app/apple-icon.png` (180²) | Favicon: **crop** of the cup from the original logo on ivory background — not redrawn. *Needs owner OK* (the legacy favicon is an illegible 16×16 downscale of the full logo). |
| `/templates/cafe_am_lindenplatz_20191012/images/object1220019961.png` | 534×259 PNG | not copied | Smaller duplicate of the logo |

### Photos — interior ("Rundgang" slideshow, all 1200×675 JPEG)
| Source URL (`/images/cafe_am_lindenplatz/slidershow-cafe/…`) | Legacy alt | Content | Local file | Used |
|---|---|---|---|---|
| `cafe_05.jpg` | Rundgang – hinterer Bereich | Gastraum, wall with large café logo, tables | `cafe/gastraum-mit-wandlogo.jpg` | **Homepage hero** |
| `cafe_01.jpg` | Rundgang – Eingang | View along counter with cakes, display case, room | `cafe/theke-mit-kuchen.jpg` | **Homepage "Besuchen Sie uns"** |
| `cafe_02.jpg` | Rundgang – Thresen | Coffee station, chalkboard, cakes under glass | `cafe/theke-kaffeestation.jpg` | reserve |
| `cafe_03.jpg` | Rundgang – mittlerer Bereich | Bar counter "Selbstbedienung", flowers | `cafe/tresen-selbstbedienung.jpg` | reserve |
| `cafe_04.jpg` | Rundgang – mittlerer Bereich | Room with counter and entrance door | `cafe/gastraum-und-tresen.jpg` | reserve |

Note: `cafe_02.jpg` shows a chalkboard "Hausgemachter Kartoffelsalat mit Bockwurst 4,60 €" — historical; must **not** be presented as a current price.

### Photos — gallery (`/media/com_gallery_wd/uploads/…`)
| Source file | Size | Legacy alt | Local file | Used |
|---|---|---|---|---|
| `kuchen-deko-02.jpg` | 800×600 | Gedeckter Tisch mit Kuchen- Wurstplatten 02 | `feiern/kuchen-und-canape-platten.jpg` | **Homepage offers** |
| `kuchen-deko-04.jpg` | 800×600 | … 04 | `feiern/festtafel-an-der-fensterfront.jpg` | **Homepage "Feiern im Café"** |
| `kuchen-deko-01.jpg` | 800×600 | … 01 | `feiern/kaffeetafel-vor-wandlogo.jpg` | reserve |
| `kuchen-deko-03.jpg` | 800×600 | … 03 | `feiern/kaffeetafel-gedeckt.jpg` | reserve |
| `kuchen-deko-05.jpg` | 600×750 | … 05 | `feiern/festtafel-laengs.jpg` | reserve |
| `kuchen-deko-06.jpg` | 600×750 | … 06 | `feiern/kaffeetafel-am-fenster.jpg` | reserve |
| `essen-01.jpg` | 600×750 | Kartoffelsalat mit Schnitzel | `speisen/schnitzel-mit-kartoffelsalat.jpg` | reserve (historical dish) |
| `essen-02.jpg` | 600×750 | Kartoffesuppe mit Wurst | `speisen/kartoffelsuppe-mit-wurst.jpg` | reserve (historical dish) |
| `essen-03.jpg` | 600×750 | Senfsoße mit Ei und Kartoffeln | `speisen/senfsosse-mit-ei-und-kartoffeln.jpg` | reserve (historical dish) |

### Deliberately not used
- `object0.png` (coffee cup with spilled beans) and `object306567849.png` (leaf ornament), `header.png`, `page.jpeg`: template decoration from the Artisteer theme, likely stock — **not** café photography.
- `plakat_A1_…-02.png`: info poster (hours, phone, "Festlichkeiten bis 30 Personen möglich…"); content transcribed, image not reused.
- Joomla UI icons, slider buttons, e-mail icons.

## 5. Missing assets / content gaps
- No exterior/entrance photo (despite alt "Eingang", `cafe_01` shows the interior counter). Needed for "Kontakt & Anfahrt".
- No people/team photo and no verifiable café story — "Über uns" has no source text beyond owner name and tagline.
- No close-up cake photos or breakfast/coffee photos; dish photos are phone shots on a steel counter (usable small, not as large features).
- Photos are low resolution (max 1200 px wide) → layouts avoid full-bleed upscaling.
- No itemised standing menu, drinks list or prices.
- No vector logo (largest is 1000×549 PNG).

## 6. Ambiguous / stale claims to confirm with the café
1. **Postcode:** 06712 on Kontakt/Impressum, but the legacy Google Maps embed searches "Röntgenstraße 1, **06711** Zeitz". Site uses 06712.
2. Weekday mapping of the weekly plan (see §3).
3. Whether hours are still current; holiday/closure dates (none published).
4. Whether breakfast is also offered on weekends (weekend opening starts 14:00, so presumably not).
5. Which e-mail address may be published, and the form recipient.
6. "Festlichkeiten bis 30 Personen" — still offered? only on an older poster image.
7. Legacy Datenschutzerklärung mentions "Cafe vom Lindenplatz" and cookies/tracking — not reused; new legal texts required.
8. "Diverse Speisen im wöchentlichen Wechsel" vs. Mittagstisch — treated as the same weekly lunch offer.

## 7. Where migrated content is used (Milestone 2)
- **Offer categories (§2, items 1 to 7):** homepage board and Speisekarte "Immer bei uns", grouped as Am Morgen und zu Mittag,
  Kaffee und Kuchen, Auf Bestellung. The grouping is editorial; items and wording are unchanged. No item lists or prices added.
- **Weekly menu (§3):** Speisekarte and homepage, with the validity check; Heute panel on the homepage.
- **Lunch hours, breakfast time, takeaway and pre-order note, allergen note:** Speisekarte masthead, menu notes, pre-order band.
- **Address, owner, phone, opening hours:** Kontakt page, footer, homepage visit band.
- **Legacy contact form fields** (name, e-mail, subject, message, privacy acknowledgement): Kontakt form layout; subject now optional.
- **Tagline "das freundliche Team":** Über uns sign-off.
- **"Festlichkeiten bis 30 Personen" (§6.6):** still only on the homepage as before, marked in code as awaiting confirmation.
  Deliberately not repeated on Über uns or Kontakt.
- **Photos:** homepage (gastraum-mit-wandlogo, festtafel-an-der-fensterfront, kaffeetafel-am-fenster); Speisekarte
  (theke-mit-kuchen, bottom-anchored crop so the historical chalkboard price is out of frame); Über uns (gastraum-und-tresen,
  theke-kaffeestation as a left-anchored square crop that excludes the chalkboard, kaffeetafel-vor-wandlogo, festtafel-laengs).
  Not used: the three dish photos (historical dishes), kaffeetafel-gedeckt (near-duplicate), tresen-selbstbedienung.

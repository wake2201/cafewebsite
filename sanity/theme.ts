import { buildTheme } from "@sanity/themer";
import type { RootTheme, ThemeFont, ThemeFonts } from "@sanity/ui/theme";

/**
 * Studio theme in the website's palette (DESIGN.md tokens), built with Sanity's official
 * theming package. Colours come from three inputs per scheme: accent (replaces Sanity's blue:
 * primary buttons, focus rings, links), text (replaces the gray scale: text, icons, borders)
 * and background. Both schemes are themed, so the Studio's own light/dark switch keeps working.
 *
 * Fonts: Sanity UI reads them from the theme object, so the family names are swapped on the
 * built theme. The CSS variables come from next/font in app/layout.tsx (self-hosted, OFL).
 */
const built = buildTheme({
  light: { accent: "#905038", text: "#312820", background: "#FFFCF8" },
  // Dark: espresso ground, warm paper text, a lighter terracotta that keeps contrast on dark.
  // contrast 95 keeps the terracotta out of the text/border scale, otherwise dark surfaces turn olive.
  dark: { accent: "#D49A7C", text: "#EAE3D9", background: "#161311", contrast: 95 },
});

const SANS = 'var(--font-sans), "DM Sans", system-ui, "Segoe UI", Arial, sans-serif';
const SERIF = 'var(--font-serif), Newsreader, Georgia, "Times New Roman", serif';

function withFamily(font: ThemeFont, family: string, weights?: Partial<ThemeFont["weights"]>): ThemeFont {
  return { ...font, family, weights: { ...font.weights, ...weights } };
}

const fonts: ThemeFonts = {
  code: built.fonts.code,
  // Newsreader only for headings (pane and dialog titles); it is the website's editorial voice.
  heading: withFamily(built.fonts.heading, SERIF, { regular: 500, medium: 600, semibold: 600, bold: 650 }),
  label: withFamily(built.fonts.label, SANS),
  text: withFamily(built.fonts.text, SANS),
};

// Slightly tighter corners than stock Sanity, closer to the website's 3px radius.
const radius = [0, 1, 2, 3, 5, 8, 16];

// Stock focus rings are 1px; 2px in the accent colour is clearly visible for keyboard users.
const focusRing = { offset: -1, width: 2 };

export const studioTheme: RootTheme = {
  ...built,
  fonts,
  radius,
  focusRing,
  ...(built.v2
    ? {
        v2: {
          ...built.v2,
          font: fonts,
          radius,
          card: { ...built.v2.card, focusRing },
          button: { ...built.v2.button, focusRing },
          input: { ...built.v2.input, text: { ...built.v2.input.text, focusRing } },
        },
      }
    : {}),
};

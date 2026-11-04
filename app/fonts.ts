import localFont from "next/font/local";

// Self-hosted variable fonts (SIL Open Font License 1.1, see OFL-*.txt in this folder).
// Files from @fontsource-variable/newsreader@5.3.0 and @fontsource-variable/dm-sans@5.3.0,
// latin subset (covers German umlauts, ß and €).

export const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-latin-opsz-normal.woff2", style: "normal", weight: "200 800" },
    { path: "./fonts/newsreader-latin-opsz-italic.woff2", style: "italic", weight: "200 800" },
  ],
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const dmSans = localFont({
  src: [{ path: "./fonts/dm-sans-latin-opsz-normal.woff2", style: "normal", weight: "100 1000" }],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

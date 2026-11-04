import type { Metadata, Viewport } from "next";
import { dmSans, newsreader } from "./fonts";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Café am Lindenplatz Zeitz – Frühstück, Mittagstisch und Kuchen",
    template: "%s – Café am Lindenplatz Zeitz",
  },
  description:
    "Café am Lindenplatz in der Röntgenstraße 1, Zeitz: Frühstück ab 8 Uhr, Mittagstisch mit wöchentlich wechselnden Speisen, hausgebackener Kuchen, Kuchenplatten und Canapés auf Bestellung.",
  // Pre-launch build: keep out of search indexes until go-live is approved (Milestone 7).
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f0e8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${newsreader.variable} ${dmSans.variable}`}>
      <body>
        <a className="skip-link" href="#inhalt">
          Zum Inhalt springen
        </a>
        <SiteHeader />
        <main id="inhalt" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

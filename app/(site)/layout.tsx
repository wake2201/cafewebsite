import type { Metadata, Viewport } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Café am Lindenplatz Zeitz – Frühstück, Mittagstisch und Kuchen",
    template: "%s – Café am Lindenplatz Zeitz",
  },
  description:
    "Café am Lindenplatz in Zeitz: Frühstück, Mittagstisch mit wöchentlich wechselnden Speisen, hausgebackener Kuchen, Kuchenplatten und Canapés auf Bestellung.",
};

export const viewport: Viewport = {
  themeColor: "#f5f0e8",
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteChrome>{children}</SiteChrome>;
}

import type { Metadata, Viewport } from "next";
import { metadata as studioMetadata, viewport as studioViewport } from "next-sanity/studio";
import { isSanityConfigured } from "@/sanity/env";
import { Studio } from "./Studio";

// No `export const dynamic`: with Cache Components the route is static by default, and the
// Studio itself loads its data in the browser.
export const metadata: Metadata = {
  ...studioMetadata,
  title: "Inhalte bearbeiten – Café am Lindenplatz",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { ...studioViewport };

export default function AdminPage() {
  if (!isSanityConfigured) {
    return (
      // Own light surface: the Studio's base styles follow the system dark mode.
      <main
        style={{
          minHeight: "100vh",
          padding: "15vh 1.25rem",
          background: "#f5f0e8",
          color: "#312820",
          colorScheme: "light",
          fontFamily: "system-ui, sans-serif",
          lineHeight: 1.6,
        }}
      >
        <div style={{ maxWidth: "36rem", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.5rem" }}>Inhaltsverwaltung noch nicht verbunden</h1>
        <p>
          Für diese Website ist noch kein Sanity-Projekt eingerichtet. Sobald die Projekt-ID und das Dataset
          hinterlegt sind, können Wochenkarte, Speisen &amp; Getränke, Öffnungszeiten und Kontaktdaten hier bearbeitet
          werden.
        </p>
        <p>Die Einrichtung ist in ARCHITECTURE.md beschrieben.</p>
        </div>
      </main>
    );
  }
  return <Studio />;
}

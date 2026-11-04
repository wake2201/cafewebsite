import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Skip link, header, main landmark and footer shared by all public pages (and the 404 page). */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#inhalt">
        Zum Inhalt springen
      </a>
      <SiteHeader />
      <main id="inhalt" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

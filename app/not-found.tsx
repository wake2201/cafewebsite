import Link from "next/link";
import { PageStub } from "@/components/PageStub";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

// Unmatched URLs render outside the (site) group, so the 404 page brings its own site chrome.
export default function NotFound() {
  return (
    <SiteChrome>
      <PageStub title="Seite nicht gefunden" notice="Diese Adresse gibt es auf unserer Website nicht.">
        <p>
          <Link href="/">Zur Startseite</Link>
        </p>
      </PageStub>
    </SiteChrome>
  );
}

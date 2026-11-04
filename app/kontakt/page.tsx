import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { OpeningHours } from "@/components/OpeningHours";
import { cafe } from "@/lib/cafe";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Kontakt & Anfahrt",
  description:
    "Café am Lindenplatz, Röntgenstraße 1, 06712 Zeitz. Telefon 03441 2 79 77 78, Öffnungszeiten und Route.",
};

/* Practical page by design (DESIGN.md): no photography, no map embed, phone first. */
export default function KontaktPage() {
  return (
    <>
      <header className={`container ${styles.masthead}`}>
        <h1 className={styles.title}>Kontakt &amp; Anfahrt</h1>
        <p className={styles.lede}>Für Vorbestellungen und kurzfristige Fragen rufen Sie uns am besten an.</p>
        <p className={styles.phoneLine}>
          <a href={cafe.phone.href} className={styles.phone}>
            <span className="visually-hidden">Telefon: </span>
            {cafe.phone.display}
          </a>
        </p>
      </header>

      <div className={`container ${styles.grid}`}>
        <aside className={styles.facts} aria-label="Adresse und Öffnungszeiten">
          <section aria-labelledby="adresse">
            <h2 id="adresse" className={styles.factTitle}>
              Adresse
            </h2>
            <address className={styles.address}>
              {cafe.name}
              <br />
              Inhaberin {cafe.owner}
              <br />
              {cafe.address.street}
              <br />
              {cafe.address.postalCode} {cafe.address.city}
            </address>
            <p>
              <a href={cafe.directionsUrl} rel="noopener" target="_blank" className={styles.route}>
                Route in Google Maps öffnen
                <span className="visually-hidden"> (öffnet in neuem Tab)</span>
              </a>
            </p>
          </section>

          <section aria-labelledby="zeiten">
            <h2 id="zeiten" className={styles.factTitle}>
              Öffnungszeiten
            </h2>
            <OpeningHours />
            <p className={styles.small}>
              Frühstück ab {cafe.breakfastFrom} Uhr, Mittagstisch von {cafe.lunch.from} bis {cafe.lunch.to} Uhr.{" "}
              <Link href="/speisekarte">Zur Wochenkarte</Link>
            </p>
          </section>
        </aside>

        <section className={styles.formSection} aria-labelledby="nachricht">
          <h2 id="nachricht" className={styles.formTitle}>
            Nachricht schreiben
          </h2>
          <p className={styles.formIntro}>
            Für Anfragen, die nicht eilen, zum Beispiel zu Kuchenplatten, Canapés oder einer Feier im Café.
          </p>
          <ContactForm />
        </section>
      </div>
    </>
  );
}

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

/*
 * Split editorial page: "how to reach us" on the ivory page (left), the message form on a
 * warm-white sheet that runs to the viewport edge (right). Practical by design (DESIGN.md):
 * no photography, no map embed.
 */
export default function KontaktPage() {
  return (
    <div className={`container ${styles.split}`}>
      <div className={styles.info}>
        <h1 className={styles.title}>Kontakt &amp; Anfahrt</h1>
        <p className={styles.lede}>Für Vorbestellungen und kurzfristige Fragen rufen Sie uns am besten an.</p>

        <p className={styles.phoneBlock}>
          <span className={styles.label}>Telefon</span>
          <a href={cafe.phone.href} className={styles.phone}>
            {cafe.phone.display}
          </a>
        </p>

        <section className={styles.block} aria-labelledby="adresse">
          <h2 id="adresse" className={styles.label}>
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

        <section className={styles.block} aria-labelledby="zeiten">
          <h2 id="zeiten" className={styles.label}>
            Öffnungszeiten
          </h2>
          <OpeningHours />
          <p className={styles.small}>
            Frühstück ab {cafe.breakfastFrom} Uhr, Mittagstisch von {cafe.lunch.from} bis {cafe.lunch.to} Uhr.{" "}
            <Link href="/speisekarte">Zur Wochenkarte</Link>
          </p>
        </section>
      </div>

      <section className={styles.sheet} aria-labelledby="nachricht">
        <h2 id="nachricht" className={styles.formTitle}>
          Nachricht schreiben
        </h2>
        <p className={styles.formIntro}>
          Für Anfragen, die nicht eilen, zum Beispiel zu Kuchenplatten, Canapés oder einer Feier im Café.
        </p>
        <ContactForm />
      </section>
    </div>
  );
}

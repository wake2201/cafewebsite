import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { OpeningHours } from "@/components/OpeningHours";
import { cafe } from "@/lib/cafe";
import { isDeliveryEnabled } from "@/lib/contact/config";
import { getContactInfo, getOpeningHours } from "@/lib/content";
import { formatRange } from "@/lib/hours";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Kontakt & Anfahrt",
  description:
    "Adresse, Telefon, Öffnungszeiten und Route zum Café am Lindenplatz in Zeitz.",
};

/*
 * Split editorial page: "how to reach us" on the ivory page (left), the message form on a
 * warm-white sheet that runs to the viewport edge (right). Practical by design (DESIGN.md):
 * no photography, no map embed.
 */
export default async function KontaktPage() {
  const [contact, hours] = await Promise.all([getContactInfo(), getOpeningHours()]);
  // Server-side gate: env vars are read on the server only; the form gets a boolean, never a secret.
  const deliveryEnabled = isDeliveryEnabled();
  return (
    <div className={`container ${styles.split}`}>
      <div className={styles.info}>
        <h1 className={styles.title}>Kontakt &amp; Anfahrt</h1>
        <p className={styles.lede}>Für Vorbestellungen und kurzfristige Fragen rufen Sie uns am besten an.</p>

        <p className={styles.phoneBlock}>
          <span className={styles.label}>Telefon</span>
          <a href={contact.phone.href} className={styles.phone}>
            {contact.phone.display}
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
            {contact.address.street}
            <br />
            {contact.address.postalCode} {contact.address.city}
          </address>
          {contact.email ? (
            <p>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          ) : null}
          <p>
            <a href={contact.directionsUrl} rel="noopener" target="_blank" className={styles.route}>
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
            {hours.breakfastFrom ? <>Frühstück ab {hours.breakfastFrom} Uhr. </> : null}
            {hours.lunch ? <>Mittagstisch {formatRange(hours.lunch)}. </> : null}
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
        <ContactForm enabled={deliveryEnabled} phone={contact.phone} />
      </section>
    </div>
  );
}

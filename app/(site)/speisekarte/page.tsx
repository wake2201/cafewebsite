import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WeeklyMenu } from "@/components/WeeklyMenu";
import { getContactInfo, getOpeningHours, getStandingOfferGroups } from "@/lib/content";
import { formatRange } from "@/lib/hours";
import { offerAside } from "@/lib/offers";
import theke from "@/public/images/cafe/theke-mit-kuchen.jpg";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Speisekarte",
  description:
    "Wochenkarte mit wechselndem Mittagstisch, Frühstück, Kaffee, Tee und hausgebackener Kuchen im Café am Lindenplatz in Zeitz.",
};

export default async function SpeisekartePage() {
  const [contact, hours, standingOfferGroups] = await Promise.all([
    getContactInfo(),
    getOpeningHours(),
    getStandingOfferGroups(),
  ]);
  return (
    <>
      <header className={`container ${styles.masthead}`}>
        <h1 className={styles.title}>Speisekarte</h1>
        <p className={styles.lede}>
          Jede Woche eine neue Mittagskarte, dazu Frühstück, Kaffee, Tee und Kuchen aus eigener Herstellung.
        </p>
        {hours.breakfastFrom || hours.lunch ? (
          <dl className={styles.times}>
            {hours.breakfastFrom ? (
              <div>
                <dt>Frühstück</dt>
                <dd>ab {hours.breakfastFrom} Uhr</dd>
              </div>
            ) : null}
            {hours.lunch ? (
              <div>
                <dt>Mittagstisch</dt>
                <dd>{formatRange(hours.lunch)}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </header>

      <WeeklyMenu />

      <section className={styles.standing} aria-labelledby="angebot">
        <div className="container">
          <h2 id="angebot" className={styles.sectionTitle} data-reveal>
            Immer bei uns
          </h2>
          <figure className={styles.strip} data-reveal="photo">
            <Image
              src={theke}
              alt="Theke im Café am Lindenplatz mit hausgebackenem Kuchen, Kuchenvitrine und Kaffeemaschinen"
              sizes="(min-width: 80rem) 1200px, 100vw"
              placeholder="blur"
              className={styles.stripImage}
            />
          </figure>
          <div className={styles.groups} data-reveal>
            {standingOfferGroups.map((group, index) => (
              <section key={group.title} className={styles.group} aria-labelledby={`angebot-${index}`}>
                <h3 id={`angebot-${index}`} className={styles.groupTitle}>
                  {group.title}
                </h3>
                <ul className={styles.offerList}>
                  {group.offers.map((offer) => (
                    <li key={offer.title} className={styles.offer}>
                      <span className={styles.offerTitle}>{offer.title}</span>
                      {offerAside(offer) ? <span className={styles.offerWhen}>{offerAside(offer)}</span> : null}
                      {offer.detail ? <span className={styles.offerDetail}>{offer.detail}</span> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <p className={styles.askNote}>
            Welche Kuchen und Getränke es gerade gibt, sehen Sie an der Theke oder erfahren Sie telefonisch.
          </p>
        </div>
      </section>

      <section className={styles.order} aria-labelledby="vorbestellen">
        <div className={`container ${styles.orderGrid}`}>
          <h2 id="vorbestellen" className={styles.orderTitle} data-reveal>
            Vorbestellen und abholen
          </h2>
          <div className={styles.orderText} data-reveal data-reveal-step="1">
            <p>
              Speisen gibt es auch zum Mitnehmen. Kuchenplatten und Canapés bereiten wir auf Bestellung vor. Für
              Vorbestellungen rufen Sie uns am besten an.
            </p>
            <p className={styles.orderActions}>
              <a href={contact.phone.href} className="button">
                Anrufen: {contact.phone.display}
              </a>
              <Link href="/kontakt" className={`${styles.orderLink} text-link`}>
                Öffnungszeiten und Anfahrt
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

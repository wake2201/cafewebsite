import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WeeklyMenu } from "@/components/WeeklyMenu";
import { standingOfferGroups } from "@/data/standing-offers";
import { cafe } from "@/lib/cafe";
import theke from "@/public/images/cafe/theke-mit-kuchen.jpg";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Speisekarte",
  description:
    "Wochenkarte mit Mittagstisch von 11:30 bis 14:00 Uhr, Frühstück ab 8 Uhr, Kaffee, Tee und hausgebackener Kuchen im Café am Lindenplatz in Zeitz.",
};

export default function SpeisekartePage() {
  return (
    <>
      <header className={`container ${styles.masthead}`}>
        <h1 className={styles.title}>Speisekarte</h1>
        <p className={styles.lede}>
          Jede Woche eine neue Mittagskarte, dazu Frühstück, Kaffee, Tee und Kuchen aus eigener Herstellung.
        </p>
        <dl className={styles.times}>
          <div>
            <dt>Frühstück</dt>
            <dd>ab {cafe.breakfastFrom} Uhr</dd>
          </div>
          <div>
            <dt>Mittagstisch</dt>
            <dd>
              {cafe.lunch.from} – {cafe.lunch.to} Uhr
            </dd>
          </div>
        </dl>
      </header>

      <WeeklyMenu />

      <section className={styles.standing} aria-labelledby="angebot">
        <div className="container">
          <h2 id="angebot" className={styles.sectionTitle}>
            Immer bei uns
          </h2>
          <figure className={styles.strip}>
            <Image
              src={theke}
              alt="Theke im Café am Lindenplatz mit hausgebackenem Kuchen, Kuchenvitrine und Kaffeemaschinen"
              sizes="(min-width: 80rem) 1200px, 100vw"
              placeholder="blur"
              className={styles.stripImage}
            />
          </figure>
          <div className={styles.groups}>
            {standingOfferGroups.map((group, index) => (
              <section key={group.title} className={styles.group} aria-labelledby={`angebot-${index}`}>
                <h3 id={`angebot-${index}`} className={styles.groupTitle}>
                  {group.title}
                </h3>
                <ul className={styles.offerList}>
                  {group.offers.map((offer) => (
                    <li key={offer.title} className={styles.offer}>
                      <span className={styles.offerTitle}>{offer.title}</span>
                      {offer.when ? <span className={styles.offerWhen}>{offer.when}</span> : null}
                      <span className={styles.offerDetail}>{offer.detail}</span>
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
          <h2 id="vorbestellen" className={styles.orderTitle}>
            Vorbestellen und abholen
          </h2>
          <div className={styles.orderText}>
            <p>
              Speisen gibt es auch zum Mitnehmen. Kuchenplatten und Canapés bereiten wir auf Bestellung vor. Für
              Vorbestellungen rufen Sie uns am besten an.
            </p>
            <p className={styles.orderActions}>
              <a href={cafe.phone.href} className="button">
                Anrufen: {cafe.phone.display}
              </a>
              <Link href="/kontakt" className={styles.orderLink}>
                Öffnungszeiten und Anfahrt
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

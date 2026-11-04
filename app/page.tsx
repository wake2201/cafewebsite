import Image from "next/image";
import Link from "next/link";
import { TodayPanel } from "@/components/TodayPanel";
import { WeeklyMenu } from "@/components/WeeklyMenu";
import { cafe, openingHoursSummary } from "@/lib/cafe";
import gastraum from "@/public/images/cafe/gastraum-mit-wandlogo.jpg";
import festtafel from "@/public/images/feiern/festtafel-an-der-fensterfront.jpg";
import kaffeetafel from "@/public/images/feiern/kaffeetafel-am-fenster.jpg";
import styles from "./page.module.css";

// Offer groups exactly as listed on the legacy homepage (see CONTENT_INVENTORY.md).
// `when` carries the time cue in the italic menu-card voice; omitted where the source gives none.
const offers: { title: string; detail: string; when?: string }[] = [
  { title: "Frühstück", detail: "nach Angebot", when: `ab ${cafe.breakfastFrom} Uhr` },
  { title: "Kaffee und Tee", detail: "verschiedene Kaffee- und Teesorten" },
  { title: "Mittagstisch", detail: "Speisen im wöchentlichen Wechsel", when: `${cafe.lunch.from} – ${cafe.lunch.to} Uhr` },
  { title: "Hausgebackener Kuchen", detail: "aus eigener Herstellung" },
  { title: "Kuchenplatten und Canapés", detail: "auf Bestellung" },
  { title: "Zum Mitnehmen", detail: "auch zum Abholen nach Vorbestellung" },
];

export default function HomePage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`container ${styles.heroGrid}`}>
          <h1 id="hero-title" className={styles.heroTitle}>
            Frühstück, Mittagstisch und hausgebackener Kuchen
          </h1>
          <div className={styles.heroIntro}>
            <p className={styles.lede}>
              Willkommen im {cafe.name}. Bei uns gibt es Kaffee und Tee, jede Woche wechselnde Speisen zu
              Mittag und Kuchen aus eigener Herstellung, zum Bleiben oder zum Mitnehmen.
            </p>
            <p className={styles.actions}>
              <Link href="#wochenkarte" className="button">
                Wochenkarte ansehen
              </Link>
            </p>
          </div>
          <div className={styles.heroToday}>
            <TodayPanel />
          </div>
          <figure className={styles.heroFigure}>
            <div className={styles.heroFrame}>
              <Image
                src={gastraum}
                alt="Gastraum des Café am Lindenplatz mit gedeckten Tischen und dem Café-Logo an der Wand"
                sizes="(min-width: 80rem) 1200px, 100vw"
                preload
                placeholder="blur"
                className={styles.heroImage}
              />
            </div>
            <figcaption className={styles.caption}>
              Der Gastraum in der {cafe.address.street}, {cafe.address.city}
            </figcaption>
          </figure>
        </div>
      </section>

      <WeeklyMenu />

      <section className={styles.board} aria-labelledby="angebot">
        <div className="container">
          <div className={styles.boardHead}>
            <h2 id="angebot" className={styles.sectionTitle}>
              Was es bei uns gibt
            </h2>
            <Link href="/speisekarte" className={styles.textLink}>
              Zur Speisekarte
            </Link>
          </div>
          <ul className={styles.boardList}>
            {offers.map((offer) => (
              <li key={offer.title} className={styles.boardRow}>
                <span className={styles.boardTitle}>{offer.title}</span>
                <span className={styles.boardDetail}>{offer.detail}</span>
                {offer.when ? <span className={styles.boardWhen}>{offer.when}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.party} aria-labelledby="feiern">
        <div className={`container ${styles.partyGrid}`}>
          <figure className={styles.partyMain}>
            <Image
              src={festtafel}
              alt="Lange, weiß eingedeckte Festtafel im Café mit Platten voller Kuchen und Canapés vor der Fensterfront"
              sizes="(min-width: 56rem) 55vw, 100vw"
              placeholder="blur"
            />
          </figure>
          <div className={styles.partyText}>
            <h2 id="feiern" className={styles.sectionTitle}>
              Feiern im Café
            </h2>
            <p>
              Festlichkeiten bis {cafe.maxPartySize} Personen sind bei uns möglich. Kuchenplatten und
              Canapés bereiten wir auf Bestellung vor.
            </p>
            <p>
              Sprechen Sie uns für Ihren Termin einfach an:{" "}
              <a href={cafe.phone.href} className={styles.inlinePhone}>
                {cafe.phone.display}
              </a>
            </p>
          </div>
          <figure className={styles.partyDetail}>
            <Image
              src={kaffeetafel}
              alt="Gedeckte Kaffeetafel am Fenster mit Kuchenstücken, Canapés und einer roten Rose"
              sizes="(min-width: 56rem) 26vw, 60vw"
              placeholder="blur"
            />
          </figure>
        </div>
      </section>

      <section className={styles.visit} aria-labelledby="besuch">
        <div className={`container ${styles.visitGrid}`}>
          <h2 id="besuch" className={styles.visitTitle}>
            Besuchen Sie uns
          </h2>
          <div className={styles.visitBlock}>
            <h3 className={styles.visitLabel}>Öffnungszeiten</h3>
            <dl className={styles.hours}>
              {openingHoursSummary.map((row) => (
                <div key={row.days}>
                  <dt>{row.days}</dt>
                  <dd>{row.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={styles.visitBlock}>
            <h3 className={styles.visitLabel}>Adresse</h3>
            <address className={styles.address}>
              {cafe.name}
              <br />
              {cafe.address.street}
              <br />
              {cafe.address.postalCode} {cafe.address.city}
            </address>
            <p>
              <a href={cafe.directionsUrl} rel="noopener" target="_blank">
                Route in Google Maps öffnen
                <span className="visually-hidden"> (öffnet in neuem Tab)</span>
              </a>
            </p>
          </div>
          <div className={styles.visitBlock}>
            <h3 className={styles.visitLabel}>Telefon</h3>
            <p>
              <a href={cafe.phone.href} className={styles.visitPhone}>
                {cafe.phone.display}
              </a>
            </p>
            <p className={styles.visitNote}>Vorbestellungen und Fragen gern telefonisch.</p>
            <p>
              <Link href="/kontakt">Kontakt und Anfahrt</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

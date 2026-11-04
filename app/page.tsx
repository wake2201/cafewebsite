import Image from "next/image";
import Link from "next/link";
import { TodayHours } from "@/components/TodayHours";
import { WeeklyMenu } from "@/components/WeeklyMenu";
import { cafe, openingHoursSummary } from "@/lib/cafe";
import gastraum from "@/public/images/cafe/gastraum-mit-wandlogo.jpg";
import platten from "@/public/images/feiern/kuchen-und-canape-platten.jpg";
import festtafel from "@/public/images/feiern/festtafel-an-der-fensterfront.jpg";
import theke from "@/public/images/cafe/theke-mit-kuchen.jpg";
import styles from "./page.module.css";

// Offer groups exactly as listed on the legacy homepage (see CONTENT_INVENTORY.md).
const offers = [
  { title: "Frühstück", text: `Ab ${cafe.breakfastFrom} Uhr nach Angebot.` },
  { title: "Kaffee und Tee", text: "Verschiedene Kaffee- und Teesorten." },
  { title: "Mittagstisch", text: `Von ${cafe.lunch.from} bis ${cafe.lunch.to} Uhr, Speisen im wöchentlichen Wechsel.` },
  { title: "Hausgebackener Kuchen", text: "Aus eigener Herstellung." },
  { title: "Kuchenplatten und Canapés", text: "Auf Bestellung." },
  { title: "Zum Mitnehmen", text: "Auch zum Abholen nach Vorbestellung." },
];

export default function HomePage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`container ${styles.heroGrid}`}>
          <div className={styles.heroText}>
            <p className={styles.place}>
              {cafe.address.street}, {cafe.address.city}
            </p>
            <h1 id="hero-title" className={styles.heroTitle}>
              Frühstück, Mittagstisch und hausgebackener Kuchen
            </h1>
            <p className={styles.lede}>
              Willkommen im {cafe.name}. Bei uns gibt es Kaffee und Tee, jede Woche wechselnde Speisen
              zu Mittag und Kuchen aus eigener Herstellung – zum Bleiben oder zum Mitnehmen.
            </p>
            <TodayHours className={styles.today} />
            <div className={styles.actions}>
              <Link href="#wochenkarte" className="button">
                Wochenkarte ansehen
              </Link>
              <a href={cafe.phone.href} className="button button-quiet">
                Anrufen: {cafe.phone.display}
              </a>
            </div>
          </div>
          <figure className={styles.heroFigure}>
            <Image
              src={gastraum}
              alt="Gastraum des Café am Lindenplatz mit gedeckten Tischen und dem Café-Logo an der Wand"
              sizes="(min-width: 64rem) 58vw, 100vw"
              preload
              placeholder="blur"
              className={styles.heroImage}
            />
          </figure>
        </div>
      </section>

      <WeeklyMenu />

      <section className={styles.offers} aria-labelledby="angebot">
        <div className={`container ${styles.offersGrid}`}>
          <figure className={styles.offersFigure}>
            <Image
              src={platten}
              alt="Eine Platte mit Kuchenstücken und eine Platte mit belegten Canapés auf einem weiß gedeckten Tisch"
              sizes="(min-width: 56rem) 45vw, 100vw"
              placeholder="blur"
            />
            <figcaption>Kuchen- und Canapé-Platten, auf Bestellung</figcaption>
          </figure>
          <div>
            <h2 id="angebot" className={styles.sectionTitle}>
              Was es bei uns gibt
            </h2>
            <dl className={styles.offerList}>
              {offers.map((offer) => (
                <div key={offer.title} className={styles.offer}>
                  <dt>{offer.title}</dt>
                  <dd>{offer.text}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.more}>
              <Link href="/speisekarte">Zur Speisekarte</Link>
            </p>
          </div>
        </div>
      </section>

      <section className={styles.party} aria-labelledby="feiern">
        <div className={`container ${styles.partyGrid}`}>
          <div className={styles.partyText}>
            <h2 id="feiern" className={styles.sectionTitle}>
              Feiern im Café
            </h2>
            <p>
              Festlichkeiten bis {cafe.maxPartySize} Personen sind bei uns möglich. Kuchenplatten und
              Canapés bereiten wir auf Bestellung vor.
            </p>
            <p>Sprechen Sie uns für Ihren Termin einfach an.</p>
            <p>
              <a href={cafe.phone.href} className="button">
                Anrufen: {cafe.phone.display}
              </a>
            </p>
          </div>
          <figure className={styles.partyFigure}>
            <Image
              src={festtafel}
              alt="Lange, weiß eingedeckte Festtafel im Café mit Platten voller Kuchen und Canapés vor der Fensterfront"
              sizes="(min-width: 56rem) 50vw, 100vw"
              placeholder="blur"
            />
          </figure>
        </div>
      </section>

      <section className={styles.visit} aria-labelledby="besuch">
        <div className={`container ${styles.visitGrid}`}>
          <figure className={styles.visitFigure}>
            <Image
              src={theke}
              alt="Blick entlang der Theke mit Kuchen, Kuchenvitrine und Kaffeemaschinen in den hellen Gastraum"
              sizes="(min-width: 56rem) 50vw, 100vw"
              placeholder="blur"
            />
          </figure>
          <div>
            <h2 id="besuch" className={styles.sectionTitle}>
              Besuchen Sie uns
            </h2>
            <div className={styles.visitDetails}>
              <div>
                <h3 className={styles.detailTitle}>Adresse</h3>
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
              <div>
                <h3 className={styles.detailTitle}>Öffnungszeiten</h3>
                <dl className={styles.hours}>
                  {openingHoursSummary.map((row) => (
                    <div key={row.days}>
                      <dt>{row.days}</dt>
                      <dd className="tabular">{row.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div>
                <h3 className={styles.detailTitle}>Telefon</h3>
                <p>
                  <a href={cafe.phone.href} className={styles.phoneLink}>
                    {cafe.phone.display}
                  </a>
                </p>
                <p className={styles.small}>Vorbestellungen und Fragen gern telefonisch.</p>
              </div>
            </div>
            <p className={styles.more}>
              <Link href="/kontakt">Kontakt und Anfahrt</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

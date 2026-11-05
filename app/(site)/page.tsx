import Image from "next/image";
import Link from "next/link";
import { OpeningHours } from "@/components/OpeningHours";
import { SectionLink } from "@/components/SectionLink";
import { TodayPanel } from "@/components/TodayPanel";
import { WeeklyMenu } from "@/components/WeeklyMenu";
import { cafe } from "@/lib/cafe";
import { getContactInfo, getStandingOfferGroups } from "@/lib/content";
import { offerAside } from "@/lib/offers";
import gastraum from "@/public/images/cafe/gastraum-mit-wandlogo.jpg";
import festtafel from "@/public/images/feiern/festtafel-an-der-fensterfront.jpg";
import kaffeetafel from "@/public/images/feiern/kaffeetafel-am-fenster.jpg";
import styles from "./page.module.css";

export default async function HomePage() {
  const [contact, groups] = await Promise.all([getContactInfo(), getStandingOfferGroups()]);
  // The homepage board shows the same CMS offers as the Speisekarte, as one list.
  const offers = groups.flatMap((group) => group.offers);
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title" data-intro="home">
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
              <SectionLink id="wochenkarte" className="button">
                Wochenkarte ansehen
              </SectionLink>
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
              Der Gastraum in der {contact.address.street}, {contact.address.city}
            </figcaption>
          </figure>
        </div>
      </section>

      <WeeklyMenu motion="reveal" />

      <section className={styles.board} aria-labelledby="angebot">
        <div className="container">
          <div className={styles.boardHead} data-reveal>
            <h2 id="angebot" className={styles.sectionTitle}>
              Was es bei uns gibt
            </h2>
            <Link href="/speisekarte" className={`${styles.textLink} text-link`}>
              Zur Speisekarte
            </Link>
          </div>
          <ul className={styles.boardList} data-reveal data-reveal-step="1">
            {offers.map((offer) => (
              <li key={offer.title} className={styles.boardRow}>
                <span className={styles.boardTitle}>{offer.title}</span>
                {offer.detail ? <span className={styles.boardDetail}>{offer.detail}</span> : null}
                {offerAside(offer) ? <span className={styles.boardWhen}>{offerAside(offer)}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.party} aria-labelledby="feiern">
        <div className={`container ${styles.partyGrid}`}>
          <figure className={styles.partyMain} data-reveal="photo">
            <Image
              src={festtafel}
              alt="Lange, weiß eingedeckte Festtafel im Café mit Platten voller Kuchen und Canapés vor der Fensterfront"
              sizes="(min-width: 56rem) 55vw, 100vw"
              placeholder="blur"
              // CSS sets height:auto, which overrides the height attribute; an explicit ratio from the
              // file's own dimensions keeps the box sized before the lazy image loads.
              style={{ aspectRatio: `${festtafel.width} / ${festtafel.height}` }}
            />
          </figure>
          <div className={styles.partyText} data-reveal data-reveal-step="1">
            <h2 id="feiern" className={styles.sectionTitle}>
              Feiern im Café
            </h2>
            {/* Party size comes from an older poster; awaiting owner confirmation (CONTENT_INVENTORY.md §6). */}
            <p>
              Festlichkeiten bis {cafe.maxPartySize} Personen sind bei uns möglich. Kuchenplatten und
              Canapés bereiten wir auf Bestellung vor.
            </p>
            <p>
              Sprechen Sie uns für Ihren Termin einfach an:{" "}
              <a href={contact.phone.href} className={`${styles.inlinePhone} text-link`}>
                {contact.phone.display}
              </a>
            </p>
          </div>
          <figure className={styles.partyDetail} data-reveal="photo" data-reveal-step="2">
            <Image
              src={kaffeetafel}
              alt="Gedeckte Kaffeetafel am Fenster mit Kuchenstücken, Canapés und einer roten Rose"
              sizes="(min-width: 56rem) 26vw, 60vw"
              placeholder="blur"
              style={{ aspectRatio: `${kaffeetafel.width} / ${kaffeetafel.height}` }}
            />
          </figure>
        </div>
      </section>

      <section className={styles.visit} aria-labelledby="besuch">
        <div className={`container ${styles.visitGrid}`}>
          <h2 id="besuch" className={styles.visitTitle} data-reveal>
            Besuchen Sie uns
          </h2>
          <div className={styles.visitBlock} data-reveal data-reveal-step="1">
            <h3 className={styles.visitLabel}>Öffnungszeiten</h3>
            <OpeningHours tone="dark" />
          </div>
          <div className={styles.visitBlock} data-reveal data-reveal-step="2">
            <h3 className={styles.visitLabel}>Adresse</h3>
            <address className={styles.address}>
              {cafe.name}
              <br />
              {contact.address.street}
              <br />
              {contact.address.postalCode} {contact.address.city}
            </address>
            <p>
              <a href={contact.directionsUrl} rel="noopener" target="_blank" className="text-link">
                Route in Google Maps öffnen
                <span className="visually-hidden"> (öffnet in neuem Tab)</span>
              </a>
            </p>
          </div>
          <div className={styles.visitBlock} data-reveal data-reveal-step="3">
            <h3 className={styles.visitLabel}>Telefon</h3>
            <p>
              <a href={contact.phone.href} className={`${styles.visitPhone} text-link text-link-quiet`}>
                {contact.phone.display}
              </a>
            </p>
            <p className={styles.visitNote}>Vorbestellungen und Fragen gern telefonisch.</p>
            <p>
              <Link href="/kontakt" className="text-link">
                Kontakt und Anfahrt
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

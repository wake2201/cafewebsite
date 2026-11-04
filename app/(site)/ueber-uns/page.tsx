import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cafe } from "@/lib/cafe";
import { getContactInfo } from "@/lib/content";
import gastraum from "@/public/images/cafe/gastraum-und-tresen.jpg";
import kaffeestation from "@/public/images/cafe/theke-kaffeestation.jpg";
import theke from "@/public/images/cafe/theke-mit-kuchen.jpg";
import platten from "@/public/images/feiern/kuchen-und-canape-platten.jpg";
import festtafel from "@/public/images/feiern/festtafel-laengs.jpg";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Das Café am Lindenplatz in der Röntgenstraße 1 in Zeitz, geführt von Inhaberin Kerstin Leithold: ein Rundgang durch Gastraum und Theke.",
};

/*
 * Content rule for this page: only facts from the legacy website (CONTENT_INVENTORY.md).
 * No founding date, history, staff stories or quotes exist in the source, so none are shown.
 * The party size from the older poster is deliberately not repeated here (awaiting confirmation).
 */
export default async function UeberUnsPage() {
  const contact = await getContactInfo();
  return (
    <>
      <header className={`container ${styles.intro}`}>
        <div className={styles.introText}>
          <h1 className={styles.title}>Über uns</h1>
          <p className={styles.lede}>
            Das {cafe.name} liegt in der {contact.address.street} in {contact.address.city} und wird von Inhaberin{" "}
            {cafe.owner} geführt.
          </p>
          <p>
            Bei uns gibt es Frühstück, einen Mittagstisch mit wöchentlich wechselnden Speisen, Kaffee, Tee und
            hausgebackenen Kuchen. Vieles davon auch zum Mitnehmen.
          </p>
        </div>
        {/* Shown whole at its native 16:9: no object-fit crop in the opening composition. */}
        <figure className={styles.introFigure}>
          <Image
            src={gastraum}
            alt="Heller Gastraum mit Holzboden, Tischen mit Blumen, dem Tresen und der Eingangstür im Hintergrund"
            sizes="(min-width: 80rem) 790px, (min-width: 64rem) 62vw, 100vw"
            preload
            placeholder="blur"
          />
          <figcaption>Der Gastraum mit Tresen</figcaption>
        </figure>
      </header>

      <section className={styles.tour} aria-labelledby="rundgang">
        <div className="container">
          <h2 id="rundgang" className={styles.sectionTitle}>
            Ein Rundgang
          </h2>
          {/* Milestone 4: the long view down the counter replaces a near-duplicate of the opening photo.
              Left-anchored 3:2 crop: the chalkboard with a historical price (right edge) stays out of frame. */}
          <div className={styles.tourGrid}>
            <figure className={styles.tourMain}>
              <div className={styles.tourFrame}>
                <Image
                  src={theke}
                  alt="Lange Theke mit Kuchen, Kaffeemaschine und Kuchenvitrine, dahinter Tische an der Fensterfront"
                  sizes="(min-width: 56rem) 62vw, 100vw"
                  placeholder="blur"
                  className={styles.tourImage}
                />
              </div>
              <figcaption>Entlang der Theke bis zur Fensterfront</figcaption>
            </figure>
            <figure className={styles.tourSide}>
              <div className={styles.squareFrame}>
                <Image
                  src={kaffeestation}
                  alt="Kuchenvitrine, Regale mit Gläsern und Tassen und die Kaffeemaschine an der Theke"
                  sizes="(min-width: 56rem) 30vw, 100vw"
                  placeholder="blur"
                  className={styles.squareImage}
                />
              </div>
              <figcaption>Kuchenvitrine und Kaffeestation an der Theke</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className={styles.tables} aria-labelledby="tafeln">
        <div className={`container ${styles.tablesGrid}`}>
          <div className={styles.tablesText}>
            <h2 id="tafeln" className={styles.sectionTitle}>
              Gedeckte Tafeln
            </h2>
            <p>
              Für Feiern decken wir die Tafel im Café. Kuchenplatten und Canapés gibt es auf Bestellung. Fragen
              Sie uns gern nach den Möglichkeiten für Ihren Anlass.
            </p>
            <p>
              <a href={contact.phone.href} className={styles.phone}>
                {contact.phone.display}
              </a>
            </p>
          </div>
          {/* The close-up shows what the text promises (Kuchenplatten und Canapés), next to the long table. */}
          <div className={styles.filmstrip}>
            <figure>
              <Image
                src={platten}
                alt="Platten mit Kuchenstücken und belegten Canapés auf einer weiß gedeckten Tafel"
                sizes="(min-width: 56rem) 40vw, 60vw"
                placeholder="blur"
                style={{ aspectRatio: `${platten.width} / ${platten.height}` }}
              />
            </figure>
            <figure>
              <Image
                src={festtafel}
                alt="Lange Festtafel mit weißen Tischdecken, Gedecken, Rosen und Platten mit Kuchen und Canapés"
                sizes="(min-width: 56rem) 24vw, 40vw"
                placeholder="blur"
                style={{ aspectRatio: `${festtafel.width} / ${festtafel.height}` }}
              />
            </figure>
          </div>
        </div>
      </section>

      <section className={styles.signoff} aria-label="Besuch">
        <div className={`container ${styles.signoffInner}`}>
          <p className={styles.signoffLine}>Wir freuen uns auf Ihren Besuch.</p>
          <p className={styles.signature}>Ihr {cafe.name}, das freundliche Team</p>
          <p className={styles.links}>
            <Link href="/speisekarte">Zur Speisekarte</Link>
            <Link href="/kontakt">Kontakt und Anfahrt</Link>
          </p>
        </div>
      </section>
    </>
  );
}

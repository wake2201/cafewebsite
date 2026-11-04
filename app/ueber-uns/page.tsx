import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cafe } from "@/lib/cafe";
import gastraum from "@/public/images/cafe/gastraum-und-tresen.jpg";
import kaffeestation from "@/public/images/cafe/theke-kaffeestation.jpg";
import tresen from "@/public/images/cafe/tresen-selbstbedienung.jpg";
import kaffeetafel from "@/public/images/feiern/kaffeetafel-vor-wandlogo.jpg";
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
export default function UeberUnsPage() {
  return (
    <>
      <header className={`container ${styles.intro}`}>
        <div className={styles.introText}>
          <h1 className={styles.title}>Über uns</h1>
          <p className={styles.lede}>
            Das {cafe.name} liegt in der {cafe.address.street} in {cafe.address.city} und wird von Inhaberin{" "}
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
          <div className={styles.tourGrid}>
            <figure className={styles.tourMain}>
              <Image
                src={tresen}
                alt="Tresen mit Blumen, Obstkorb und Regalen voller Gläser, davor ein Tisch mit einer Rose"
                sizes="(min-width: 56rem) 62vw, 100vw"
                placeholder="blur"
              />
              <figcaption>Am Tresen</figcaption>
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
              <a href={cafe.phone.href} className={styles.phone}>
                {cafe.phone.display}
              </a>
            </p>
          </div>
          <div className={styles.filmstrip}>
            <figure>
              <Image
                src={kaffeetafel}
                alt="Weiß eingedeckte Kaffeetafel mit Kuchen- und Canapé-Platten vor der Wand mit dem Café-Logo"
                sizes="(min-width: 56rem) 40vw, 100vw"
                placeholder="blur"
              />
            </figure>
            <figure>
              <Image
                src={festtafel}
                alt="Lange Festtafel mit weißen Tischdecken, Gedecken, Rosen und Platten mit Kuchen und Canapés"
                sizes="(min-width: 56rem) 24vw, 70vw"
                placeholder="blur"
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

import Link from "next/link";
import { cafe, openingHoursSummary } from "@/lib/cafe";
import { legalNav, primaryNav } from "./navigation";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.identity}>
          <p className={styles.name}>{cafe.name}</p>
          <address className={styles.address}>
            {cafe.address.street}
            <br />
            {cafe.address.postalCode} {cafe.address.city}
            <br />
            <a href={cafe.phone.href}>{cafe.phone.display}</a>
          </address>
        </div>

        <div>
          <h2 className={styles.heading}>Öffnungszeiten</h2>
          <dl className={styles.hours}>
            {openingHoursSummary.map((row) => (
              <div key={row.days}>
                <dt>{row.days}</dt>
                <dd className="tabular">{row.hours}</dd>
              </div>
            ))}
          </dl>
        </div>

        <nav aria-label="Fußzeile">
          <h2 className={styles.heading}>Seiten</h2>
          <ul className={styles.links}>
            {[...primaryNav, ...legalNav].map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className={`container ${styles.base}`}>
        <p>Inhaberin {cafe.owner}</p>
      </div>
    </footer>
  );
}

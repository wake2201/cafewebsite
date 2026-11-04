import Image from "next/image";
import Link from "next/link";
import { cafe } from "@/lib/cafe";
import logo from "@/public/images/brand/cafe-am-lindenplatz-logo.png";
import { NavLinks } from "./NavLinks";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <Image
            src={logo}
            alt={`${cafe.name}, Inhaberin ${cafe.owner}, zur Startseite`}
            className={styles.logo}
            sizes="(min-width: 48rem) 176px, 132px"
            loading="eager"
          />
        </Link>
        <nav aria-label="Hauptnavigation" className={styles.nav}>
          <NavLinks />
        </nav>
        <a href={cafe.phone.href} className={styles.phone}>
          <span className="visually-hidden">Telefon: </span>
          {cafe.phone.display}
        </a>
      </div>
    </header>
  );
}

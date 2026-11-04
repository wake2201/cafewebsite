import Link from "next/link";
import { cafe } from "@/lib/cafe";
import { getContactInfo } from "@/lib/content";
import { legalNav, primaryNav } from "./navigation";
import styles from "./SiteFooter.module.css";

export async function SiteFooter() {
  const contact = await getContactInfo();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.identity}>
          <p className={styles.name}>{cafe.name}</p>
          <address className={styles.address}>
            {contact.address.street}
            <br />
            {contact.address.postalCode} {contact.address.city}
            <br />
            <a href={contact.phone.href}>{contact.phone.display}</a>
            {contact.email ? (
              <>
                <br />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </>
            ) : null}
          </address>
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

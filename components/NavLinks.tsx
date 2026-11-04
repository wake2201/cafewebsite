"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "./navigation";
import styles from "./SiteHeader.module.css";

/** Client-only for the active-route state; links work without JavaScript. */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className={styles.navList}>
      {primaryNav.map(({ href, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link href={href} className={styles.navLink} aria-current={active ? "page" : undefined}>
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

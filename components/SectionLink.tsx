"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

type Props = { id: string; className?: string; children: ReactNode };

/**
 * In-page link to `#id` that works on every click.
 * Next.js ignores a <Link> to the hash the URL already has (no scroll) and keeps that scroll pending, so the
 * next page with the same id (the Speisekarte also has #wochenkarte) opened mid-page. When the hash is already
 * current, skip the router and scroll natively; otherwise <Link> handles the jump and its history entry.
 */
export function SectionLink({ id, className, children }: Props) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (window.location.hash !== `#${id}`) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView();
  }

  return (
    <Link href={`#${id}`} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

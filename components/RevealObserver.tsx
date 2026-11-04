"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * Scroll-entry reveals for elements marked `data-reveal` (styles in globals.css).
 *
 * Progressive enhancement: the HTML is fully visible. Only here, once JavaScript runs, are elements
 * still below the fold handed to an IntersectionObserver and `<html data-reveal-ready>` set, which is what
 * lets CSS hide them until they enter. Elements already on screen are marked revealed first, in a
 * layout effect (before paint), so nothing the visitor can see ever disappears or replays. Re-runs on
 * client-side navigation for the new page's elements. Each element reveals once.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "animate";
          observer.unobserve(entry.target);
        }
      },
      // Start a little before the element's top reaches the bottom edge's last 8 %.
      { rootMargin: "0px 0px -8% 0px" },
    );

    const fold = window.innerHeight;
    for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])")) {
      if (element.getBoundingClientRect().top < fold) element.dataset.revealed = "instant";
      else observer.observe(element);
    }
    document.documentElement.dataset.revealReady = "";

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

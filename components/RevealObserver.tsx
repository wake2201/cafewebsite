"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Route motion memory for the public site (styles in globals.css, policy in DESIGN.md).
 *
 * 1. Page intros (`data-intro="<route>"`) are CSS animations that play on first paint. When the visitor
 *    leaves a route, its token is added to `<html data-intro-seen>`; CSS then switches that route's intro
 *    off, so returning to a page (link, Back, Forward) shows it at rest. This needs no timing: the
 *    attribute is in place long before the visitor comes back. A full reload starts a new document and
 *    plays the intro again.
 *
 * 2. Scroll reveals (`data-reveal`) play once per route and document. Content is visible by default;
 *    only elements this script has positively placed below the fold get `data-revealed="wait"`, the one
 *    state CSS hides. Elements on screen, already seen on an earlier visit of the route, or not laid
 *    out yet are never hidden, so a missed case means "no animation", never "missing content".
 *
 * Optional `data-reveal-at="<ratio>"` starts an element once that share of it is visible (the tall Über uns
 * Rundgang photos, so their entrance plays where it can be seen) instead of when its top edge reaches the
 * lower 8 % of the viewport.
 *
 * Next.js re-renders some returning routes and restores others from a hidden copy, so both the DOM state
 * (`data-revealed`) and a per-route index set are used. No JavaScript, reduced motion or print: no
 * hidden state at all.
 */

const revealedByRoute = new Map<string, Set<number>>();

const introToken = (pathname: string) => (pathname === "/" ? "home" : pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-"));

/** Laid out (not inside a hidden route copy or another display:none subtree). */
const isRendered = (element: Element) => element.getClientRects().length > 0;

export function RevealObserver() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  // Intros: remember the route being left. Compared with the previous path (not done in a cleanup) so
  // React's development double-invocation cannot mark the current route mid-intro.
  useEffect(() => {
    const previous = previousPath.current;
    if (previous !== null && previous !== pathname) {
      const root = document.documentElement;
      const tokens = new Set((root.dataset.introSeen ?? "").split(" ").filter(Boolean));
      tokens.add(introToken(previous));
      root.dataset.introSeen = [...tokens].join(" ");
    }
    previousPath.current = pathname;
  }, [pathname]);

  // Reveals.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const seen = revealedByRoute.get(pathname) ?? new Set<number>();
    revealedByRoute.set(pathname, seen);
    const indexOf = new Map<Element, number>();
    let elements: HTMLElement[] = [];
    let frame = 0;
    let attempts = 0;

    const finish = (element: HTMLElement) => {
      element.dataset.revealed = "done";
    };

    const onEntries = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        const at = Number(element.dataset.revealAt) || 0;
        if (!entry.isIntersecting || entry.intersectionRatio < at - 0.01) continue;
        observer.unobserve(element);
        seen.add(indexOf.get(element) ?? -1);
        element.dataset.revealed = "animate";
        // Settle to "done" so a restored copy of this page never restarts the animation.
        const onEnd = (event: AnimationEvent) => {
          if (event.target !== element) return;
          element.removeEventListener("animationend", onEnd);
          finish(element);
        };
        element.addEventListener("animationend", onEnd);
      }
    };

    // One observer per trigger: by default an element starts when its top reaches the lower 8 % of the
    // viewport; data-reveal-at elements start once that share of them is visible.
    const observers = new Map<number, IntersectionObserver>();
    const observerFor = (at: number) => {
      let observer = observers.get(at);
      if (!observer) {
        observer = new IntersectionObserver(onEntries, at > 0 ? { threshold: at } : { rootMargin: "0px 0px -8% 0px" });
        observers.set(at, observer);
      }
      return observer;
    };

    const setup = () => {
      elements = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter(isRendered);
      // A restored route can still be hidden for a frame or two; wait for it instead of guessing.
      if (elements.length === 0) {
        if (attempts++ < 8) frame = requestAnimationFrame(setup);
        return;
      }
      const fold = window.innerHeight;
      elements.forEach((element, index) => {
        indexOf.set(element, index);
        const state = element.dataset.revealed;
        if (state === "done") return;
        if (state === "animate") return finish(element);
        if (seen.has(index) || element.getBoundingClientRect().top < fold) {
          seen.add(index);
          return finish(element);
        }
        element.dataset.revealed = "wait";
        const at = Number(element.dataset.revealAt);
        observerFor(Number.isFinite(at) && at > 0 && at <= 1 ? at : 0).observe(element);
      });
    };
    setup();

    return () => {
      cancelAnimationFrame(frame);
      for (const observer of observers.values()) observer.disconnect();
      // Leaving the route: nothing stays hidden or mid-animation in a copy Next.js may keep.
      for (const element of elements) {
        if (element.dataset.revealed === "wait") delete element.dataset.revealed;
        else if (element.dataset.revealed === "animate") finish(element);
      }
    };
  }, [pathname]);

  return null;
}

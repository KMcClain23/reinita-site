"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Global scroll reveal. Mount once in the root layout.
 *
 * Any element with `data-reveal` will fade up when it enters the viewport.
 * Add `data-reveal-delay="N"` (1-6) for staggered children.
 *
 * Wave dividers and other SVG paths that should "draw" themselves use the
 * `.reveal-stroke` class — the CSS hooks off the same `is-revealed` state.
 *
 * Re-runs the observer on every navigation so newly-mounted page content
 * is observed without a full page reload.
 *
 * Respects `prefers-reduced-motion` — reveals everything instantly.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    // Observe everything currently in the DOM
    document
      .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}

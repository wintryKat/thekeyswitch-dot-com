"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Global scroll-reveal observer.
 * Any element with class "reveal" will fade-in when scrolled into view.
 * Add "reveal-stagger" on a parent to stagger children automatically.
 *
 * Re-runs when the pathname changes so that client-side navigations
 * (e.g. clicking "Home") correctly reveal newly-rendered elements.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    // Respect user preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      document.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    // Small delay to let the new page render before querying elements
    const timer = setTimeout(() => {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        observer.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

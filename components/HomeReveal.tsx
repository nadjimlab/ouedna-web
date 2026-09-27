"use client";

import { useEffect } from "react";

/**
 * Adds a premium "arrival" feel to the homepage without any extra libraries:
 * - fades/slides sections into view as the visitor scrolls (data-reveal)
 * - animates the numeric stats counting up once they enter the viewport (data-count)
 * Respects prefers-reduced-motion by revealing everything instantly.
 */
export default function HomeReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const countTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));

    if (reduceMotion) {
      revealTargets.forEach((el) => el.classList.add("is-in"));
      countTargets.forEach((el) => {
        const target = Number(el.dataset.count || "0");
        el.textContent = String(target);
      });
      return;
    }

    const animateCount = (el: HTMLElement) => {
      const target = Number(el.dataset.count || "0");
      if (!target) return;
      const duration = 900;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay || 0) + i * 40;
          window.setTimeout(() => el.classList.add("is-in"), delay);
          revealObserver.unobserve(el);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );
    revealTargets.forEach((el) => revealObserver.observe(el));

    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target as HTMLElement);
          countObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 },
    );
    countTargets.forEach((el) => countObserver.observe(el));

    return () => {
      revealObserver.disconnect();
      countObserver.disconnect();
    };
  }, []);

  return null;
}

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "./gsap";

let lenis: Lenis | null = null;

export function scrollToId(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;

  const nav = document.querySelector(".nav");
  const offset = nav instanceof HTMLElement ? -(nav.offsetHeight + 12) : -80;

  if (lenis) {
    lenis.scrollTo(target, { offset });
    return;
  }

  const top = target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export function setScrollLocked(locked: boolean): void {
  document.documentElement.classList.toggle("is-locked", locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

export function useSmoothScroll(enabled: boolean): void {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || reduced) return;

    const touch =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 760px)").matches;

    const next = new Lenis({
      lerp: touch ? 0.1 : 0.085,
      wheelMultiplier: 0.9,
      syncTouch: touch,
      syncTouchLerp: 0.1,
      touchInertiaExponent: 1.2,
    });

    lenis = next;
    next.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      next.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    const refreshAfterFonts = () => ScrollTrigger.refresh();
    void document.fonts?.ready.then(refreshAfterFonts);

    return () => {
      gsap.ticker.remove(onTick);
      next.destroy();
      if (lenis === next) lenis = null;
    };
  }, [enabled]);
}

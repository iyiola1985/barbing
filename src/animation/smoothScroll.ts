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

function bindFingerScroll(): () => void {
  let lastY = 0;
  let tracking = false;

  const start = (event: TouchEvent) => {
    if (event.touches.length !== 1) {
      tracking = false;
      return;
    }
    tracking = true;
    lastY = event.touches[0]?.clientY ?? 0;
  };

  const move = (event: TouchEvent) => {
    if (!tracking || event.touches.length !== 1) return;
    if (document.documentElement.classList.contains("is-locked")) return;
    const y = event.touches[0]?.clientY ?? lastY;
    const delta = lastY - y;
    lastY = y;
    if (Math.abs(delta) < 1) return;

    const scroller = document.scrollingElement ?? document.documentElement;
    const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const next = Math.min(max, Math.max(0, window.scrollY + delta));
    if (event.cancelable) event.preventDefault();
    window.scrollTo(0, next);
    ScrollTrigger.update();
  };

  const end = () => {
    tracking = false;
  };

  window.addEventListener("touchstart", start, { passive: true });
  window.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("touchend", end);
  window.addEventListener("touchcancel", end);

  return () => {
    window.removeEventListener("touchstart", start);
    window.removeEventListener("touchmove", move);
    window.removeEventListener("touchend", end);
    window.removeEventListener("touchcancel", end);
  };
}

export function useSmoothScroll(enabled: boolean): void {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || reduced) return;

    const touch =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 760px)").matches;

    if (touch) {
      const unbind = bindFingerScroll();
      const refresh = () => ScrollTrigger.refresh();
      requestAnimationFrame(refresh);
      void document.fonts?.ready.then(refresh);
      return unbind;
    }

    const next = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
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

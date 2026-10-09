import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "./animation/gsap";
import { usePrefersReducedMotion } from "./animation/prefersReducedMotion";
import { getChairSequence, type SequenceMode } from "./animation/sequence";
import { scrollToId, useSmoothScroll } from "./animation/smoothScroll";
import { useActiveChapter } from "./animation/useActiveChapter";
import { whatsappLink } from "./booking";
import { ChapterRail } from "./components/ChapterRail";
import { Creed } from "./components/Creed";
import { Footer } from "./components/Footer";
import { Grain } from "./components/Grain";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Preloader } from "./components/Preloader";
import { businessJsonLd, chapters, site } from "./content/site";

export default function App() {
  const sequence = useRef(getChairSequence());
  const reduced = usePrefersReducedMotion();
  const chapter = useActiveChapter(chapters);
  const [booting, setBooting] = useState(true);
  const [mode, setMode] = useState<SequenceMode>("procedural");

  useSmoothScroll(!booting);

  useEffect(() => {
    let live = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minDelay = new Promise((resolve) => {
      window.setTimeout(resolve, reducedMotion ? 280 : 1500);
    });

    void Promise.all([sequence.current.init(), minDelay]).then(([nextMode]) => {
      if (!live) return;
      setMode(nextMode);
      setBooting(false);
    });

    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("is-booting", booting);
    if (booting) return;
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    const hash = window.location.hash.slice(1);
    const timer = hash ? window.setTimeout(() => scrollToId(hash), 80) : 0;
    return () => {
      cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
    };
  }, [booting]);

  const structured = businessJsonLd();
  const whatsapp = whatsappLink(site.whatsapp, `Hello, I would like to book an appointment at ${site.name}.`);

  return (
    <>
      <a className="skip" href="#opening">
        Skip to content
      </a>
      {structured ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
      ) : null}
      <Grain />
      <Preloader done={!booting} />
      <Nav />
      <ChapterRail label={chapter} />
      <main>
        <Hero sequence={sequence.current} mode={mode} reduced={reduced} />
        <Creed reduced={reduced} />
      </main>
      <Footer />
      {whatsapp ? (
        <a className="wa-float" href={whatsapp} target="_blank" rel="noopener">
          WhatsApp
        </a>
      ) : null}
    </>
  );
}

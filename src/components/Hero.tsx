import { useLayoutEffect, useRef } from "react";
import { soloOpacity } from "../animation/beats";
import { ScrollTrigger } from "../animation/gsap";
import type { FrameSequence, SequenceMode } from "../animation/sequence";
import { scrollToId } from "../animation/smoothScroll";
import { site } from "../content/site";

type HeroProps = {
  sequence: FrameSequence;
  mode: SequenceMode;
  reduced: boolean;
};

export function Hero({ sequence, mode, reduced }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatsRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!canvas || !root || !pin) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let progress = 0;

    const paintBeats = (value: number) => {
      const beats = beatsRef.current?.children;
      if (!beats) return;
      const count = beats.length;
      Array.from(beats).forEach((node, index) => {
        const beat = node as HTMLElement;
        const opacity = reduced ? (index === 0 ? 1 : 0) : soloOpacity(value, index, count);
        beat.style.opacity = String(opacity);
        beat.style.visibility = opacity > 0.02 ? "visible" : "hidden";
        beat.style.pointerEvents = opacity > 0.65 ? "auto" : "none";
        beat.style.transform = "none";
      });
      const fadeStart = 0.86;
      const fadeEnd = 0.97;
      const overlay =
        reduced || value <= fadeStart
          ? 1
          : value >= fadeEnd
            ? 0
            : 1 - (value - fadeStart) / (fadeEnd - fadeStart);
      const copy = copyRef.current;
      if (copy) {
        copy.style.opacity = String(overlay);
        copy.style.visibility = overlay > 0.02 ? "visible" : "hidden";
        copy.style.pointerEvents = overlay > 0.65 ? "auto" : "none";
      }
      const actions = actionsRef.current;
      if (actions) {
        actions.style.pointerEvents = overlay > 0.65 ? "auto" : "none";
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = reduced ? "0" : String(Math.max(0, 1 - value * 8));
      }
    };

    const render = (value: number) => {
      progress = value;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width < 2 || height < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const bitmapWidth = Math.max(1, Math.round(width * dpr));
      const bitmapHeight = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== bitmapWidth || canvas.height !== bitmapHeight) {
        canvas.width = bitmapWidth;
        canvas.height = bitmapHeight;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      sequence.draw(context, width, height, value);
      paintBeats(value);
    };

    const resize = () => render(progress);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    render(reduced ? 0.42 : 0);

    if (reduced) {
      return () => observer.disconnect();
    }

    const trigger = ScrollTrigger.create({
      trigger: root,
      pin,
      start: "top top",
        end: () => {
        const compact = window.matchMedia("(max-width: 760px)").matches;
        return `+=${window.innerHeight * (compact ? 2.6 : 4.2)}`;
      },
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => render(self.progress),
    });

    return () => {
      observer.disconnect();
      trigger.kill();
    };
  }, [mode, reduced, sequence]);

  const opening = site.hero.beats.find((beat) => beat.mark) ?? site.hero.beats[0];
  const noteBreak = opening ? opening.lede.indexOf(",") : -1;
  const noteTitle = opening && noteBreak > 0 ? opening.lede.slice(0, noteBreak + 1) : (opening?.lede ?? "");
  const noteBody = opening && noteBreak > 0 ? opening.lede.slice(noteBreak + 1).trim() : "";

  return (
    <section id="opening" className="hero" ref={rootRef}>
      <div className="hero-pin" ref={pinRef}>
        <canvas className="hero-canvas" ref={canvasRef} aria-hidden="true" />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-frame" aria-hidden="true" />
        <div className="hero-copy" ref={copyRef}>
          <div className="beats" ref={beatsRef}>
            {site.hero.beats.map((beat) => {
              const words = [beat.title, beat.emphasis]
                .filter((line): line is string => Boolean(line))
                .flatMap((line) => line.split(/\s+/).filter(Boolean));
              return (
                <article key={beat.title} className="beat" aria-hidden={beat.mark ? undefined : true}>
                  <p className="kicker">{beat.kicker}</p>
                  {beat.mark ? (
                    <h1 className="beat-title is-mark">
                      {words.map((word, index) => (
                        <span key={`${word}-${index}`}>{word}</span>
                      ))}
                    </h1>
                  ) : (
                    <p className="beat-title">{beat.title}</p>
                  )}
                  {beat.mark ? (
                    <div className="hero-actions" ref={actionsRef}>
                      <a
                        className="button"
                        href={`#${site.book.id}`}
                        onClick={(event) => {
                          event.preventDefault();
                          scrollToId(site.book.id);
                        }}
                      >
                        Book your appointment
                      </a>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
          {noteTitle ? (
            <aside className="hero-note">
              <p className="hero-note-title">{noteTitle}</p>
              {noteBody ? <p>{noteBody}</p> : null}
            </aside>
          ) : null}
        </div>
        {reduced ? null : (
          <p className="scroll-hint" ref={hintRef}>
            <span className="scroll-line" />
            <span>Scroll</span>
          </p>
        )}
        {import.meta.env.DEV && mode === "procedural" ? (
          <p className="stand-in">Preview scene. Flow frames replace it.</p>
        ) : null}
      </div>
    </section>
  );
}

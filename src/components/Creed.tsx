import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../animation/gsap";
import { proceduralChair } from "../animation/proceduralChair";
import { framePixelRatio, FrameSequence } from "../animation/sequence";
import { sequences } from "../content/sequences";
import { site } from "../content/site";

const aboutSequence = new FrameSequence(sequences.about.manifest, proceduralChair);

type CreedProps = {
  reduced: boolean;
};

export function Creed({ reduced }: CreedProps) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const context2d = canvas.getContext("2d");
    if (!context2d) return;

    let progress = reduced ? 0.35 : 0;
    let alive = true;

    const paint = (value: number) => {
      progress = value;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width < 2 || height < 2) return;
      const dpr = framePixelRatio();
      const bitmapWidth = Math.max(1, Math.round(width * dpr));
      const bitmapHeight = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== bitmapWidth || canvas.height !== bitmapHeight) {
        canvas.width = bitmapWidth;
        canvas.height = bitmapHeight;
      }
      context2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      aboutSequence.draw(context2d, width, height, value);
    };

    const resize = () => paint(progress);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const stop = aboutSequence.subscribe(() => paint(progress));
    paint(progress);
    const frame = requestAnimationFrame(() => {
      if (alive) paint(progress);
    });
    const startFilm = () => {
      void aboutSequence.init().then(() => {
        if (alive) paint(progress);
      });
    };

    if (reduced) {
      startFilm();
      return () => {
        alive = false;
        stop();
        cancelAnimationFrame(frame);
        observer.disconnect();
      };
    }

    const near = root.getBoundingClientRect().top < window.innerHeight * 1.15;
    const arm = near
      ? null
      : ScrollTrigger.create({
          trigger: root,
          start: "top 140%",
          once: true,
          onEnter: startFilm,
        });
    if (near) startFilm();

    const film = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => paint(self.progress),
    });

    const context = gsap.context(() => {
      gsap.from(".mask-line", {
        yPercent: 110,
        ease: "none",
        stagger: 0.08,
        scrollTrigger: {
          trigger: root,
          start: "top 75%",
          end: "top 28%",
          scrub: true,
        },
      });
      gsap.from(".creed-grid p", {
        y: 24,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".creed-grid",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, root);

    return () => {
      alive = false;
      stop();
      cancelAnimationFrame(frame);
      observer.disconnect();
      arm?.kill();
      film.kill();
      context.revert();
    };
  }, [reduced]);

  return (
    <section id="creed" className="section creed" ref={rootRef}>
      <canvas className="creed-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="creed-shade" aria-hidden="true" />
      <div className="creed-copy">
        <p className="kicker">{site.creed.kicker}</p>
        <h2 className="creed-title">
          {site.creed.lines.map((line) => (
            <span className="mask" key={line.text}>
              <span className={line.emphasis ? "mask-line is-emphasis" : "mask-line"}>{line.text}</span>
            </span>
          ))}
        </h2>
        <div className="creed-grid">
          <div>
            {site.creed.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <ul className="pillars">
              {site.creed.pillars.map((pillar) => (
                <li key={pillar.title}>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.copy}</p>
                </li>
              ))}
            </ul>
          </div>
          <img className="about-mark" src={site.logo} alt="" width={512} height={512} />
        </div>
      </div>
    </section>
  );
}

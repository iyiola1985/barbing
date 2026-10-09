import { useLayoutEffect, useRef } from "react";
import { bandOpacity, bandShift } from "../animation/beats";
import { ScrollTrigger } from "../animation/gsap";
import { site } from "../content/site";

type RitualProps = {
  reduced: boolean;
};

export function Ritual({ reduced }: RitualProps) {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin || reduced) return;

    const render = (progress: number) => {
      const steps = stepsRef.current?.children;
      if (!steps) return;
      const count = steps.length;
      Array.from(steps).forEach((node, index) => {
        const step = node as HTMLElement;
        const opacity = bandOpacity(progress, index, count);
        const shift = bandShift(progress, index, count, opacity);
        step.style.opacity = String(opacity);
        step.style.transform = `translate3d(0, ${shift}px, 0)`;
      });
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    };

    render(0);

    const trigger = ScrollTrigger.create({
      trigger: root,
      pin,
      start: "top top",
      end: () => `+=${window.innerHeight * (window.matchMedia("(max-width: 760px)").matches ? 1.8 : 2.5)}`,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => render(self.progress),
    });

    return () => trigger.kill();
  }, [reduced]);

  return (
    <section id="ritual" className={reduced ? "ritual is-stacked" : "ritual"} ref={rootRef}>
      <div className="ritual-pin" ref={pinRef}>
        <p className="kicker">{site.ritual.kicker}</p>
        <div className="ritual-steps" ref={stepsRef}>
          {site.ritual.steps.map((step) => (
            <article className="ritual-step" key={step.index}>
              <div className="ritual-body">
                <span className="ritual-index">{step.index}</span>
                <div>
                  <h2>{step.title}</h2>
                  <p>{step.copy}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        {reduced ? null : (
          <div className="ritual-progress" aria-hidden="true">
            <span ref={barRef} />
          </div>
        )}
      </div>
    </section>
  );
}

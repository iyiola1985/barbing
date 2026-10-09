import { useLayoutEffect, useRef } from "react";
import { gsap } from "../animation/gsap";
import { site } from "../content/site";

type CreedProps = {
  reduced: boolean;
};

export function Creed({ reduced }: CreedProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

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

    return () => context.revert();
  }, [reduced]);

  return (
    <section id="creed" className="section creed" ref={rootRef}>
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
    </section>
  );
}

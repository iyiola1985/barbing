import { useLayoutEffect, useRef } from "react";
import { gsap } from "../animation/gsap";
import { site } from "../content/site";

type WhyProps = {
  reduced: boolean;
};

export function Why({ reduced }: WhyProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || reduced) return;
    const context = gsap.context(() => {
      gsap.from(list.children, {
        y: 18,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: list,
          start: "top 82%",
          toggleActions: "play none none none",
        },
      });
    }, list);
    return () => context.revert();
  }, [reduced]);

  return (
    <section id="why" className="section why">
      <p className="kicker">{site.why.kicker}</p>
      <div className="section-intro">
        <h2>{site.why.title}</h2>
      </div>
      <ul className="why-grid" ref={listRef}>
        {site.why.items.map((item, index) => (
          <li key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

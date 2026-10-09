import { useLayoutEffect, useRef } from "react";
import { gsap } from "../animation/gsap";
import { requestService } from "../booking";
import { activeServices, site } from "../content/site";

type BarbersProps = {
  reduced: boolean;
};

export function Barbers({ reduced }: BarbersProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const people = site.staff;
  const fallbackService = activeServices()[0]?.id ?? "";

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || reduced || people.length === 0) return;

    const context = gsap.context(() => {
      gsap.from(grid.children, {
        y: 28,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: grid,
          start: "top 78%",
          toggleActions: "play none none none",
        },
      });
    }, grid);

    return () => context.revert();
  }, [people.length, reduced]);

  if (people.length === 0) return null;

  return (
    <section id="barbers" className="section barbers">
      <p className="kicker">The barbers</p>
      <div className="section-intro">
        <h2>In the chair.</h2>
      </div>
      <div className="barber-grid" ref={gridRef}>
        {people.map((person) => (
          <article className="barber" key={person.name}>
            {person.photo ? (
              <img className="plate" src={person.photo} alt="" width={640} height={800} />
            ) : (
              <div className="plate plate-empty">
                <span>Photo to be added</span>
              </div>
            )}
            <h3>{person.name}</h3>
            {person.specialty ? <p className="role">{person.specialty}</p> : null}
            {person.bio ? <p className="line">{person.bio}</p> : null}
            {fallbackService ? (
              <button className="text-link" type="button" onClick={() => requestService(fallbackService)}>
                Book an appointment
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

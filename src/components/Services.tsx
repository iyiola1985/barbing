import { useLayoutEffect, useRef } from "react";
import { gsap } from "../animation/gsap";
import { requestService, whatsappLink } from "../booking";
import { activeServices, formatPrice, site } from "../content/site";

type ServicesProps = {
  reduced: boolean;
};

export function Services({ reduced }: ServicesProps) {
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || reduced) return;

    const context = gsap.context(() => {
      gsap.from(list.children, {
        y: 22,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: list,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, list);

    return () => context.revert();
  }, [reduced]);

  return (
    <section id="services" className="section services">
      <p className="kicker">{site.services.kicker}</p>
      <div className="section-intro">
        <h2>{site.services.title}</h2>
        <p>{site.services.lede}</p>
      </div>
      <ul className="service-list" ref={listRef}>
        {activeServices().map((service, index) => {
          const whatsapp = whatsappLink(site.whatsapp, `Hello, I would like to book ${service.name}.`);
          return (
            <li key={service.id} id={`service-${service.id}`} className={service.featured ? "is-featured" : undefined}>
              <span className="service-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{service.name}</h3>
              <p>{service.detail}</p>
              <span className="service-meta">{service.minutes ? `${service.minutes} min` : ""}</span>
              <div className="service-price">
                <span>{formatPrice(service.price)}</span>
                <span className="service-actions">
                  <button type="button" className="text-link" onClick={() => requestService(service.id)}>
                    Book this service
                  </button>
                  {whatsapp ? (
                    <a className="text-link" href={whatsapp} target="_blank" rel="noopener">
                      Book via WhatsApp
                    </a>
                  ) : null}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import { activeServices, formatPrice, site, type ServiceGroup } from "../content/site";

const groupOrder: ServiceGroup[] = ["Haircuts", "Beard grooming", "Kids' cuts", "Grooming combinations"];

export function Pricing() {
  const services = activeServices();
  const priced = services.some((service) => typeof service.price === "number" && service.price > 0);
  const phone = site.phoneE164 || site.phone;

  return (
    <section id="pricing" className="section pricing">
      <p className="kicker">{site.pricing.kicker}</p>
      <div className="section-intro">
        <h2>{site.pricing.title}</h2>
        <p>
          {priced
            ? `Prices are in ${site.currency}. Anything still marked to be confirmed needs a yes from the shop.`
            : `${site.currency} prices are not listed yet. Ask the shop before you visit.`}
        </p>
      </div>
      <div className="price-menu">
        {groupOrder.map((group) => {
          const items = services.filter((service) => service.group === group);
          if (items.length === 0) return null;
          return (
            <section className="price-group" key={group}>
              <h3>{group}</h3>
              <dl>
                {items.map((service) => (
                  <div className={service.featured ? "price-row is-featured" : "price-row"} key={service.id}>
                    <dt>{service.name}</dt>
                    <dd>{formatPrice(service.price)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>
      {phone ? (
        <p className="price-ask">
          <a href={`tel:${phone}`}>{site.phone}</a>
          <span> Call for a price.</span>
        </p>
      ) : null}
    </section>
  );
}

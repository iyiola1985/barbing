import { site } from "../content/site";

export function Testimonials() {
  if (site.testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="section testimonials" aria-label="Guest notes">
      <p className="kicker">Notes</p>
      <div className="section-intro">
        <h2>From the chair.</h2>
      </div>
      <ul className="quote-list">
        {site.testimonials.map((item) => (
          <li key={`${item.name}-${item.quote}`}>
            <blockquote>
              <p>{item.quote}</p>
              <footer>{item.name}</footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </section>
  );
}

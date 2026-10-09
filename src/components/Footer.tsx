import { type MouseEvent } from "react";
import { scrollToId } from "../animation/smoothScroll";
import { site, visibleNav } from "../content/site";

function go(event: MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  scrollToId(id);
}

export function Footer() {
  return (
    <footer className="footer" id="footer">
      <div>
        <a className="footer-brand" href="#opening" onClick={(event) => go(event, "opening")}>
          <img src={site.logo} alt="" width={56} height={56} />
          <span className="footer-mark">{site.name}</span>
        </a>
        <p className="footer-quiet">{site.tagline}</p>
      </div>
      <nav className="footer-links" aria-label="Footer">
        {visibleNav().map((item) => (
          <a key={item.id} href={`#${item.id}`} onClick={(event) => go(event, item.id)}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="footer-links">
        {site.locations.map((place) => (
          <p key={place.label}>
            {place.label}: {place.address}
          </p>
        ))}
        {site.phone ? <a href={`tel:${site.phoneE164 || site.phone}`}>{site.phone}</a> : null}
        {site.email ? <a href={`mailto:${site.email}`}>{site.email}</a> : null}
        {site.socials.map((social) =>
          social.href ? (
            <a key={social.href} href={social.href}>
              {social.label}
            </a>
          ) : null,
        )}
      </div>
      <ul className="hours">
        {site.hours.map((row) => (
          <li key={row.label}>
            <span>{row.label}</span>
            <span>
              {row.open} – {row.close}
            </span>
          </li>
        ))}
      </ul>
      <p className="fineprint">
        © {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { site, visibleNav } from "../content/site";
import { ScrollTrigger } from "../animation/gsap";
import { scrollToId, setScrollLocked } from "../animation/smoothScroll";

export function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const wasOpen = useRef(false);
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useLayoutEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const solid = self.scroll() > window.innerHeight * 0.7;
        navRef.current?.classList.toggle("is-solid", solid);
      },
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    setScrollLocked(open);
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      setScrollLocked(false);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      firstLinkRef.current?.focus();
      return;
    }
    if (wasOpen.current) toggleRef.current?.focus();
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    setScrollLocked(false);
    scrollToId(id);
  };

  const menuHidden = compact && !open;

  return (
    <header className={open ? "nav is-open" : "nav"} ref={navRef}>
      <a
        className="logo"
        href="#opening"
        onClick={(event) => {
          event.preventDefault();
          go("opening");
        }}
      >
        <img src={site.logo} alt="" width={48} height={48} />
        <span className="logo-type">{site.name}</span>
      </a>
      {site.phone ? <p className="nav-note">{site.phone}</p> : null}
      <button
        ref={toggleRef}
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      <nav id="site-nav" className="nav-links" aria-hidden={menuHidden ? true : undefined} inert={menuHidden ? true : undefined}>
        {visibleNav().map((item, index) => (
          <a
            key={item.id}
            ref={index === 0 ? firstLinkRef : undefined}
            href={`#${item.id}`}
            onClick={(event) => {
              event.preventDefault();
              go(item.id);
            }}
          >
            {item.label}
          </a>
        ))}
        <a
          className="is-reserve"
          href={`#${site.book.id}`}
          onClick={(event) => {
            event.preventDefault();
            go(site.book.id);
          }}
        >
          {site.book.label}
        </a>
      </nav>
    </header>
  );
}

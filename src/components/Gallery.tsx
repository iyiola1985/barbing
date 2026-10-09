import { useEffect, useId, useRef, useState } from "react";
import { site, type GalleryImage } from "../content/site";

export function Gallery() {
  const images = site.gallery;
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<GalleryImage | null>(null);
  const categories = [...new Set(images.map((image) => image.category))];
  const visible = filter === "All" ? images : images.filter((image) => image.category === filter);

  useEffect(() => {
    if (!active) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="section gallery" aria-labelledby={titleId}>
      <p className="kicker">Gallery</p>
      <div className="section-intro">
        <h2 id={titleId}>The work.</h2>
        <p>Photographs supplied by the lounge. Replace the files in the site config when new ones are ready.</p>
      </div>
      {categories.length > 1 ? (
        <div className="filters" role="group" aria-label="Gallery categories">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              className="text-link"
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}
      <div className="gallery-grid">
        {visible.map((image) => (
          <button
            key={`${image.src}-${image.alt}`}
            type="button"
            className="shot"
            onClick={() => setActive(image)}
          >
            <img src={image.src} alt={image.alt} width={1280} height={800} loading="lazy" />
            <span>{image.category}</span>
          </button>
        ))}
      </div>
      {active ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.alt}>
          <button ref={closeRef} className="text-link lightbox-close" type="button" onClick={() => setActive(null)}>
            Close
          </button>
          <img src={active.src} alt={active.alt} />
        </div>
      ) : null}
    </section>
  );
}

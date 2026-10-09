import { useState, type FormEvent } from "react";
import { mapsLink } from "../booking";
import { site } from "../content/site";

type ContactErrors = Partial<Record<"name" | "reach" | "message", string>>;

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const next: ContactErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();
    if (trimmedName.length < 2) next.name = "Enter your name.";
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.reach = "Enter a valid email or leave it blank.";
    } else if (!trimmedEmail && trimmedPhone.replace(/\D/g, "").length < 7) {
      next.reach = "Add an email or a phone number.";
    }
    if (trimmedMessage.length < 4) next.message = "Write a short message.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setStatus("");
      return;
    }
    if (!site.email) {
      setStatus("The shop email is not in the site config yet, so this message stays on the page.");
      return;
    }
    const body = [
      `Name: ${trimmedName}`,
      trimmedEmail ? `Email: ${trimmedEmail}` : "",
      trimmedPhone ? `Phone: ${trimmedPhone}` : "",
      "",
      trimmedMessage,
    ]
      .filter((line) => line !== "")
      .join("\n");
    setSending(true);
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Message for ${site.name}`)}&body=${encodeURIComponent(body)}`;
    setStatus("Your email app should open. The message reaches the shop only after you send it there.");
    window.setTimeout(() => setSending(false), 1200);
  };

  return (
    <section id="contact" className="section contact">
      <div className="reserve-grid">
        <div>
          <p className="kicker">{site.contact.kicker}</p>
          <h2>{site.contact.title}</h2>
          <p className="reserve-lede">{site.contact.lede}</p>
          <div className="contact-list">
            {site.locations.map((place) => (
              <div className="contact-block" key={place.label}>
                <h3>{place.label}</h3>
                <p>{place.address}</p>
                <a href={mapsLink(place.address)} target="_blank" rel="noopener">
                  Directions
                </a>
              </div>
            ))}
            {site.phone ? (
              <div className="contact-block">
                <h3>Phone</h3>
                <a href={`tel:${site.phoneE164 || site.phone}`}>{site.phone}</a>
              </div>
            ) : null}
            {site.email ? (
              <div className="contact-block">
                <h3>Email</h3>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </div>
            ) : null}
            <div className="contact-block">
              <h3>Hours</h3>
              {site.hours.map((row) => (
                <p key={row.label}>
                  {row.label}: {row.open} – {row.close}
                </p>
              ))}
              {site.unpublishedDays.length > 0 ? (
                <p>{site.unpublishedDays.join(", ")} is not on the published hours.</p>
              ) : null}
            </div>
          </div>
        </div>
        <form onSubmit={onSubmit} noValidate aria-busy={sending}>
          <label className="field">
            <span>Name</span>
            <input
              name="name"
              autoComplete="name"
              value={name}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name ? (
              <small className="field-error" id="contact-name-error">
                {errors.name}
              </small>
            ) : null}
          </label>
          <div className="form-row">
            <label className="field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                aria-invalid={errors.reach ? true : undefined}
                aria-describedby={errors.reach ? "contact-reach-error" : undefined}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Phone</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                aria-invalid={errors.reach ? true : undefined}
                aria-describedby={errors.reach ? "contact-reach-error" : undefined}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
          </div>
          {errors.reach ? (
            <small className="field-error" id="contact-reach-error">
              {errors.reach}
            </small>
          ) : null}
          <label className="field">
            <span>Message</span>
            <textarea
              name="message"
              rows={4}
              maxLength={600}
              value={message}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
              onChange={(event) => setMessage(event.target.value)}
            />
            {errors.message ? (
              <small className="field-error" id="contact-message-error">
                {errors.message}
              </small>
            ) : null}
          </label>
          <button className="button" type="submit" disabled={sending}>
            {sending ? "Opening email" : "Prepare message"}
          </button>
          <p className="form-status" role="status">
            {status}
          </p>
        </form>
      </div>
    </section>
  );
}

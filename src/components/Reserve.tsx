import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  BOOK_SERVICE_EVENT,
  enquiryMessage,
  localISODate,
  validateEnquiry,
  whatsappLink,
  type Enquiry,
  type EnquiryErrors,
} from "../booking";
import { activeServices, serviceName, site } from "../content/site";
import { submitReservation, type BookingResult } from "../reservation";

const emptyEnquiry: Enquiry = {
  name: "",
  phone: "",
  email: "",
  serviceId: "",
  date: "",
  time: "",
  note: "",
};

function outcomeCopy(result: BookingResult, link: string): string {
  switch (result.status) {
    case "sent":
      return "The shop has the enquiry. The chair is reserved only after they confirm it.";
    case "not-configured":
      if (link) {
        return "WhatsApp should open with your message. Press send there. The appointment is not booked until the shop confirms it.";
      }
      if (site.email) {
        return "Your email app should open with this enquiry. Send it there. This page has not booked the appointment.";
      }
      if (site.phone) {
        return `WhatsApp and email are not connected. Call ${site.phone} and read them this enquiry. Nothing has been reserved.`;
      }
      return "Add a WhatsApp number, email, or phone in src/content/site.ts before enquiries can leave this page.";
    default: {
      const unreachable: never = result;
      return unreachable;
    }
  }
}

export function Reserve() {
  const [values, setValues] = useState<Enquiry>(emptyEnquiry);
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [reviewed, setReviewed] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [fallbackLink, setFallbackLink] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const today = localISODate(new Date());

  useEffect(() => {
    const onBook = (event: Event) => {
      const serviceId = (event as CustomEvent<string>).detail;
      if (!activeServices().some((service) => service.id === serviceId)) return;
      setValues((current) => ({ ...current, serviceId }));
      setReviewed(false);
      setStatus("");
      setErrors((current) => ({ ...current, serviceId: undefined }));
    };
    window.addEventListener(BOOK_SERVICE_EVENT, onBook);
    return () => window.removeEventListener(BOOK_SERVICE_EVENT, onBook);
  }, []);

  const update = (patch: Partial<Enquiry>) => {
    setValues((current) => ({ ...current, ...patch }));
    setReviewed(false);
    setStatus("");
    setFallbackLink("");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const nextErrors = validateEnquiry(values, today);
    setErrors(nextErrors);
    const first = (Object.keys(nextErrors) as (keyof EnquiryErrors)[])[0];
    if (first) {
      setReviewed(false);
      const field = document.getElementById(`book-${first}`);
      field?.focus();
      return;
    }
    if (!reviewed) {
      setReviewed(true);
      setStatus("");
      window.setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }

    const message = enquiryMessage(values);
    const link = whatsappLink(site.whatsapp, message);
    setSending(true);
    void submitReservation(values).then((result) => {
      if (result.status === "not-configured") {
        if (link) {
          const opened = window.open(link, "_blank", "noopener");
          if (!opened) setFallbackLink(link);
        } else if (site.email) {
          const subject = encodeURIComponent(`Appointment enquiry — ${serviceName(values.serviceId)}`);
          window.location.href = `mailto:${site.email}?subject=${subject}&body=${encodeURIComponent(message)}`;
        }
      }
      setStatus(outcomeCopy(result, link));
      setSending(false);
    });
  };

  const summaryWhen = values.date
    ? new Date(`${values.date}T00:00:00`).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";
  const actionLabel = whatsappLink(site.whatsapp, "x") ? "Open WhatsApp" : "Email this enquiry";

  return (
    <section id="reserve" className="section reserve">
      <div className="reserve-grid">
        <div>
          <p className="kicker">{site.reserve.kicker}</p>
          <h2>{site.reserve.title}</h2>
          <p className="reserve-lede">{site.reserve.lede}</p>
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
          {site.unpublishedDays.length > 0 ? (
            <p className="reserve-note">{site.unpublishedDays.join(", ")} is not on the published hours.</p>
          ) : null}
          <div className="book-reach">
            {site.phone ? <a href={`tel:${site.phoneE164 || site.phone}`}>{site.phone}</a> : null}
            {site.email ? <a href={`mailto:${site.email}`}>{site.email}</a> : null}
          </div>
        </div>
        <form onSubmit={onSubmit} noValidate aria-busy={sending}>
          <label className="field" htmlFor="book-name">
            <span>Name</span>
            <input
              id="book-name"
              name="name"
              autoComplete="name"
              required
              value={values.name}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "book-name-error" : undefined}
              onChange={(event) => update({ name: event.target.value })}
            />
            {errors.name ? (
              <small className="field-error" id="book-name-error">
                {errors.name}
              </small>
            ) : null}
          </label>
          <label className="field" htmlFor="book-phone">
            <span>Phone</span>
            <input
              id="book-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={values.phone}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "book-phone-error" : undefined}
              onChange={(event) => update({ phone: event.target.value })}
            />
            {errors.phone ? (
              <small className="field-error" id="book-phone-error">
                {errors.phone}
              </small>
            ) : null}
          </label>
          <label className="field" htmlFor="book-email">
            <span>Email, optional</span>
            <input
              id="book-email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "book-email-error" : undefined}
              onChange={(event) => update({ email: event.target.value })}
            />
            {errors.email ? (
              <small className="field-error" id="book-email-error">
                {errors.email}
              </small>
            ) : null}
          </label>
          <label className="field" htmlFor="book-serviceId">
            <span>Service</span>
            <select
              id="book-serviceId"
              name="service"
              required
              value={values.serviceId}
              aria-invalid={errors.serviceId ? true : undefined}
              aria-describedby={errors.serviceId ? "book-service-error" : undefined}
              onChange={(event) => update({ serviceId: event.target.value })}
            >
              <option value="">Select a service</option>
              {activeServices().map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            {errors.serviceId ? (
              <small className="field-error" id="book-service-error">
                {errors.serviceId}
              </small>
            ) : null}
          </label>
          <div className="form-row">
            <label className="field" htmlFor="book-date">
              <span>Preferred date</span>
              <input
                id="book-date"
                name="date"
                type="date"
                required
                min={today}
                value={values.date}
                aria-invalid={errors.date ? true : undefined}
                aria-describedby={errors.date ? "book-date-error" : undefined}
                onChange={(event) => update({ date: event.target.value })}
              />
              {errors.date ? (
                <small className="field-error" id="book-date-error">
                  {errors.date}
                </small>
              ) : null}
            </label>
            <label className="field" htmlFor="book-time">
              <span>Preferred time</span>
              <input
                id="book-time"
                name="time"
                type="time"
                required
                min={site.booking.open}
                max={site.booking.close}
                step={site.booking.stepMinutes * 60}
                value={values.time}
                aria-invalid={errors.time ? true : undefined}
                aria-describedby={errors.time ? "book-time-error" : undefined}
                onChange={(event) => update({ time: event.target.value })}
              />
              {errors.time ? (
                <small className="field-error" id="book-time-error">
                  {errors.time}
                </small>
              ) : null}
            </label>
          </div>
          <label className="field" htmlFor="book-note">
            <span>Notes, optional</span>
            <textarea
              id="book-note"
              name="note"
              rows={3}
              maxLength={280}
              value={values.note}
              onChange={(event) => update({ note: event.target.value })}
            />
          </label>
          {reviewed ? (
            <div className="summary" tabIndex={-1} ref={summaryRef}>
              <p className="kicker">Check this first</p>
              <p>
                {values.name.trim()} · {serviceName(values.serviceId)} · {summaryWhen} at {values.time}. This is an
                enquiry, not a confirmed appointment.
              </p>
            </div>
          ) : null}
          <button className="button" type="submit" disabled={sending}>
            {sending ? "Opening" : reviewed ? actionLabel : "Review enquiry"}
          </button>
          <p className="reserve-note">
            {whatsappLink(site.whatsapp, "x")
              ? "Review the enquiry, then open WhatsApp and press send yourself. The visit is not booked until the shop replies."
              : "WhatsApp is not connected yet. You can still prepare the enquiry and send it by phone or email. Nothing is reserved from this page."}
          </p>
          <p className="form-status" role="status">
            {status}
            {fallbackLink ? (
              <>
                {" "}
                <a href={fallbackLink} target="_blank" rel="noopener">
                  Open the WhatsApp message
                </a>
              </>
            ) : null}
          </p>
        </form>
      </div>
    </section>
  );
}

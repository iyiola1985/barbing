import { scrollToId } from "./animation/smoothScroll";
import { activeServices, serviceName, site, weekdayName, type Weekday } from "./content/site";

export const BOOK_SERVICE_EVENT = "crispy-book-service";

export type Enquiry = {
  name: string;
  phone: string;
  email: string;
  serviceId: string;
  date: string;
  time: string;
  note: string;
};

export type EnquiryErrors = Partial<Record<"name" | "phone" | "email" | "serviceId" | "date" | "time", string>>;

export function requestService(serviceId: string): void {
  window.dispatchEvent(new CustomEvent(BOOK_SERVICE_EVENT, { detail: serviceId }));
  scrollToId("reserve");
}

export function whatsappDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 ? digits : "";
}

export function whatsappLink(number: string, message: string): string {
  const digits = whatsappDigits(number);
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function mapsLink(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function localISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function minutesOf(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function enquiryMessage(enquiry: Enquiry): string {
  const when = new Date(`${enquiry.date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const lines = [
    "Hello, I would like to book an appointment.",
    "",
    `Name: ${enquiry.name.trim()}`,
    `Phone: ${enquiry.phone.trim()}`,
    enquiry.email.trim() ? `Email: ${enquiry.email.trim()}` : "",
    `Service: ${serviceName(enquiry.serviceId)}`,
    `Preferred date: ${when}`,
    `Preferred time: ${enquiry.time}`,
    enquiry.note.trim() ? `Notes: ${enquiry.note.trim()}` : "",
    "",
    "Please let me know if this time is available.",
  ];
  return lines.filter((line) => line !== "").join("\n");
}

export function validateEnquiry(enquiry: Enquiry, today = localISODate(new Date())): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (enquiry.name.trim().length < 2) errors.name = "Enter the name for the booking.";
  if (enquiry.phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a phone number the shop can use.";
  if (enquiry.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email.trim())) {
    errors.email = "Enter a valid email or leave it blank.";
  }
  if (!activeServices().some((service) => service.id === enquiry.serviceId)) errors.serviceId = "Choose a service.";
  if (!enquiry.date) errors.date = "Choose a date.";
  else if (enquiry.date < today) errors.date = "That day has already passed.";
  else {
    const weekday = weekdayName(enquiry.date);
    if (weekday && site.unpublishedDays.includes(weekday)) {
      errors.date = `${weekday} is not on the published hours. Choose another day, or call the shop.`;
    }
  }

  const chosen = minutesOf(enquiry.time);
  const open = minutesOf(site.booking.open);
  const close = minutesOf(site.booking.close);
  if (chosen === null) errors.time = "Choose a time.";
  else if (open === null || close === null || chosen < open || chosen > close) {
    errors.time = `Choose a time between ${site.booking.open} and ${site.booking.close}.`;
  }
  return errors;
}

export function isClosedWeekday(day: Weekday): boolean {
  return site.unpublishedDays.includes(day);
}

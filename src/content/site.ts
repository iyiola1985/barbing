/**
 * Shop details live here. Empty strings are hidden.
 * A price stays blank until you set a number above 0.
 * Currency is KES. The public site lists naira prices; those are not copied here.
 */

export const chapters = [
  { id: "opening", label: "01  Opening" },
  { id: "creed", label: "02  About" },
] as const;

export type HeroBeat = {
  kicker: string;
  title: string;
  emphasis?: string;
  lede: string;
  mark?: boolean;
};

export type ServiceGroup = "Haircuts" | "Beard grooming" | "Kids' cuts" | "Grooming combinations";

export type Service = {
  id: string;
  group: ServiceGroup;
  name: string;
  detail: string;
  minutes: number | null;
  price: number | null;
  featured?: boolean;
  enabled?: boolean;
};

export type GalleryImage = {
  src: string;
  alt: string;
  category: string;
};

export type StaffMember = {
  name: string;
  specialty: string;
  bio: string;
  photo: string;
};

export type Testimonial = {
  name: string;
  quote: string;
};

export type NavItem = {
  id: string;
  label: string;
};

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export type Weekday = (typeof weekdays)[number];

export const site = {
  name: "Crispy Barbers Lounge",
  tagline: "Your style. Your standard.",
  description:
    "Sharp cuts, clean fades, and precision grooming at Crispy Barbers Lounge in Ikorodu and Abeokuta.",
  logo: "/logo.jpg",
  currency: "KES",
  whatsapp: "",
  phone: "07069713633",
  phoneE164: "+2347069713633",
  email: "info@crispybarberslounge.com",
  locations: [
    { label: "Ikorodu", address: "76 Ayangburen Road, Ikorodu, Lagos", country: "NG" },
    { label: "Abeokuta", address: "77 Totoro Road, Abeokuta, Ogun", country: "NG" },
  ],
  hours: [
    {
      label: "Monday, Tuesday, Thursday – Sunday",
      days: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday", "Sunday"] satisfies Weekday[],
      open: "09:00",
      close: "21:00",
    },
  ],
  unpublishedDays: ["Wednesday"] as Weekday[],
  booking: {
    open: "09:00",
    close: "21:00",
    stepMinutes: 30,
  },
  socials: [] as { label: string; href: string }[],
  nav: [
    { id: "opening", label: "Home" },
    { id: "creed", label: "About" },
  ] satisfies NavItem[],
  book: { id: "footer", label: "Book an appointment" },
  hero: {
    beats: [
      {
        kicker: "Crispy Barbers Lounge",
        title: "Sharp cuts.",
        emphasis: "Clean fades.",
        lede: "Precision grooming, with a haircut tailored to you.",
        mark: true,
      },
    ] satisfies HeroBeat[],
  },
  creed: {
    kicker: "About",
    lines: [
      { text: "More than a haircut.", emphasis: false },
      { text: "It's an experience.", emphasis: true },
    ],
    paragraphs: [
      "We believe a great haircut is about more than appearance. It is about confidence, personal style, and the details that make you feel your best. Our goal is to deliver carefully executed cuts, professional grooming, and a welcoming experience every time you sit in the chair.",
    ],
    pillars: [
      { title: "Precision", copy: "Attention to detail in every cut and finish." },
      { title: "Personal style", copy: "A look tailored to your preferences." },
      { title: "Quality service", copy: "A clean, comfortable, customer-focused experience." },
    ],
  },
  ritual: {
    kicker: "The sitting",
    steps: [
      {
        index: "01",
        title: "The look",
        copy: "Tell us the shape you want. The cut starts from that, and from the hair you already have.",
      },
      {
        index: "02",
        title: "The cut",
        copy: "Weight comes out first. The line follows the head, then the neck, then the smallest edge.",
      },
      {
        index: "03",
        title: "The detail",
        copy: "Beard, line-up, or a clean finish — only the work you asked for.",
      },
      {
        index: "04",
        title: "The mirror",
        copy: "You see the cut before you leave the chair.",
      },
    ],
  },
  services: {
    kicker: "Services",
    title: "The art of a fresh cut.",
    lede: "From timeless classics to modern fades, find the grooming service that fits your style.",
    items: [
      {
        id: "classic-haircut",
        group: "Haircuts",
        name: "Classic Haircut",
        detail: "A clean, carefully shaped haircut designed around your preferred style.",
        minutes: null,
        price: null,
        featured: true,
      },
      {
        id: "fade",
        group: "Haircuts",
        name: "Low, Mid & High Fade",
        detail: "A smooth, blended fade with a sharp finish and attention to every detail.",
        minutes: null,
        price: null,
      },
      {
        id: "skin-fade",
        group: "Haircuts",
        name: "Skin Fade",
        detail: "A close, seamless fade for a crisp, modern look.",
        minutes: null,
        price: null,
      },
      {
        id: "combo",
        group: "Grooming combinations",
        name: "Haircut & Beard Combo",
        detail: "A coordinated haircut and beard finish for a clean, balanced appearance.",
        minutes: null,
        price: null,
      },
      {
        id: "beard",
        group: "Beard grooming",
        name: "Beard Trim & Shaping",
        detail: "Keep your beard neat, defined, and shaped to complement your look.",
        minutes: null,
        price: null,
      },
      {
        id: "line-up",
        group: "Beard grooming",
        name: "Precision Line-up",
        detail: "Clean edges and a defined hairline for a sharp finishing touch.",
        minutes: null,
        price: null,
      },
      {
        id: "kids",
        group: "Kids' cuts",
        name: "Kids' Haircut",
        detail: "A neat, comfortable haircut tailored to younger clients.",
        minutes: null,
        price: null,
      },
      {
        id: "wash",
        group: "Haircuts",
        name: "Haircut & Wash",
        detail: "A refreshing wash and haircut for a clean, finished look.",
        minutes: null,
        price: null,
        enabled: false,
      },
    ] satisfies Service[],
  },
  pricing: {
    kicker: "Pricing",
    title: "Quality grooming. Clear pricing.",
  },
  why: {
    kicker: "The visit",
    title: "Why sit with us.",
    items: [
      { title: "Precision & detail", copy: "Edges, blends, and finishes worked until they are clean." },
      { title: "Personalised service", copy: "The cut follows your preference, not a default shape." },
      { title: "Clean & comfortable", copy: "A looked-after chair and a calm room for the sitting." },
      { title: "Easy booking", copy: "Send an enquiry by phone, email, or WhatsApp once it is connected." },
    ],
  },
  gallery: [] as GalleryImage[],
  staff: [] as StaffMember[],
  testimonials: [] as Testimonial[],
  reserve: {
    kicker: "Appointment",
    title: "Name the hour.",
    lede: "Tell us the service and the time you prefer. This form does not reserve the chair until the shop confirms it.",
  },
  contact: {
    kicker: "Contact",
    title: "Find the lounge.",
    lede: "Two lounges. Call or email, and the shop will answer.",
  },
};

export function activeServices(): Service[] {
  return site.services.items.filter((service) => service.enabled !== false);
}

export function formatPrice(amount: number | null): string {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return "Price to be confirmed";
  }
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: site.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function serviceById(id: string): Service | undefined {
  return activeServices().find((service) => service.id === id);
}

export function serviceName(id: string): string {
  return serviceById(id)?.name ?? "";
}

export function visibleNav(): NavItem[] {
  return site.nav.filter((item) => item.id !== "gallery" || site.gallery.length > 0);
}

export function weekdayName(isoDate: string): Weekday | null {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return weekdays[parsed.getDay()] ?? null;
}

export function businessJsonLd(): Record<string, unknown> | null {
  if (!site.name || !site.phoneE164 || site.locations.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: site.name,
    telephone: site.phoneE164,
    email: site.email || undefined,
    address: site.locations.map((place) => ({
      "@type": "PostalAddress",
      streetAddress: place.address,
      addressCountry: place.country,
    })),
    openingHoursSpecification: site.hours.map((row) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: row.days,
      opens: row.open,
      closes: row.close,
    })),
  };
}

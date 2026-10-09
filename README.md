# Crispy Barbers Lounge

The site keeps the cinematic scroll: a pinned chair study, then the sitting, services, and booking. Copy, prices, contact details, hours, gallery photos, and staff live in `src/content/site.ts`. Color and type live in `src/styles/global.css`.

## Run

```bash
npm install
npm run dev
```

`npm run build` type-checks, then builds.

## What to fill in before launch

In `src/content/site.ts`:

- `whatsapp` — leave it empty until you have the real number. The site hides WhatsApp buttons rather than inventing a link.
- `services[].price` — set a number above 0, in KES. Blank prices show “Price to be confirmed”. Do not paste the naira menu in as shillings.
- `services[].minutes` — optional.
- Set `enabled: false` on any service the shop does not offer. Haircut & Wash starts off.
- `gallery` — your own photographs, with a real `alt`. The gallery stays hidden while this list is empty.
- `staff` and `testimonials` — empty lists stay off the page. Do not add sample people or sample quotes.
- `hours` and `unpublishedDays` — Wednesday is omitted because the published hours do not list it.

The logo file is `public/logo.jpg`.

## Booking

Nothing on this page reserves a chair. The form checks the details, shows a summary, then opens WhatsApp or the shop email so the guest can send the enquiry themselves.

`submitReservation` in `src/reservation.ts` is the only place a request could reach a booking server. It currently returns `not-configured` and does not send anything. Point it at a real endpoint, and return `{ status: "sent" }` only after that endpoint accepts the enquiry.

## Chair frames

The opening still draws a stand-in chair until frame files exist. To replace it:

```bash
npm run frames -- "/path/to/chair.mp4" 120
```

That needs `ffmpeg`. It writes `public/sequences/chair/frame_0001.jpg` and `manifest.json`.

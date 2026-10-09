import type { Enquiry } from "./booking";

export type BookingResult = { status: "sent" } | { status: "not-configured" };

/**
 * The only place an enquiry can reach a booking server.
 * It does not send anything yet. Wire a real endpoint here before treating a request as received.
 */
export async function submitReservation(_enquiry: Enquiry): Promise<BookingResult> {
  return { status: "not-configured" };
}

import type { Metadata } from "next";
import { EventsPage } from "../components/EventsPage";

export const metadata: Metadata = {
  title: "Events — Burmese Catholic Community of Western Australia",
  description:
    "Upcoming Mass times, cultural festivals, service missions, youth gatherings, and learning workshops for the Burmese Catholic Community of WA.",
};

export default function Events() {
  return <EventsPage />;
}

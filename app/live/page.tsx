import type { Metadata } from "next";
import { LivePage } from "../components/LivePage";

export const metadata: Metadata = {
  title: "Live — Burmese Catholic Community of Western Australia",
  description:
    "Watch Facebook and YouTube live streams from the Burmese Catholic Community of Western Australia.",
};

export default function Live() {
  return <LivePage />;
}

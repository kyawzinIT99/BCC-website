import type { Metadata } from "next";
import { LivePage } from "../components/LivePage";

export const metadata: Metadata = {
  title: "Live — Burmese Catholic Community of Western Australia",
  description:
    "Watch Facebook, YouTube and TikTok live streams from the Burmese Catholic Community of Western Australia.",
};

export default function Live() {
  return <LivePage />;
}

import type { Metadata } from "next";
import { GalleryPage } from "../components/GalleryPage";

export const metadata: Metadata = {
  title: "Photo Gallery — Burmese Catholic Community of Western Australia",
  description:
    "Browse photos from community events, service missions, and gatherings of the Burmese Catholic Community of Western Australia.",
};

export default function Gallery() {
  return <GalleryPage />;
}

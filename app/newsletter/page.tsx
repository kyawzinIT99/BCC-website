import type { Metadata } from "next";
import { SectionPage } from "../components/SectionPage";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Read the latest BCCWA newsletter and browse past PDF issues.",
};

export default function NewsletterPage() {
  return <SectionPage sectionKey="certificates" />;
}

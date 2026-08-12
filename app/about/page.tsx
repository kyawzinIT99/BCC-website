import type { Metadata } from "next";
import { SectionPage } from "../components/SectionPage";

export const metadata: Metadata = { title: "About BCC WA LIVECHECK 2213" };

export default function AboutPage() {
  return <SectionPage sectionKey="about" />;
}


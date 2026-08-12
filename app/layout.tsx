import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ||
    requestHeaders.get("host") ||
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ||
    (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const title = "Burmese Catholic Community of Western Australia";
  const description =
    "Community-led Australian action grounded in dignity, local voices and responsible partnership.";

  return {
    metadataBase: base,
    title: {
      default: title,
      template: "%s | BCCWA",
    },
    description,
    icons: {
      icon: "/_next/static/brand/favicon.png",
      shortcut: "/_next/static/brand/favicon.png",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: base,
      images: [
        {
          url: new URL("/og-australian-spirit.png", base).toString(),
          width: 1674,
          height: 942,
          alt: "Burmese Catholic Community of Western Australia",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL("/og-australian-spirit.png", base).toString()],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

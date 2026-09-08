/** Admin-controlled structured content for Giving and Newsletter pages. */

export type GivingContent = {
  amountLabel: string;
  amountValue: string;
  totalLabel: string;
  totalValue: string;
  showAmounts: boolean;
  note: string;
  howToGive: string;
  updatedLabel: string;
};

export type NewsletterItem = {
  id: string;
  title: string;
  issueDate: string;
  description: string;
  pdfUrl: string;
  fileName: string;
  visible: boolean;
};

export type NewsletterContent = {
  galleryIntro: string;
  items: NewsletterItem[];
};

// Keep these aliases while the persisted page key remains `certificates`.
export type CertificateItem = NewsletterItem;
export type CertificatesContent = NewsletterContent;

export type PageStructuredContent = {
  giving?: GivingContent;
  certificates?: CertificatesContent;
};

export const defaultGivingContent: GivingContent = {
  amountLabel: "Current appeal",
  amountValue: "AUD 0",
  totalLabel: "Total received this year",
  totalValue: "AUD 0",
  showAmounts: true,
  note:
    "These figures are published by authorised administrators for community transparency. They are not a live payment system.",
  howToGive:
    "To support BCC WA, contact the community through Get Involved. Payment instructions are shared only through authorised channels after committee approval.",
  updatedLabel: "Updated by Admin",
};

export const defaultCertificatesContent: CertificatesContent = {
  galleryIntro:
    "Read the latest BCCWA community newsletter or revisit an earlier issue. Newsletters remain in this public archive after authorised administrators publish them.",
  items: [
    {
      id: "newsletter-2026-09",
      title: "BCCWA Newsletter - September 2026",
      issueDate: "6 September 2026",
      description: "Community news, parish updates, committee information and upcoming activities.",
      pdfUrl: "/newsletters/newsletter-september-2026.pdf",
      fileName: "Newsletter for September 2026.pdf",
      visible: true,
    },
  ],
};

function isSafeDocumentHref(value: string) {
  return (
    !value ||
    value.startsWith("/") ||
    value.startsWith("https://") ||
    value.startsWith("http://localhost")
  );
}

export function normalizeGivingContent(value: unknown): GivingContent {
  const raw = value && typeof value === "object" ? (value as Partial<GivingContent>) : {};
  return {
    amountLabel: String(raw.amountLabel || defaultGivingContent.amountLabel).trim().slice(0, 80) || defaultGivingContent.amountLabel,
    amountValue: String(raw.amountValue || defaultGivingContent.amountValue).trim().slice(0, 40) || defaultGivingContent.amountValue,
    totalLabel: String(raw.totalLabel || defaultGivingContent.totalLabel).trim().slice(0, 80) || defaultGivingContent.totalLabel,
    totalValue: String(raw.totalValue || defaultGivingContent.totalValue).trim().slice(0, 40) || defaultGivingContent.totalValue,
    showAmounts: raw.showAmounts !== false,
    note: String(raw.note || defaultGivingContent.note).trim().slice(0, 600) || defaultGivingContent.note,
    howToGive: String(raw.howToGive || defaultGivingContent.howToGive).trim().slice(0, 800) || defaultGivingContent.howToGive,
    updatedLabel: String(raw.updatedLabel || defaultGivingContent.updatedLabel).trim().slice(0, 80) || defaultGivingContent.updatedLabel,
  };
}

export function normalizeCertificatesContent(value: unknown): CertificatesContent {
  const raw = value && typeof value === "object" ? (value as Partial<CertificatesContent>) : {};
  const hasNewsletterItems = Array.isArray(raw.items) && raw.items.some(
    (item) => item && typeof item === "object" && "pdfUrl" in item,
  );
  const source = hasNewsletterItems ? raw.items! : defaultCertificatesContent.items;
  const items = source.slice(0, 60).map((item, index) => {
    const row = item && typeof item === "object" ? (item as Partial<CertificateItem>) : {};
    const pdfUrl = String(row.pdfUrl || "").trim().slice(0, 500);
    return {
      id: String(row.id || `newsletter-${index + 1}`).trim().slice(0, 60) || `newsletter-${index + 1}`,
      title: String(row.title || "Community newsletter").trim().slice(0, 160) || "Community newsletter",
      issueDate: String(row.issueDate || "").trim().slice(0, 60),
      description: String(row.description || "").trim().slice(0, 400),
      pdfUrl: isSafeDocumentHref(pdfUrl) ? pdfUrl : "",
      fileName: String(row.fileName || `${row.title || "newsletter"}.pdf`).trim().slice(0, 180),
      visible: Boolean(row.visible),
    };
  });
  return {
    galleryIntro:
      String(
        (hasNewsletterItems ? raw.galleryIntro : "") || defaultCertificatesContent.galleryIntro,
      ).trim().slice(0, 500) ||
      defaultCertificatesContent.galleryIntro,
    items: items.length ? items : defaultCertificatesContent.items.map((item) => ({ ...item })),
  };
}

export function parsePageContent(key: string, value: unknown): PageStructuredContent {
  let parsed: Record<string, unknown> = {};
  try {
    if (typeof value === "string") parsed = JSON.parse(value || "{}");
    else if (value && typeof value === "object") parsed = value as Record<string, unknown>;
  } catch {
    parsed = {};
  }
  if (key === "giving") {
    return { giving: normalizeGivingContent(parsed.giving ?? parsed) };
  }
  if (key === "certificates") {
    return { certificates: normalizeCertificatesContent(parsed.certificates ?? parsed) };
  }
  return {};
}

export function serializePageContent(key: string, content: PageStructuredContent | undefined) {
  if (key === "giving") {
    return JSON.stringify({ giving: normalizeGivingContent(content?.giving) });
  }
  if (key === "certificates") {
    return JSON.stringify({ certificates: normalizeCertificatesContent(content?.certificates) });
  }
  return "{}";
}

export function supportsPageContent(key: string): key is "giving" | "certificates" {
  return key === "giving" || key === "certificates";
}

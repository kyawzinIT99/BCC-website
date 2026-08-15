export type LivePlatform = "youtube" | "facebook";
export type LiveStatus = "draft" | "live" | "ended";

export type LiveStream = {
  id: number;
  title: string;
  platform: LivePlatform;
  sourceUrl: string;
  embedUrl: string;
  description: string;
  status: LiveStatus;
  createdAt?: string;
};

export type ParsedLiveUrl = {
  platform: LivePlatform;
  sourceUrl: string;
  embedUrl: string;
};

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const FACEBOOK_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "web.facebook.com",
  "m.facebook.com",
  "fb.watch",
  "www.fb.watch",
]);

function hostnameOf(value: string) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function youtubeVideoId(url: URL) {
  if (url.hostname === "youtu.be" || url.hostname === "www.youtu.be") {
    return url.pathname.replace(/^\//, "").split("/")[0] || "";
  }
  const fromQuery = url.searchParams.get("v") || "";
  if (fromQuery) return fromQuery;
  const parts = url.pathname.split("/").filter(Boolean);
  const marker = parts.findIndex((part) =>
    ["embed", "live", "shorts", "v"].includes(part),
  );
  if (marker >= 0 && parts[marker + 1]) return parts[marker + 1];
  return "";
}

function isSafeHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseLiveUrl(
  raw: string,
  preferred?: LivePlatform | "",
): ParsedLiveUrl | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Paste a YouTube or Facebook live URL" };
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { error: "Enter a full https:// YouTube or Facebook link" };
  }
  if (url.protocol !== "https:") {
    return { error: "Only https links are allowed" };
  }

  const host = url.hostname.toLowerCase();
  const looksYoutube = YOUTUBE_HOSTS.has(host);
  const looksFacebook = FACEBOOK_HOSTS.has(host);
  const platform: LivePlatform | null = preferred
    ? preferred
    : looksYoutube
      ? "youtube"
      : looksFacebook
        ? "facebook"
        : null;

  if (!platform) {
    return { error: "Use a youtube.com, youtu.be, facebook.com, or fb.watch link" };
  }
  if (platform === "youtube" && !looksYoutube) {
    return { error: "YouTube streams must use a YouTube URL" };
  }
  if (platform === "facebook" && !looksFacebook) {
    return { error: "Facebook streams must use a Facebook URL" };
  }

  if (platform === "youtube") {
    const id = youtubeVideoId(url).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 20);
    if (!id || id.length < 6) {
      return { error: "Could not find a YouTube video id in that link" };
    }
    return {
      platform,
      sourceUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
    };
  }

  const sourceUrl = (
    host === "fb.watch" || host === "www.fb.watch"
      ? `https://fb.watch${url.pathname}${url.search}`
      : `https://www.facebook.com${url.pathname}${url.search}`
  ).slice(0, 500);
  return {
    platform,
    sourceUrl,
    embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(sourceUrl)}&show_text=false`,
  };
}

export function isAllowedEmbedUrl(value: string) {
  if (!isSafeHttpsUrl(value)) return false;
  const host = hostnameOf(value);
  return (
    host === "www.youtube-nocookie.com" ||
    host === "www.youtube.com" ||
    host === "www.facebook.com"
  );
}

export function normalizeLiveStream(row: Record<string, unknown>): LiveStream {
  const platform = row.platform === "facebook" ? "facebook" : "youtube";
  const status =
    row.status === "live" || row.status === "ended" || row.status === "draft"
      ? row.status
      : "draft";
  const parsed = parseLiveUrl(String(row.source_url || row.sourceUrl || ""), platform);
  const fallback =
    "error" in parsed
      ? { sourceUrl: "", embedUrl: "" }
      : parsed;
  const embedUrl = String(row.embed_url || row.embedUrl || fallback.embedUrl);
  return {
    id: Number(row.id) || 0,
    title: String(row.title || "Community live").trim().slice(0, 160) || "Community live",
    platform,
    sourceUrl: String(row.source_url || row.sourceUrl || fallback.sourceUrl).slice(0, 500),
    embedUrl: isAllowedEmbedUrl(embedUrl) ? embedUrl : fallback.embedUrl,
    description: String(row.description || "").trim().slice(0, 800),
    status,
    createdAt: row.created_at ? String(row.created_at) : undefined,
  };
}

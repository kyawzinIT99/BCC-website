export type LivePlatform = "youtube" | "facebook" | "tiktok";

export const livePlatformLabels: Record<LivePlatform, string> = {
  youtube: "YouTube",
  facebook: "Facebook",
  tiktok: "TikTok",
};
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

const TIKTOK_HOSTS = new Set([
  "tiktok.com",
  "www.tiktok.com",
  "m.tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
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

function tiktokParts(url: URL) {
  const parts = url.pathname.split("/").filter(Boolean);
  const userPart = parts.find((part) => part.startsWith("@"));
  const username = userPart
    ? userPart.slice(1).replace(/[^a-zA-Z0-9._]/g, "").slice(0, 40)
    : "";
  const videoIdx = parts.findIndex((part) => part === "video" || part === "photo");
  const videoId =
    videoIdx >= 0 ? (parts[videoIdx + 1] || "").replace(/\D/g, "").slice(0, 24) : "";
  return {
    username,
    videoId,
    isLive: parts.includes("live"),
  };
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
  if (!trimmed) return { error: "Paste a YouTube, Facebook, or TikTok live URL" };
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { error: "Enter a full https:// YouTube, Facebook, or TikTok link" };
  }
  if (url.protocol !== "https:") {
    return { error: "Only https links are allowed" };
  }

  const host = url.hostname.toLowerCase();
  const looksYoutube = YOUTUBE_HOSTS.has(host);
  const looksFacebook = FACEBOOK_HOSTS.has(host);
  const looksTiktok = TIKTOK_HOSTS.has(host);
  const platform: LivePlatform | null = preferred
    ? preferred
    : looksYoutube
      ? "youtube"
      : looksFacebook
        ? "facebook"
        : looksTiktok
          ? "tiktok"
          : null;

  if (!platform) {
    return { error: "Use a YouTube, Facebook, or TikTok link" };
  }
  if (platform === "youtube" && !looksYoutube) {
    return { error: "YouTube streams must use a YouTube URL" };
  }
  if (platform === "facebook" && !looksFacebook) {
    return { error: "Facebook streams must use a Facebook URL" };
  }
  if (platform === "tiktok" && !looksTiktok) {
    return { error: "TikTok streams must use a TikTok URL" };
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

  if (platform === "tiktok") {
    if (host === "vm.tiktok.com" || host === "vt.tiktok.com") {
      return {
        error: "Open the TikTok live, then paste the full tiktok.com/@name/live link",
      };
    }
    const parts = tiktokParts(url);
    if (parts.videoId) {
      const sourceUrl = parts.username
        ? `https://www.tiktok.com/@${parts.username}/video/${parts.videoId}`
        : `https://www.tiktok.com/video/${parts.videoId}`;
      return {
        platform,
        sourceUrl: sourceUrl.slice(0, 500),
        embedUrl: `https://www.tiktok.com/embed/v2/${parts.videoId}`,
      };
    }
    if (parts.username) {
      const sourceUrl = parts.isLive
        ? `https://www.tiktok.com/@${parts.username}/live`
        : `https://www.tiktok.com/@${parts.username}`;
      return {
        platform,
        sourceUrl: sourceUrl.slice(0, 500),
        embedUrl: `https://www.tiktok.com/embed/@${parts.username}`,
      };
    }
    return { error: "Could not find a TikTok username or video in that link" };
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
    host === "www.facebook.com" ||
    host === "www.tiktok.com"
  );
}

function asLivePlatform(value: unknown): LivePlatform {
  return value === "facebook" || value === "tiktok" ? value : "youtube";
}

export function normalizeLiveStream(row: Record<string, unknown>): LiveStream {
  const platform = asLivePlatform(row.platform);
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

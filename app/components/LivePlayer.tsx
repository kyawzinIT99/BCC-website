import { livePlatformLabels, type LiveStream } from "../lib/live-stream";

export function LivePlayer({
  stream,
  titleId,
}: {
  stream: LiveStream;
  titleId?: string;
}) {
  if (!stream.embedUrl) return null;
  return (
    <div className="bcc-live-player">
      <div className={`bcc-live-frame${stream.platform === "tiktok" ? " bcc-live-frame--tiktok" : ""}`}>
        <iframe
          title={stream.title}
          src={stream.embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="bcc-live-meta">
        {stream.status === "live" ? <span className="bcc-live-dot">Live</span> : null}
        <h2 id={titleId}>{stream.title}</h2>
        {stream.description ? <p>{stream.description}</p> : null}
        <a href={stream.sourceUrl} target="_blank" rel="noreferrer">
          Watch on {livePlatformLabels[stream.platform]} ↗
        </a>
      </div>
    </div>
  );
}

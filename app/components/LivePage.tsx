"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LiveStream } from "../lib/live-stream";
import { liveCopyMy, usePublicLanguage } from "../lib/public-language";
import { LivePlayer } from "./LivePlayer";
import { MailSubscribe } from "./MailSubscribe";
import { PublicHeader } from "./PublicHeader";

export function LivePage() {
  const [language, setLanguage] = usePublicLanguage();
  const [current, setCurrent] = useState<LiveStream | null>(null);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loaded, setLoaded] = useState(false);
  const my = language === "my";

  useEffect(() => {
    fetch("/api/live")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setCurrent(d.current || null);
        setStreams(Array.isArray(d.streams) ? d.streams : []);
      })
      .catch(() => {
        setCurrent(null);
        setStreams([]);
      })
      .finally(() => setLoaded(true));
  }, []);

  const past = streams.filter((item) => item.status === "ended");

  return (
    <main className="public-site civic-public-site v2-redesign" lang={my ? "my" : undefined}>
      <PublicHeader
        activeHref="/live"
        language={language}
        onLanguageChange={setLanguage}
      />

      <section className="v2-events-hero">
        <div className="v2-events-hero-content">
          <p className="v2-section-eyebrow">{my ? liveCopyMy.eyebrow : "Watch with the community"}</p>
          <h1>{my ? liveCopyMy.title : "Live"}</h1>
          <p className="v2-events-subtitle">
            {my
              ? liveCopyMy.subtitle
              : "Facebook and YouTube live streams published by authorised administrators."}
          </p>
        </div>
      </section>

      <section className="bcc-live-section" aria-labelledby="live-now-title">
        {!loaded ? (
          <p className="bcc-live-empty">{my ? liveCopyMy.loading : "Loading…"}</p>
        ) : current ? (
          <LivePlayer stream={current} titleId="live-now-title" />
        ) : (
          <div className="bcc-live-empty" id="live-now-title">
            <p>{my ? liveCopyMy.empty : "There is no live stream right now. Check back when Mass or a community gathering is on air."}</p>
          </div>
        )}
      </section>

      {past.length > 0 ? (
        <section className="bcc-live-section" aria-labelledby="recent-live-title">
          <h2 id="recent-live-title" className="bcc-live-heading">
            {my ? liveCopyMy.recent : "Recent streams"}
          </h2>
          <div className="bcc-live-grid">
            {past.map((item) => (
              <LivePlayer key={item.id} stream={item} />
            ))}
          </div>
        </section>
      ) : null}

      <MailSubscribe source="live" compact />

      <section className="v2-events-cta">
        <div className="v2-events-cta-inner">
          <div>
            <h2>{my ? liveCopyMy.ctaTitle : "Join us in person too"}</h2>
            <p>
              {my
                ? liveCopyMy.ctaBody
                : "See upcoming Mass times and gatherings on the Events page, or send a message through Get Involved."}
            </p>
          </div>
          <Link href="/events" className="v2-btn v2-btn-gold">
            {my ? liveCopyMy.events : "View events"}
          </Link>
        </div>
      </section>
    </main>
  );
}

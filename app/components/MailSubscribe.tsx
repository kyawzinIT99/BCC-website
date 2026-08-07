"use client";

import { FormEvent, useState } from "react";

export function MailSubscribe({
  source = "website",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          consent: form.get("consent") === "on",
          source,
          website: form.get("website"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to subscribe right now.");
      }
      setNotice(
        payload.message ||
          "Thanks — you will receive community event updates by email.",
      );
      event.currentTarget.reset();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to subscribe right now.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={compact ? "mail-subscribe is-compact" : "mail-subscribe"}
      aria-labelledby="mail-subscribe-title"
    >
      <div className="mail-subscribe-copy">
        <p className="mail-subscribe-eyebrow">Stay updated</p>
        <h2 id="mail-subscribe-title">Get upcoming event emails</h2>
        <p>
          Subscribe for approved community notices. Your email stays private —
          staff are alerted, and n8n can send mail when a new event is published.
        </p>
      </div>
      <form className="mail-subscribe-form" onSubmit={onSubmit}>
        <label>
          Name
          <input
            name="name"
            type="text"
            maxLength={80}
            autoComplete="name"
            placeholder="Your name"
          />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <label className="mail-subscribe-honeypot" aria-hidden="true">
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
        <label className="mail-subscribe-consent">
          <input name="consent" type="checkbox" required />
          <span>
            I agree to receive community event updates by email. I understand I
            can ask staff to unsubscribe at any time.
          </span>
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Subscribing…" : "Subscribe"}
        </button>
        {notice ? (
          <p className="mail-subscribe-notice" role="status">
            {notice}
          </p>
        ) : null}
      </form>
    </section>
  );
}

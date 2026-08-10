"use client";

import { FormEvent, useState } from "react";
import { publicLanguages, type PublicLanguage } from "./PublicHeader";

export function PublicQuestionWidget({ language }: { language: PublicLanguage }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const preferredLanguage =
    publicLanguages.find((option) => option.code === language)?.label ?? "English";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setNotice("");
    const formEl = event.currentTarget;
    const form = new FormData(formEl);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "quick-question",
          kind: form.get("kind"),
          name: form.get("name"),
          email: form.get("email"),
          location: "",
          organisation: "",
          message: `[Preferred language: ${form.get("language")}]\n${form.get("message")}`,
          consent: form.get("consent") === "on",
          website: form.get("website"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to send your question.");
      formEl.reset();
      setNotice(
        `Thanks—your quick question was received as CK-${payload.reference}. ` +
        "For a staff reply or ongoing help, please use Get involved.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to send your question.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={open ? "public-question is-open" : "public-question"}>
      <button
        className="public-question-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="public-question-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span>Ask a question</span>
        <small>Safe, private and not public</small>
      </button>
      {open && (
        <section id="public-question-panel" aria-labelledby="public-question-title">
          <button
            className="public-question-close"
            type="button"
            aria-label="Close question form"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
          <p className="eyebrow">Private community enquiry</p>
          <h2 id="public-question-title">How can we help you find the right place to start?</h2>
          <p>
            Use this for a quick question. Simple greetings and general comments
            receive an automatic acknowledgement and do not require a staff reply.
            For a reply or ongoing help, use Get involved.
          </p>
          <form onSubmit={submit}>
            <label className="form-honeypot" aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <label>
              Topic
              <select name="kind" defaultValue="learning-referral">
                <option value="learning-referral">English learning</option>
                <option value="contact">Community information</option>
                <option value="volunteer">Volunteering</option>
                <option value="partnership">Partnership</option>
                <option value="donation-enquiry">Support or donation enquiry</option>
              </select>
            </label>
            <label>
              Preferred language
              <select name="language" defaultValue={preferredLanguage}>
                {publicLanguages.map((option) => (
                  <option value={option.label} key={option.code}>{option.label}</option>
                ))}
              </select>
            </label>
            <label>
              Name
              <input name="name" required minLength={2} maxLength={100} autoComplete="name" />
            </label>
            <label>
              Email (optional)
              <input name="email" type="email" maxLength={254} autoComplete="email" />
            </label>
            <label className="question-message">
              Your question
              <textarea name="message" required minLength={10} maxLength={3000} rows={4} />
            </label>
            <label className="question-consent">
              <input name="consent" type="checkbox" required />
              <span>I consent to authorised staff using these details to respond privately.</span>
            </label>
            <button className="question-submit" type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send privately"}
            </button>
            <a className="question-follow-up-link" href="/get-involved#community-contact">
              Need a staff reply? Use Get involved →
            </a>
            {notice && <p className="question-notice" role="status">{notice}</p>}
          </form>
        </section>
      )}
    </div>
  );
}

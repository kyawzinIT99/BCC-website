"use client";

import { FormEvent, useState } from "react";

export function CommunityContactForm() {
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [kind, setKind] = useState("learning-referral");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "get-involved",
          kind: form.get("kind"),
          name: form.get("name"),
          email: form.get("email"),
          organisation: form.get("organisation"),
          location: form.get("location"),
          message: form.get("message"),
          consent: form.get("consent") === "on",
          website: form.get("website"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to send your message");
      event.currentTarget.reset();
      setNotice(
        `Thank you. Your formal enquiry is CK-${payload.reference}. ` +
        "It has entered the administrator follow-up queue.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to send your message");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <section className="official-pathways" aria-labelledby="official-pathways-title">
        <div className="official-pathways-heading">
          <p className="eyebrow">Authorised pathways</p>
          <h2 id="official-pathways-title">Start with the right service.</h2>
          <p>
            Burmese Catholic Community of Western Australia can help people navigate reliable information, but it
            does not replace Australian Government programs or charity regulators.
          </p>
        </div>
        <div className="official-pathway-grid">
          <article className="learning-pathway-card">
            <span>01 / LEARNING</span>
            <h3>Find free English learning.</h3>
            <p>
              Eligible migrants and humanitarian entrants can learn English
              through the Australian Government&apos;s Adult Migrant English
              Program. Authorised AMEP providers confirm eligibility,
              enrolment, class availability and how training is delivered.
            </p>
            <a href="https://immi.homeaffairs.gov.au/settling-in-australia/amep/find-a-class/providers-and-locations">
              Find an authorised AMEP provider →
            </a>
            <small>Official Australian Government website</small>
          </article>
          <article className="donation-pathway-card">
            <span>02 / SUPPORT</span>
            <h3>Give with confidence.</h3>
            <p>
              This website does not currently accept money. Before donating,
              use the ACNC Charity Register to verify a charity and review its
              public details.
            </p>
            <a href="https://www.acnc.gov.au/charity/charities">
              Search the ACNC Charity Register →
            </a>
            <small>Official Australian Government charity register</small>
          </article>
        </div>
      </section>

      <section className="community-contact" id="community-contact">
      <div>
        <p className="eyebrow">Private navigation request</p>
        <h2>Would you like help finding the next step?</h2>
        <p>
          Authorised website staff can help identify the appropriate public
          information or record a future support enquiry. We do not ask for
          visa status, payment-card details or bank information.
        </p>
      </div>
      <form onSubmit={submit}>
        <label className="form-honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <label>
          I am interested in
          <select
            name="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            <option value="learning-referral">Help finding authorised English classes</option>
            <option value="donation-enquiry">Donation or funding enquiry</option>
            <option value="volunteer">Volunteering</option>
            <option value="partnership">Partnership</option>
            <option value="contact">General contact</option>
          </select>
        </label>
        <label>
          Name
          <input name="name" required minLength={2} maxLength={100} autoComplete="name" />
        </label>
        <label>
          Email
          <input name="email" type="email" required maxLength={254} autoComplete="email" />
        </label>
        <label>
          Organisation (optional)
          <input name="organisation" maxLength={140} autoComplete="organization" />
        </label>
        <label>
          Australian suburb or region (optional)
          <input name="location" maxLength={140} autoComplete="address-level2" />
        </label>
        <label className="message-field">
          {kind === "learning-referral"
            ? "What help do you need finding a class?"
            : kind === "donation-enquiry"
              ? "How would you like to support the organisation?"
              : "Message"}
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={3000}
            rows={5}
            placeholder={
              kind === "learning-referral"
                ? "For example: your preferred area or help locating an authorised provider. Do not include visa documents."
                : kind === "donation-enquiry"
                  ? "Ask a question about future support. Do not include card, bank or payment details."
                  : "Tell authorised staff how they may help."
            }
          />
        </label>
        <label className="consent-check">
          <input name="consent" type="checkbox" required />
          <span>I consent to authorised staff using these details to respond to this inquiry.</span>
        </label>
        <button type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send securely →"}
        </button>
        {notice && <p className="contact-notice" role="status">{notice}</p>}
      </form>
      </section>
    </>
  );
}

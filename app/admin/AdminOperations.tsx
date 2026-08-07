"use client";

import { FormEvent, useEffect, useState } from "react";
import type { StaffUser } from "../lib/auth";

type AuditEvent = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_name: string | null;
  created_at: string;
};

type Inquiry = {
  id: number;
  source: string;
  kind: string;
  name: string;
  email: string;
  organisation: string;
  location: string;
  message: string;
  follow_up_required: number | boolean;
  assigned_to: string;
  follow_up_by: string | null;
  status: string;
  created_at: string;
};

const inquiryLabels: Record<string, string> = {
  "learning-referral": "AMEP learning referral",
  "donation-enquiry": "Donation or funding enquiry",
  volunteer: "Volunteer",
  partnership: "Partnership",
  contact: "General contact",
};

const inquirySourceLabels: Record<string, string> = {
  "quick-question": "Ask a question",
  "get-involved": "Get involved",
};

type MediaItem = {
  id: number;
  filename: string;
  content_type: string;
  size: number;
  uploaded_by: string;
  created_at: string;
};

export function AdminOperations({ currentUser }: { currentUser: StaffUser }) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/media")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => setMedia(payload.media || []))
      .catch(() => setMedia([]));
    if (currentUser.role === "editor") return;
    Promise.all([
      fetch("/api/audit").then((response) => response.ok ? response.json() : Promise.reject()),
      fetch("/api/inquiries").then((response) => response.ok ? response.json() : Promise.reject()),
    ])
      .then(([auditPayload, inquiryPayload]) => {
        setEvents(auditPayload.events || []);
        setInquiries(inquiryPayload.inquiries || []);
      })
      .catch(() => setNotice("Some operational records are temporarily unavailable."));
  }, [currentUser.role]);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setNotice("");
    const response = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: values.get("currentPassword"),
        newPassword: values.get("newPassword"),
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setNotice(payload.error || "Unable to change password");
      return;
    }
    form.reset();
    setNotice("Password changed. Other active sessions were closed.");
  }

  async function patchInquiry(
    id: number,
    payload: Record<string, unknown>,
    localPatch: Partial<Inquiry>,
    successNotice: string,
  ) {
    const response = await fetch("/api/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    if (!response.ok) {
      setNotice("Unable to update the inquiry.");
      return false;
    }
    setInquiries((current) =>
      current.map((item) => item.id === id ? { ...item, ...localPatch } : item),
    );
    setNotice(successNotice);
    return true;
  }

  const formalInquiries = inquiries.filter((item) => Boolean(item.follow_up_required));
  const quickQuestions = inquiries.filter(
    (item) => !item.follow_up_required && item.status !== "closed",
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <section className="operations-panel" id="security">
        <div className="panel-heading">
          <div><p>ACCOUNT SECURITY</p><h2>Password and active sessions</h2></div>
          <span>{currentUser.mustChangePassword ? "Action required" : "Protected"}</span>
        </div>
        <form className="password-form" onSubmit={changePassword}>
          <label>Current password<input name="currentPassword" type="password" required /></label>
          <label>New password<input name="newPassword" type="password" minLength={12} maxLength={128} required /></label>
          <button className="button-review" type="submit">Change password</button>
        </form>
        {notice && <div className="admin-notice" role="status">{notice}</div>}
      </section>

      <section className="operations-panel" id="media-library">
        <div className="panel-heading">
          <div><p>MEDIA LIBRARY</p><h2>Verified uploads</h2></div>
          <span>{media.length} files</span>
        </div>
        <div className="compact-list">
          {media.slice(0, 8).map((item) => (
            <article key={item.id}>
              <strong>{item.filename}</strong>
              <span>{item.content_type} · {(item.size / 1024).toFixed(0)} KB</span>
              <small>{item.uploaded_by}</small>
            </article>
          ))}
          {!media.length && <p>No staff media has been uploaded.</p>}
        </div>
      </section>

      {currentUser.role !== "editor" && (
        <>
          <section className="operations-panel" id="inquiries">
            <div className="panel-heading">
              <div><p>PRIVATE INQUIRIES</p><h2>Community follow-up queue</h2></div>
              <span>
                {formalInquiries.filter((item) => item.status === "new").length} new ·{" "}
                {formalInquiries.filter((item) =>
                  item.status === "in-progress" || item.status === "waiting"
                ).length} active
              </span>
            </div>
            <div className="inquiry-list">
              {formalInquiries.slice(0, 20).map((item) => {
                const overdue =
                  item.status !== "closed" &&
                  Boolean(item.follow_up_by) &&
                  item.follow_up_by! < today;
                return (
                  <article className={overdue ? "is-overdue" : ""} key={item.id}>
                    <div>
                      <span className="inquiry-source">
                        {inquirySourceLabels[item.source] || "Existing enquiry"}
                      </span>
                      <strong>CK-{item.id} · {item.name} · {inquiryLabels[item.kind] || item.kind}</strong>
                      {item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}
                      {(item.organisation || item.location) && (
                        <small>
                          {[item.organisation, item.location].filter(Boolean).join(" · ")}
                        </small>
                      )}
                      <p>{item.message}</p>
                      <time dateTime={item.created_at}>{item.created_at}</time>
                      {overdue && <b className="inquiry-overdue">Follow-up overdue</b>}
                    </div>
                    <div className="inquiry-controls">
                      <label>
                        Assigned to
                        <input
                          aria-label={`Assigned staff for inquiry from ${item.name}`}
                          defaultValue={item.assigned_to}
                          maxLength={100}
                          onBlur={(event) => {
                            const assignedTo = event.currentTarget.value.trim();
                            if (assignedTo === item.assigned_to) return;
                            void patchInquiry(
                              item.id,
                              { assignedTo },
                              { assigned_to: assignedTo },
                              `Inquiry CK-${item.id} assignment updated.`,
                            );
                          }}
                        />
                      </label>
                      <label>
                        Follow up by
                        <input
                          aria-label={`Follow-up deadline for inquiry from ${item.name}`}
                          type="date"
                          value={item.follow_up_by || ""}
                          onChange={(event) => {
                            const followUpBy = event.currentTarget.value;
                            void patchInquiry(
                              item.id,
                              { followUpBy },
                              { follow_up_by: followUpBy || null },
                              `Inquiry CK-${item.id} deadline updated.`,
                            );
                          }}
                        />
                      </label>
                      <label>
                        Status
                        <select
                          aria-label={`Status for inquiry from ${item.name}`}
                          value={item.status}
                          onChange={(event) => {
                            const status = event.currentTarget.value;
                            const label =
                              status === "in-progress"
                                ? "In progress"
                                : status === "waiting"
                                  ? "Waiting"
                                  : status === "closed"
                                    ? "Closed"
                                    : "New";
                            void patchInquiry(
                              item.id,
                              { status },
                              { status },
                              `Inquiry CK-${item.id} moved to ${label}.`,
                            );
                          }}
                        >
                          <option value="new">New</option>
                          <option value="in-progress">In progress</option>
                          <option value="waiting">Waiting</option>
                          <option value="closed">Closed</option>
                        </select>
                      </label>
                    </div>
                  </article>
                );
              })}
              {!formalInquiries.length && <p>No formal follow-up enquiries yet.</p>}
            </div>
          </section>

          <section className="operations-panel" id="quick-questions">
            <div className="panel-heading">
              <div><p>QUICK TRIAGE</p><h2>Ask a question</h2></div>
              <span>{quickQuestions.length} awaiting triage</span>
            </div>
            <div className="quick-question-list">
              {quickQuestions.slice(0, 20).map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>CK-{item.id} · {item.name}</strong>
                    {item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}
                    <p>{item.message}</p>
                    <time dateTime={item.created_at}>{item.created_at}</time>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => void patchInquiry(
                        item.id,
                        { followUpRequired: true },
                        { follow_up_required: true, status: "new" },
                        `Quick question CK-${item.id} promoted to formal follow-up.`,
                      )}
                    >
                      Promote to follow-up
                    </button>
                    <button
                      className="button-quiet"
                      type="button"
                      onClick={() => void patchInquiry(
                        item.id,
                        { status: "closed" },
                        { status: "closed" },
                        `Quick question CK-${item.id} archived without staff reply.`,
                      )}
                    >
                      No reply needed
                    </button>
                  </div>
                </article>
              ))}
              {!quickQuestions.length && <p>No quick questions require triage.</p>}
            </div>
          </section>

          <section className="operations-panel" id="audit">
            <div className="panel-heading">
              <div><p>AUDIT HISTORY</p><h2>Recent protected actions</h2></div>
              <span>Latest 100 retained</span>
            </div>
            <div className="compact-list">
              {events.slice(0, 12).map((event) => (
                <article key={event.id}>
                  <strong>{event.action.replaceAll(".", " ")}</strong>
                  <span>{event.entity_type} {event.entity_id || ""}</span>
                  <small>{event.actor_name || "System"} · {event.created_at}</small>
                </article>
              ))}
              {!events.length && <p>No protected actions have been recorded yet.</p>}
            </div>
          </section>
        </>
      )}
    </>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";

type EventItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  description: string;
  recurring: boolean;
  status: string;
};

const CATEGORIES = [
  { value: "mass", label: "Mass & Prayer" },
  { value: "cultural", label: "Cultural" },
  { value: "service", label: "Community Service" },
  { value: "youth", label: "Youth" },
  { value: "learning", label: "Learning" },
];

const emptyEvent = (): Omit<EventItem, "id"> => ({
  title: "",
  date: "",
  time: "",
  location: "",
  category: "cultural",
  description: "",
  recurring: false,
  status: "published",
});

export function EventsManager() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyEvent());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const loadEvents = () => {
    fetch("/api/events?scope=admin", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (Array.isArray(d.events)) setEvents(d.events);
      })
      .catch(() => setEvents([]));
  };

  useEffect(() => { loadEvents(); }, []);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyEvent());
    setCreating(true);
    setMsg("");
  };

  const startEdit = (ev: EventItem) => {
    setCreating(false);
    setEditing(ev);
    setForm({
      title: ev.title,
      date: ev.date,
      time: ev.time,
      location: ev.location,
      category: ev.category,
      description: ev.description,
      recurring: ev.recurring,
      status: ev.status,
    });
    setMsg("");
  };

  const cancel = () => {
    setCreating(false);
    setEditing(null);
    setMsg("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");

    try {
      const isNew = creating;
      const url = "/api/events";
      const method = isNew ? "POST" : "PATCH";
      const body = isNew
        ? form
        : { ...form, id: editing!.id };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }

      setMsg(isNew ? "✅ Event created!" : "✅ Event updated!");
      cancel();
      loadEvents();
    } catch (err: unknown) {
      setMsg(`❌ ${err instanceof Error ? err.message : "Error saving event"}`);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      loadEvents();
      setMsg("✅ Event deleted");
    } catch {
      setMsg("❌ Failed to delete event");
    } finally {
      setBusy(false);
    }
  };

  const showForm = creating || editing;

  return (
    <section className="events-manager" id="events">
      <div className="events-manager-header">
        <div>
          <h2>Community Events</h2>
          <p>Create and manage events shown on the public Events page.</p>
        </div>
        <button
          type="button"
          className="events-create-btn"
          onClick={startCreate}
        >
          + New Event
        </button>
      </div>

      {msg && <p className="events-msg">{msg}</p>}

      {/* ── Form ──────────────────────────────────────── */}
      {showForm && (
        <form className="events-form" onSubmit={handleSubmit}>
          <h3>{creating ? "Create Event" : `Edit: ${editing!.title}`}</h3>

          <div className="events-form-grid">
            <label>
              Title *
              <input
                type="text"
                value={form.title}
                maxLength={160}
                required
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Burmese Catholic Sunday Mass"
              />
            </label>

            <label>
              Date *
              <input
                type="date"
                value={form.date}
                required
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>

            <label>
              Time
              <input
                type="text"
                value={form.time}
                maxLength={60}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="e.g. 2:30 PM or 10:00 AM – 3:00 PM"
              />
            </label>

            <label>
              Location
              <input
                type="text"
                value={form.location}
                maxLength={200}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. St Bernadette's Church, Glendalough"
              />
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>

          <label>
            Description
            <textarea
              value={form.description}
              maxLength={2000}
              rows={3}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the event..."
            />
          </label>

          <label className="events-checkbox">
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
            />
            Recurring event (weekly/monthly)
          </label>

          <div className="events-form-actions">
            <button type="submit" disabled={busy} className="events-save-btn">
              {busy ? "Saving…" : creating ? "Create Event" : "Save Changes"}
            </button>
            <button type="button" onClick={cancel} className="events-cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Events List ───────────────────────────────── */}
      <div className="events-list-admin">
        {events.length === 0 ? (
          <p className="events-empty">
            No events yet. Click &quot;+ New Event&quot; to create your first event.
          </p>
        ) : (
          <table className="events-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Location</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} className={ev.status === "draft" ? "draft-row" : ""}>
                  <td className="events-date-cell">{ev.date}</td>
                  <td>
                    <strong>{ev.title}</strong>
                    {ev.recurring && <span className="events-recurring-badge">↻</span>}
                    {ev.time && <small>{ev.time}</small>}
                  </td>
                  <td>{ev.location}</td>
                  <td>
                    <span className="events-cat-badge" data-cat={ev.category}>
                      {ev.category}
                    </span>
                  </td>
                  <td>
                    <span className={`events-status-badge ${ev.status}`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="events-actions-cell">
                    <button type="button" onClick={() => startEdit(ev)}>Edit</button>
                    <button type="button" className="events-delete-btn" onClick={() => handleDelete(ev.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

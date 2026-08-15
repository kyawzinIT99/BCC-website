"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LivePlatform, LiveStatus, LiveStream } from "../lib/live-stream";

const emptyForm = () => ({
  title: "",
  platform: "youtube" as LivePlatform,
  sourceUrl: "",
  description: "",
  status: "live" as LiveStatus,
});

export function LiveStreamManager() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [editing, setEditing] = useState<LiveStream | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const loadStreams = () => {
    fetch("/api/live?scope=admin", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (Array.isArray(d.streams)) setStreams(d.streams);
      })
      .catch(() => setStreams([]));
  };

  useEffect(() => {
    loadStreams();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setCreating(true);
    setMsg("");
  };

  const startEdit = (item: LiveStream) => {
    setCreating(false);
    setEditing(item);
    setForm({
      title: item.title,
      platform: item.platform,
      sourceUrl: item.sourceUrl,
      description: item.description,
      status: item.status,
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
      const res = await fetch("/api/live", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(isNew ? form : { ...form, id: editing!.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      setMsg(isNew ? "✅ Live stream created." : "✅ Live stream updated.");
      cancel();
      loadStreams();
    } catch (err: unknown) {
      setMsg(`❌ ${err instanceof Error ? err.message : "Error saving live stream"}`);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this live stream? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/live?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      loadStreams();
      setMsg("✅ Live stream deleted");
    } catch {
      setMsg("❌ Failed to delete live stream");
    } finally {
      setBusy(false);
    }
  };

  const showForm = creating || editing;
  const current = streams.find((item) => item.status === "live");

  return (
    <section className="events-manager" id="live">
      <div className="events-manager-header">
        <div>
          <h2>Live stream</h2>
          <p>
            Paste a Facebook Live or YouTube URL. When status is Live now, it appears on the public Live page and Home.
          </p>
        </div>
        <button type="button" className="events-create-btn" onClick={startCreate}>
          + New live
        </button>
      </div>

      {current ? (
        <p className="events-msg">
          On the website now: <strong>{current.title}</strong> ({current.platform})
        </p>
      ) : null}
      {msg ? <p className="events-msg">{msg}</p> : null}

      {showForm ? (
        <form className="events-form" onSubmit={handleSubmit}>
          <h3>{creating ? "Create live stream" : `Edit: ${editing!.title}`}</h3>
          <div className="events-form-grid">
            <label>
              Title *
              <input
                type="text"
                value={form.title}
                maxLength={160}
                required
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Sunday Mass — live from Glendalough"
              />
            </label>
            <label>
              Platform *
              <select
                value={form.platform}
                onChange={(e) =>
                  setForm({ ...form, platform: e.target.value as LivePlatform })
                }
              >
                <option value="youtube">YouTube</option>
                <option value="facebook">Facebook</option>
              </select>
            </label>
            <label className="wide">
              Stream URL *
              <input
                type="url"
                value={form.sourceUrl}
                required
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                placeholder={
                  form.platform === "facebook"
                    ? "https://www.facebook.com/.../videos/..."
                    : "https://www.youtube.com/watch?v=... or https://youtu.be/..."
                }
              />
              <span className="field-guidance">
                Copy the live link from YouTube or Facebook, then save. Draft stays private. Live now shows on the website. Ended keeps a replay if the platform still allows it.
              </span>
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as LiveStatus })}
              >
                <option value="live">Live now</option>
                <option value="draft">Draft</option>
                <option value="ended">Ended</option>
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea
              value={form.description}
              maxLength={800}
              rows={3}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional note shown under the player."
            />
          </label>
          <div className="events-form-actions">
            <button type="submit" disabled={busy} className="events-save-btn">
              {busy ? "Saving…" : creating ? "Create live" : "Save changes"}
            </button>
            <button type="button" onClick={cancel} className="events-cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="events-list-admin">
        {streams.length === 0 ? (
          <p className="events-empty">
            No live streams yet. Click &quot;+ New live&quot; and paste a Facebook or YouTube URL.
          </p>
        ) : (
          <table className="events-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Title</th>
                <th>Platform</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {streams.map((item) => (
                <tr key={item.id} className={item.status === "draft" ? "draft-row" : ""}>
                  <td>
                    <span className={`events-status-badge ${item.status}`}>
                      {item.status === "live" ? "live now" : item.status}
                    </span>
                  </td>
                  <td>
                    <strong>{item.title}</strong>
                    <small>{item.sourceUrl}</small>
                  </td>
                  <td>
                    <span className="events-cat-badge" data-cat={item.platform}>
                      {item.platform}
                    </span>
                  </td>
                  <td className="events-actions-cell">
                    <button type="button" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="events-delete-btn"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
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

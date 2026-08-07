"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CommunityPost,
  type PublicPlacement,
  seedPosts,
} from "../lib/content";
import { LogoMark } from "../components/LogoMark";
import { sectionDefinitions, sectionKeys } from "../lib/sections";
import type { StaffUser } from "../lib/auth";
import { AdminLogin } from "./AdminLogin";
import { TeamAccess } from "./TeamAccess";
import {
  MrKyawZinAssistant,
  type AssistantDraft,
} from "./MrKyawZinAssistant";
import { AdminOperations } from "./AdminOperations";
import { InquiryAlert } from "./InquiryAlert";
import { PageManager } from "./PageManager";
import { EventsManager } from "./EventsManager";

const channels = ["Website", "Facebook", "Telegram", "Email"];

type Composer = {
  title: string;
  excerpt: string;
  body: string;
  category: CommunityPost["category"];
  placement: PublicPlacement;
  channels: string[];
  mediaId: number | null;
  mediaName: string;
  mediaAlt: string;
};

const emptyComposer: Composer = {
  title: "",
  excerpt: "",
  body: "",
  category: "Field notes",
  placement: "stories",
  channels: ["Website"],
  mediaId: null,
  mediaName: "",
  mediaAlt: "",
};

export function AdminDashboard() {
  const [session, setSession] = useState<StaffUser | null | undefined>(undefined);
  const [posts, setPosts] = useState<CommunityPost[]>(seedPosts);
  const [composer, setComposer] = useState<Composer>(emptyComposer);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreview, setMediaPreview] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(async (response) => {
        const payload = await response.json();
        setSession(response.ok ? payload.user : null);
      })
      .catch(() => setSession(null));
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch("/api/posts?scope=admin")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => {
        if (Array.isArray(payload.posts) && payload.posts.length) {
          setPosts(payload.posts);
        }
      })
      .catch(() => {
        setNotice("The protected content library is temporarily unavailable.");
      });
  }, [session]);

  const counts = useMemo(
    () => ({
      published: posts.filter((post) => post.status === "published").length,
      review: posts.filter((post) => post.status === "review").length,
      drafts: posts.filter((post) => post.status === "draft").length,
    }),
    [posts],
  );

  function toggleChannel(channel: string) {
    setComposer((current) => ({
      ...current,
      channels: current.channels.includes(channel)
        ? current.channels.filter((item) => item !== channel)
        : [...current.channels, channel],
    }));
  }

  useEffect(
    () => () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    },
    [mediaPreview],
  );

  async function uploadMedia(file: File | undefined) {
    if (!file) return;
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
    setUploadingMedia(true);
    setNotice("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append(
        "altText",
        composer.mediaAlt.trim() || composer.title.trim() || file.name,
      );
      const response = await fetch("/api/media", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to upload media");
      setComposer((current) => ({
        ...current,
        mediaId: Number(payload.media.id),
        mediaName: String(payload.media.filename),
      }));
      setNotice(`${payload.media.filename} uploaded and attached to this post.`);
    } catch (error) {
      setComposer((current) => ({ ...current, mediaId: null, mediaName: "" }));
      setMediaPreview("");
      setNotice(error instanceof Error ? error.message : "Unable to upload media");
    } finally {
      setUploadingMedia(false);
    }
  }

  async function savePost(status: "draft" | "review" | "published") {
    if (uploadingMedia) {
      setNotice("Please wait for the media upload to finish.");
      return;
    }
    if (!composer.title.trim()) {
      setNotice("Add a clear post title before saving.");
      return;
    }

    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/posts", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...composer, status, id: editingId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Content API unavailable");
      setPosts((current) =>
        editingId
          ? current.map((post) => post.id === editingId ? payload.post : post)
          : [payload.post, ...current],
      );
      setComposer(emptyComposer);
      setEditingId(null);
      setMediaPreview("");
      setNotice(
        status === "draft"
          ? "Draft saved. Nothing was distributed."
          : "Sent for editorial review. Distribution remains locked.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save this post");
    } finally {
      setSaving(false);
    }
  }

  function editPost(post: CommunityPost) {
    setEditingId(post.id);
    setComposer({
      title: post.title,
      excerpt: post.excerpt,
      body: post.body,
      category: post.category,
      placement: post.placement,
      channels: post.channels,
      mediaId: post.mediaId || null,
      mediaName: post.mediaId ? `Existing media #${post.mediaId}` : "",
      mediaAlt: post.mediaAlt || "",
    });
    setMediaPreview("");
    document.querySelector("#composer")?.scrollIntoView({ behavior: "smooth" });
  }

  async function publishPost(post: CommunityPost) {
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...post, status: "published" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to publish");
      setPosts((current) =>
        current.map((item) => item.id === post.id ? payload.post : item),
      );
      setNotice("Published to the website. No external channel was contacted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to publish");
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void savePost("review");
  }

  async function signOut() {
    await fetch("/api/auth/session", { method: "DELETE" });
    setSession(null);
  }

  if (session === undefined) {
    return (
      <main className="admin-auth-loading">
        <LogoMark />
        <p>Checking secure staff access…</p>
      </main>
    );
  }

  if (!session) {
    return <AdminLogin onSignedIn={setSession} />;
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="wordmark admin-wordmark" href="/">
          <LogoMark />
          <span>BURMESE CATHOLIC COMMUNITY WA</span>
        </Link>
        <nav>
          <a className="active" href="#overview"><span>01</span> Overview</a>
          <a href="#composer"><span>02</span> Create post</a>
          <a href="#content"><span>03</span> Content library</a>
          <a href="#distribution"><span>04</span> Distribution</a>
          <a href="#team"><span>05</span> Team access</a>
          <a href="#security"><span>06</span> Security & records</a>
          <a href="#pages"><span>07</span> Public pages</a>
          <a href="#events"><span>08</span> Events</a>
          {session.role !== "editor" && (
            <a href="#inquiries"><span>09</span> Enquiries</a>
          )}
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          <p>
            Preview workspace
            <small>Production actions are locked.</small>
          </p>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p>STAFF WORKSPACE / OVERVIEW</p>
            <h1>Good morning, editor.</h1>
          </div>
          <div className="editor-chip">
            <span>{session.displayName.slice(0, 2).toUpperCase()}</span>
            <p>{session.displayName}<small>{session.role}</small></p>
            <button type="button" onClick={() => void signOut()}>Sign out</button>
          </div>
        </header>

        <InquiryAlert currentUser={session} />

        <section className="admin-overview" id="overview">
          <article>
            <span>Published</span>
            <strong>{counts.published.toString().padStart(2, "0")}</strong>
            <p>Live on the website</p>
          </article>
          <article>
            <span>In review</span>
            <strong>{counts.review.toString().padStart(2, "0")}</strong>
            <p>Waiting for approval</p>
          </article>
          <article>
            <span>Drafts</span>
            <strong>{counts.drafts.toString().padStart(2, "0")}</strong>
            <p>Private to staff</p>
          </article>
          <article className="distribution-card">
            <span>Distribution health</span>
            <strong>Website only</strong>
            <p>Website publishing only</p>
          </article>
        </section>

        {notice && <div className="admin-notice" role="status">{notice}</div>}

        <div className="admin-grid">
          <form className="composer-panel" id="composer" onSubmit={handleSubmit}>
            <div className="panel-heading">
              <div>
                <p>CREATE</p>
                <h2>{editingId ? "Edit community update" : "New community update"}</h2>
              </div>
              <span>Human review required</span>
            </div>

            <label>
              Post title
              <input
                value={composer.title}
                onChange={(event) => setComposer({ ...composer, title: event.target.value })}
                placeholder="What happened, in clear human language?"
              />
            </label>

            <div className="form-row">
              <label>
                Post appears on page
                <select
                  value={composer.placement}
                  onChange={(event) =>
                    setComposer({
                      ...composer,
                      placement: event.target.value as PublicPlacement,
                    })
                  }
                >
                  {sectionKeys.map((key) => (
                    <option key={key} value={key}>
                      {sectionDefinitions[key].label}
                    </option>
                  ))}
                </select>
                <small className="field-guidance">
                  This chooses where this individual post will be published.
                </small>
              </label>
              <label>
                Category
                <select
                  value={composer.category}
                  onChange={(event) =>
                    setComposer({
                      ...composer,
                      category: event.target.value as CommunityPost["category"],
                    })
                  }
                >
                  <option>Field notes</option>
                  <option>Learning</option>
                  <option>Events</option>
                </select>
              </label>
            </div>

            <label>
              Short summary
              <textarea
                rows={3}
                value={composer.excerpt}
                onChange={(event) => setComposer({ ...composer, excerpt: event.target.value })}
                placeholder="A short introduction for story cards and social previews."
              />
            </label>

            <label>
              Full story
              <textarea
                rows={7}
                value={composer.body}
                onChange={(event) => setComposer({ ...composer, body: event.target.value })}
                placeholder="Write the complete update. Verify claims and personal details before review."
              />
            </label>

            <div className={composer.mediaId ? "upload-zone has-media" : "upload-zone"}>
              {mediaPreview ? (
                <Image
                  src={mediaPreview}
                  alt="Selected media preview"
                  width={58}
                  height={58}
                  unoptimized
                />
              ) : (
                <span>{uploadingMedia ? "…" : "+"}</span>
              )}
              <p>
                {uploadingMedia
                  ? "Uploading approved media…"
                  : composer.mediaName || "Add approved media"}
                <small>
                  {composer.mediaId
                    ? "Uploaded securely and attached to this post."
                    : "Choose an image or PDF up to 15 MB."}
                </small>
              </p>
              <label className="upload-choose" htmlFor="post-media">
                {composer.mediaId ? "Replace file" : "Browse files"}
              </label>
              <input
                id="post-media"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                disabled={uploadingMedia}
                onChange={(event) => void uploadMedia(event.target.files?.[0])}
              />
            </div>
            <label>
              Photo description
              <input
                value={composer.mediaAlt}
                maxLength={240}
                onChange={(event) =>
                  setComposer({ ...composer, mediaAlt: event.target.value })
                }
                placeholder="Describe the photo for people using screen readers."
              />
            </label>

            <fieldset>
              <legend>Future distribution preferences</legend>
              <div className="channel-options">
                {channels.map((channel) => (
                  <label key={channel}>
                    <input
                      type="checkbox"
                      checked={composer.channels.includes(channel)}
                      onChange={() => toggleChannel(channel)}
                    />
                    <span>{channel.slice(0, 2).toUpperCase()}</span>
                    {channel}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="composer-actions">
              <button
                className="button-save"
                type="button"
                disabled={saving}
                onClick={() => void savePost("draft")}
              >
                Save draft
              </button>
              <button
                className="button-save"
                type="button"
                disabled={!composer.title.trim()}
                onClick={() => setPreviewing(true)}
              >
                Preview
              </button>
              <button className="button-review" type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save for review →" : "Send for review →"}
              </button>
            </div>
          </form>

          <aside className="activity-panel" id="distribution">
            <div className="panel-heading">
              <div>
                <p>INTEGRATION STATUS</p>
                <h2>Website first</h2>
              </div>
            </div>
            <div className="integration-list">
              {[
                ["WB", "Website", "Available"],
                ["FB", "Facebook import", "Deferred — authorisation required"],
                ["N8", "n8n distribution", "Deferred"],
                ["EM", "Email", "Deferred until domain"],
              ].map(([code, label, status]) => (
                <article key={label}>
                  <span>{code}</span>
                  <p>{label}<small>{status}</small></p>
                  <i className={status === "Available" ? "healthy" : ""} />
                </article>
              ))}
            </div>
            <div className="automation-explainer">
              <p>DEPLOYMENT BOUNDARY</p>
              <h3>No external distribution yet.</h3>
              <p>
                Website publishing is available after administrator approval.
                n8n and Facebook remain inactive until credentials and explicit authorisation are supplied.
              </p>
              <div className="mini-flow">
                <span>Draft</span><b>→</b><span>Review</span><b>→</b><span>Website</span>
              </div>
            </div>
          </aside>
        </div>

        <section className="content-table" id="content">
          <div className="panel-heading">
            <div>
              <p>CONTENT LIBRARY</p>
              <h2>Recent updates</h2>
            </div>
            <button type="button">Filter: all</button>
          </div>
          <div className="table-head">
            <span>Content</span><span>Status</span><span>Destination</span><span>Action</span>
          </div>
          {posts.map((post) => (
            <article className="content-row" key={post.id}>
              <div>
                {post.mediaUrl && post.mediaType?.startsWith("image/") ? (
                  <Image
                    src={post.mediaUrl}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                  />
                ) : (
                  <span>{post.category.slice(0, 2).toUpperCase()}</span>
                )}
                <p>{post.title}<small>{post.category} · {post.author}</small></p>
              </div>
              <strong className={`status-${post.status}`}>{post.status}</strong>
              <p>{sectionDefinitions[post.placement].label}</p>
              <div className="row-actions">
                <button type="button" onClick={() => editPost(post)}>Edit</button>
                {post.status === "review" && session.role !== "editor" && (
                  <button type="button" disabled={saving} onClick={() => void publishPost(post)}>
                    Publish
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>

        <MrKyawZinAssistant
          draft={{
            title: composer.title,
            excerpt: composer.excerpt,
            body: composer.body,
            placement: composer.placement,
          }}
          onApplySuggestion={(suggestion: Partial<AssistantDraft>) =>
            setComposer((current) => ({ ...current, ...suggestion }))
          }
        />

        <TeamAccess currentUser={session} />
        <PageManager currentUser={session} />
        <EventsManager />
        <AdminOperations currentUser={session} />
        {previewing && (
          <div className="preview-overlay" role="dialog" aria-modal="true">
            <article>
              <button type="button" onClick={() => setPreviewing(false)}>Close</button>
              <span>{composer.category}</span>
              <h2>{composer.title || "Untitled update"}</h2>
              <p>{composer.excerpt}</p>
              <div>{composer.body}</div>
              <small>Private preview · {sectionDefinitions[composer.placement].label}</small>
            </article>
          </div>
        )}
      </section>
    </main>
  );
}

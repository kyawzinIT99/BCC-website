"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PublicHeader, type PublicLanguage } from "./PublicHeader";
import { PublicQuestionWidget } from "./PublicQuestionWidget";

type MediaItem = {
  id: number;
  filename: string;
  content_type: string;
  size: number;
  alt_text: string;
  uploaded_by: string;
  created_at: string;
};

type GalleryPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  mediaUrl: string | null;
  mediaAlt: string;
};

export function GalleryPage() {
  const [language, setLanguage] = useState<PublicLanguage>("en");
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (Array.isArray(d.posts)) {
          setPosts(d.posts.filter((p: GalleryPost) => p.mediaUrl));
        }
      })
      .catch(() => setPosts([]));
  }, []);

  const categories = ["all", ...new Set(posts.map((p) => p.category))];
  const filtered =
    filter === "all" ? posts : posts.filter((p) => p.category === filter);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  }, []);

  const navigateLightbox = useCallback(
    (direction: 1 | -1) => {
      if (lightboxIndex === null) return;
      const next = lightboxIndex + direction;
      if (next >= 0 && next < filtered.length) setLightboxIndex(next);
    },
    [lightboxIndex, filtered.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigateLightbox(1);
      if (e.key === "ArrowLeft") navigateLightbox(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, closeLightbox, navigateLightbox]);

  return (
    <main className="public-site civic-public-site v2-redesign">
      <PublicHeader language={language} onLanguageChange={setLanguage} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="v2-gallery-hero">
        <div className="v2-gallery-hero-content">
          <p className="v2-section-eyebrow">Community gallery</p>
          <h1>Moments That Matter</h1>
          <p className="v2-gallery-subtitle">
            Real photos from our community events, service missions, and
            gatherings — captured by our members.
          </p>
        </div>
      </section>

      {/* ── Filter Bar ───────────────────────────────────────── */}
      <div className="v2-gallery-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`v2-gallery-filter-btn ${
              filter === cat ? "active" : ""
            }`}
            onClick={() => setFilter(cat)}
          >
            {cat === "all" ? "All Photos" : cat}
          </button>
        ))}
        <span className="v2-gallery-count">
          {filtered.length} photo{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Masonry Grid ─────────────────────────────────────── */}
      <section className="v2-gallery-grid-section">
        {filtered.length === 0 ? (
          <div className="v2-gallery-empty">
            <p>No photos yet. Upload photos through the admin panel to see them here.</p>
          </div>
        ) : (
          <div className="v2-gallery-masonry">
            {filtered.map((post, index) => (
              <article
                key={post.id}
                className="v2-gallery-item"
                onClick={() => openLightbox(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openLightbox(index)}
              >
                <div className="v2-gallery-image-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.mediaUrl!}
                    alt={post.mediaAlt || post.title}
                    loading="lazy"
                  />
                  <div className="v2-gallery-image-overlay">
                    <span className="v2-gallery-zoom-icon">⛶</span>
                  </div>
                </div>
                <div className="v2-gallery-caption">
                  <span className="v2-gallery-cat">{post.category}</span>
                  <h3>{post.title}</h3>
                  <time>{post.date ? (() => { const d = new Date(post.date); const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return `${d.getUTCDate()} ${m[d.getUTCMonth()]} ${d.getUTCFullYear()}`; })() : ""}</time>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── Lightbox ──────────────────────────────────────────── */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div
          className="v2-lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-label="Photo viewer"
        >
          <div
            className="v2-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="v2-lightbox-close"
              onClick={closeLightbox}
              aria-label="Close"
            >
              ✕
            </button>
            {lightboxIndex > 0 && (
              <button
                className="v2-lightbox-nav v2-lightbox-prev"
                onClick={() => navigateLightbox(-1)}
                aria-label="Previous photo"
              >
                ‹
              </button>
            )}
            {lightboxIndex < filtered.length - 1 && (
              <button
                className="v2-lightbox-nav v2-lightbox-next"
                onClick={() => navigateLightbox(1)}
                aria-label="Next photo"
              >
                ›
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={filtered[lightboxIndex].mediaUrl!}
              alt={
                filtered[lightboxIndex].mediaAlt ||
                filtered[lightboxIndex].title
              }
            />
            <div className="v2-lightbox-info">
              <h3>{filtered[lightboxIndex].title}</h3>
              <p>{filtered[lightboxIndex].excerpt}</p>
              <span className="v2-gallery-cat">
                {filtered[lightboxIndex].category}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="v2-gallery-cta">
        <h2>Have photos to share?</h2>
        <p>
          Community members can submit photos through our admin panel. Contact
          your community leader to contribute.
        </p>
        <Link href="/get-involved" className="v2-btn v2-btn-gold">
          Get Involved
        </Link>
      </section>

      <PublicQuestionWidget />
    </main>
  );
}

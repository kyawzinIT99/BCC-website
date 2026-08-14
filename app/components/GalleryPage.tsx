"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PublicHeader } from "./PublicHeader";
import { galleryCopyMy, usePublicLanguage } from "../lib/public-language";

type GalleryItem = {
  id: number;
  url: string;
  contentType: string;
  alt: string;
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
  gallery?: GalleryItem[];
};

export function GalleryPage() {
  const [language, setLanguage] = usePublicLanguage();
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [lightbox, setLightbox] = useState<{
    postIndex: number;
    photoIndex: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (Array.isArray(d.posts)) {
          setPosts(
            d.posts.filter(
              (p: GalleryPost) =>
                (p.gallery && p.gallery.length > 0) || p.mediaUrl,
            ),
          );
        }
      })
      .catch(() => setPosts([]));
  }, []);

  const categories = ["all", ...new Set(posts.map((p) => p.category))];
  const filtered =
    filter === "all" ? posts : posts.filter((p) => p.category === filter);

  function albumFor(post: GalleryPost): GalleryItem[] {
    if (post.gallery?.length) return post.gallery;
    if (post.mediaUrl) {
      return [
        {
          id: post.id,
          url: post.mediaUrl,
          contentType: "image/",
          alt: post.mediaAlt || post.title,
        },
      ];
    }
    return [];
  }

  const openLightbox = useCallback((postIndex: number, photoIndex = 0) => {
    setLightbox({ postIndex, photoIndex });
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    document.body.style.overflow = "";
  }, []);

  const navigateLightbox = useCallback(
    (direction: 1 | -1) => {
      if (lightbox === null) return;
      const album = albumFor(filtered[lightbox.postIndex] || { id: 0, slug: "", title: "", excerpt: "", category: "", date: "", mediaUrl: null, mediaAlt: "" });
      const nextPhoto = lightbox.photoIndex + direction;
      if (nextPhoto >= 0 && nextPhoto < album.length) {
        setLightbox({ ...lightbox, photoIndex: nextPhoto });
        return;
      }
      const nextPost = lightbox.postIndex + direction;
      if (nextPost >= 0 && nextPost < filtered.length) {
        const nextAlbum = albumFor(filtered[nextPost]);
        setLightbox({
          postIndex: nextPost,
          photoIndex: direction === 1 ? 0 : Math.max(0, nextAlbum.length - 1),
        });
      }
    },
    [lightbox, filtered],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigateLightbox(1);
      if (e.key === "ArrowLeft") navigateLightbox(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, closeLightbox, navigateLightbox]);

  const activePost =
    lightbox !== null ? filtered[lightbox.postIndex] : null;
  const activeAlbum = activePost ? albumFor(activePost) : [];
  const activePhoto =
    lightbox !== null ? activeAlbum[lightbox.photoIndex] : null;

  return (
    <main className="public-site civic-public-site v2-redesign" lang={language === "my" ? "my" : undefined}>
      <PublicHeader
        activeHref="/gallery"
        language={language}
        onLanguageChange={setLanguage}
      />

      <section className="v2-gallery-hero">
        <div className="v2-gallery-hero-content">
          <p className="v2-section-eyebrow">
            {language === "my" ? galleryCopyMy.eyebrow : "Community gallery"}
          </p>
          <h1>{language === "my" ? galleryCopyMy.title : "Moments That Matter"}</h1>
          <p className="v2-gallery-subtitle">
            {language === "my"
              ? galleryCopyMy.subtitle
              : "Each card is one approved story album — up to four photos stay together with their context, not scattered across the site."}
          </p>
        </div>
      </section>

      <div className="v2-gallery-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`v2-gallery-filter-btn ${
              filter === cat ? "active" : ""
            }`}
            onClick={() => setFilter(cat)}
          >
            {cat === "all" ? (language === "my" ? galleryCopyMy.allAlbums : "All albums") : cat}
          </button>
        ))}
        <span className="v2-gallery-count">
          {filtered.length} {language === "my" ? galleryCopyMy.albums : `album${filtered.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      <section className="v2-gallery-grid-section">
        {filtered.length === 0 ? (
          <div className="v2-gallery-empty">
            <p>
              {language === "my"
                ? galleryCopyMy.empty
                : "No photos yet. Publish a story with photos in the admin panel to see albums here."}
            </p>
          </div>
        ) : (
          <div className="v2-gallery-masonry">
            {filtered.map((post, index) => {
              const album = albumFor(post);
              const cover = album[0];
              return (
                <article
                  key={post.id}
                  className="v2-gallery-item"
                  onClick={() => openLightbox(index, 0)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openLightbox(index, 0)}
                >
                  <div className="v2-gallery-image-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover.url}
                      alt={cover.alt || post.title}
                      loading="lazy"
                    />
                    <div className="v2-gallery-image-overlay">
                      <span className="v2-gallery-zoom-icon">⛶</span>
                    </div>
                    {album.length > 1 ? (
                      <span className="v2-gallery-count-badge">
                        {album.length} {language === "my" ? galleryCopyMy.photos : "photos"}
                      </span>
                    ) : null}
                  </div>
                  {album.length > 1 ? (
                    <div className="v2-gallery-album-strip" aria-hidden="true">
                      {album.slice(0, 4).map((item) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={item.id} src={item.url} alt="" />
                      ))}
                    </div>
                  ) : null}
                  <div className="v2-gallery-caption">
                    <span className="v2-gallery-cat">{post.category}</span>
                    <h3>{post.title}</h3>
                    <time>
                      {post.date
                        ? (() => {
                            const d = new Date(post.date);
                            const m = [
                              "Jan",
                              "Feb",
                              "Mar",
                              "Apr",
                              "May",
                              "Jun",
                              "Jul",
                              "Aug",
                              "Sep",
                              "Oct",
                              "Nov",
                              "Dec",
                            ];
                            return `${d.getUTCDate()} ${m[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
                          })()
                        : ""}
                    </time>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {activePost && activePhoto && lightbox !== null && (
        <div
          className="v2-lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-label="Photo album viewer"
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
            {(lightbox.postIndex > 0 || lightbox.photoIndex > 0) && (
              <button
                className="v2-lightbox-nav v2-lightbox-prev"
                onClick={() => navigateLightbox(-1)}
                aria-label="Previous photo"
              >
                ‹
              </button>
            )}
            {(lightbox.postIndex < filtered.length - 1 ||
              lightbox.photoIndex < activeAlbum.length - 1) && (
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
              src={activePhoto.url}
              alt={activePhoto.alt || activePost.title}
            />
            {activeAlbum.length > 1 ? (
              <div className="v2-lightbox-thumbs">
                {activeAlbum.map((item, photoIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      photoIndex === lightbox.photoIndex ? "active" : undefined
                    }
                    onClick={() =>
                      setLightbox({ postIndex: lightbox.postIndex, photoIndex })
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="v2-lightbox-info">
              <h3>{activePost.title}</h3>
              <p>{activePost.excerpt}</p>
              <span className="v2-gallery-cat">
                {activePost.category}
                {activeAlbum.length > 1
                  ? ` · ${lightbox.photoIndex + 1}/${activeAlbum.length}`
                  : ""}
              </span>
            </div>
          </div>
        </div>
      )}

      <section className="v2-gallery-cta">
        <h2>{language === "my" ? galleryCopyMy.ctaTitle : "Have photos to share?"}</h2>
        <p>
          {language === "my"
            ? galleryCopyMy.ctaBody
            : "Community members can submit photos through our admin panel. Contact your community leader to contribute."}
        </p>
        <Link href="/get-involved" className="v2-btn v2-btn-gold">
          {language === "my" ? "ပါဝင်ရန်" : "Get Involved"}
        </Link>
      </section>
    </main>
  );
}

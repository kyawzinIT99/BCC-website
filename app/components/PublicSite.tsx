"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { seedPosts } from "../lib/content";
import {
  defaultHomePage,
  type HomePageSettings,
} from "../lib/home";
import { LogoMark } from "./LogoMark";
import { PublicHeader } from "./PublicHeader";
import { MailSubscribe } from "./MailSubscribe";
import { chromeMy, usePublicLanguage } from "../lib/public-language";

/* ── Animated counter hook ────────────────────────────────────────── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ── Impact stat component ────────────────────────────────────────── */
function ImpactStat({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const { count, ref } = useCounter(value);
  return (
    <div className="v2-impact-stat" ref={ref}>
      <span className="v2-impact-number">
        {count}
        {suffix}
      </span>
      <span className="v2-impact-label">{label}</span>
    </div>
  );
}

/* ── Pathway icons ────────────────────────────────────────── */
const pathwayIcons = [
  /* Book / Learn */
  <svg key="learn" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>,
  /* People / Support */
  <svg key="support" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>,
  /* Heart / Give */
  <svg key="give" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>,
  /* Chip / Tech */
  <svg key="tech" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>,
];

export function PublicSite() {
  const [language, setLanguage] = usePublicLanguage();
  const [home, setHome] = useState<HomePageSettings>(defaultHomePage);
  const [posts, setPosts] = useState(seedPosts);

  useEffect(() => {
    fetch("/api/home")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        if (payload.home) setHome(payload.home);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch("/api/posts")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        if (Array.isArray(payload.posts) && payload.posts.length) setPosts(payload.posts);
      })
      .catch(() => undefined);
  }, []);

  const featuredPosts = posts.slice(0, 3);
  const storyImages = [
    "/story-prayer.png",
    "/story-cultural.png",
    "/story-learning.png",
  ];
  return (
    <main className="public-site civic-public-site v2-redesign" lang={language === "my" ? "my" : undefined}>
      {/* ── Announcement Bar ────────────────────────────────── */}
      <div className="v2-announcement">
        <span className="v2-announcement-dot" />
        <span>{home.announcement}</span>
        <a href="#stories">Read latest stories →</a>
      </div>

      {/* ── Header ──────────────────────────────────────────── */}
      <PublicHeader
        activeHref="/"
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* ── Cinematic Hero ──────────────────────────────────── */}
      <section
        className="v2-hero"
        dir={language === "ar" || language === "fa" ? "rtl" : "ltr"}
      >
        <div className="v2-hero-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.heroImageUrl} alt={home.heroImageAlt} />
          <div className="v2-hero-overlay" />
        </div>
        <div className="v2-hero-content">
          <p className="v2-hero-eyebrow">{home.eyebrow}</p>
          <h1 className="v2-hero-title">{home.title}</h1>
          <p className="v2-hero-intro">{home.intro}</p>
          <div className="v2-hero-actions">
            <a className="v2-btn v2-btn-gold" href="#support-pathways">
              {language === "my" ? chromeMy.findSupport : "Find support"}
            </a>
            <Link className="v2-btn v2-btn-outline" href="/get-involved">
              {language === "my" ? chromeMy.getInvolved : "Get involved"}
            </Link>
          </div>
          <p className="v2-hero-notice">
            Independent community organisation. Not a government or migration-advice service.
          </p>
        </div>
        <div className="v2-hero-scroll-hint" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ── Impact Strip ─────────────────────────────────────── */}
      <section className="v2-impact-strip" aria-label="Community impact numbers">
        <ImpactStat value={25} suffix="+" label="Years of faith & community" />
        <ImpactStat value={500} suffix="+" label="Active community members" />
        <ImpactStat value={50} suffix="+" label="Cultural events per year" />
        <ImpactStat value={5} label="Languages supported" />
      </section>

      {/* ── Community Stories ─────────────────────────────────── */}
      <section className="v2-stories" id="stories" aria-labelledby="v2-stories-title">
        <div className="v2-stories-header">
          <p className="v2-section-eyebrow">Community in action</p>
          <h2 id="v2-stories-title">Stories from our community</h2>
          <p className="v2-stories-subtitle">Real voices. Shared experiences. Honest storytelling.</p>
        </div>
        <div className="v2-stories-grid">
          {featuredPosts.map((post, index) => {
            const mediaUrl = post.mediaUrl || storyImages[index];
            return (
              <article className="v2-story-card" key={post.slug}>
                <div className="v2-story-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl} alt={post.mediaAlt || "Burmese Catholic community activity"} />
                  <span className="v2-story-category">{post.category}</span>
                </div>
                <div className="v2-story-body">
                  <time className="v2-story-date">{post.date}</time>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link href="/stories" className="v2-story-link">
                    {language === "my" ? chromeMy.readStory : "Read story"} <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Mission Statement ────────────────────────────────── */}
      <section className="v2-mission" aria-label="Mission statement">
        <blockquote>
          <span className="v2-mission-mark" aria-hidden="true">&ldquo;</span>
          To serve and not to be served — building bridges of faith, culture and belonging across generations.
        </blockquote>
      </section>

      {/* ── Support Pathways ─────────────────────────────────── */}
      <section className="v2-pathways" id="support-pathways">
        <div className="v2-pathways-header">
          <p className="v2-section-eyebrow">Clear starting points</p>
          <h2>{home.helpTitle}</h2>
          <p>{home.helpIntro}</p>
        </div>
        <div className="v2-pathways-grid">
          {home.pathways.map((pathway, index) => {
            if (!pathway.visible) return null;
            const external = pathway.href.startsWith("https://");
            const accentClasses = ["v2-pw-gold", "v2-pw-sky", "v2-pw-coral", "v2-pw-navy"];
            return (
              <a
                className={`v2-pathway-card ${accentClasses[index]} ${index === 3 ? "v2-pathway-tech" : ""}`}
                href={pathway.href}
                key={index}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                <div className="v2-pathway-icon">{pathwayIcons[index]}</div>
                <span className="v2-pathway-number">{String(index + 1).padStart(2, "0")}</span>
                <strong>{pathway.title}</strong>
                <p>{pathway.description}</p>
                <span className="v2-pathway-arrow" aria-hidden="true">
                  {external ? "↗" : "→"}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* ── Trust Strip ──────────────────────────────────────── */}
      <section className="v2-trust" aria-label="Verified information">
        <div className="v2-trust-content">
          <div className="v2-trust-info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <strong>Verified information first</strong>
              <p>Official services are clearly labelled and open on their own websites.</p>
            </div>
          </div>
          <div className="v2-trust-links">
            <a
              href="https://immi.homeaffairs.gov.au/settling-in-australia/amep/find-a-class/providers-and-locations"
              target="_blank"
              rel="noreferrer"
            >
              Australian Government AMEP providers ↗
            </a>
            <a
              href="https://www.tisnational.gov.au/"
              target="_blank"
              rel="noreferrer"
            >
              TIS National language services ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── Programs / What Moves Us ─────────────────────────── */}
      <section className="v2-programs" id="work">
        <div className="v2-programs-header">
          <p className="v2-section-eyebrow">What moves us</p>
          <h2>Practical support. Shared responsibility.</h2>
          <p>
            People stay at the centre through clear information, partnership
            and accountable action.
          </p>
        </div>
        <div className="v2-programs-grid">
          {[
            {
              index: "01",
              title: "Neighbourhood support",
              description: "Practical help shaped with trusted local communities.",
              accent: "v2-prog-coral",
              icon: (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              ),
            },
            {
              index: "02",
              title: "Learning together",
              description: "Shared resources that turn knowledge into confidence.",
              accent: "v2-prog-gold",
              icon: (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ),
            },
            {
              index: "03",
              title: "Stronger connections",
              description: "Pathways linking people, services and opportunities.",
              accent: "v2-prog-sky",
              icon: (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              ),
            },
          ].map((program) => (
            <article className={`v2-program-card ${program.accent}`} key={program.title}>
              <div className="v2-program-icon">{program.icon}</div>
              <span className="v2-program-index">{program.index}</span>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
              <Link href="/stories" className="v2-program-link">
                Discover more <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── Join / CTA ───────────────────────────────────────── */}
      <section className="v2-join" id="join">
        <div className="v2-join-inner">
          <div className="v2-join-copy">
            <p className="v2-section-eyebrow">Take part responsibly</p>
            <h2>Bring your ideas and local knowledge.</h2>
          </div>
          <div className="v2-join-actions">
            <Link className="v2-btn v2-btn-gold" href="/get-involved">
              {language === "my" ? chromeMy.getInvolved : "Get involved"} <span aria-hidden="true">↗</span>
            </Link>
            <p>Public pathways remain subject to organisation approval and verification.</p>
          </div>
        </div>
      </section>

      <MailSubscribe source="home" />

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="v2-footer">
        <div className="v2-footer-inner">
          <div className="v2-footer-brand">
            <LogoMark />
            <div>
              <strong>Burmese Catholic Community</strong>
              <span>of Western Australia</span>
            </div>
          </div>
          <div className="v2-footer-columns">
            <div>
              <strong>Explore</strong>
              <Link href="/about">About</Link>
              <Link href="/our-work">Our work</Link>
              <Link href="/stories">News & stories</Link>
              <a
                href="https://web.facebook.com/groups/115394412003293"
                target="_blank"
                rel="noreferrer"
              >
                Official Facebook group ↗
              </a>
            </div>
            <div>
              <strong>Take part</strong>
              <Link href="/get-involved">Volunteer</Link>
              <Link href="/get-involved">Partner with us</Link>
              <Link href="/get-involved">Contact</Link>
            </div>
            <div>
              <strong>Official information</strong>
              <a href="https://immi.homeaffairs.gov.au/" target="_blank" rel="noreferrer">
                Home Affairs ↗
              </a>
              <a href="https://www.tisnational.gov.au/" target="_blank" rel="noreferrer">
                TIS National ↗
              </a>
              <Link href="/approach">Our information boundary</Link>
            </div>
          </div>
          <div className="v2-footer-bottom">
            <span>Independent community organisation</span>
            <span>Accessible • Accountable • Community-led</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  cloneAboutProfile,
  defaultAboutProfile,
  type AboutProfile,
  type CommitteeMember,
} from "../lib/bcc-profile";
import type { CommunityPost } from "../lib/content";
import {
  defaultCertificatesContent,
  defaultGivingContent,
  type CertificatesContent,
  type GivingContent,
} from "../lib/page-content";
import {
  defaultPageMedia,
  supportsPageMedia,
  type PageMedia,
} from "../lib/page-media";
import { sectionDefinitions, type SectionKey } from "../lib/sections";
import { LogoMark } from "./LogoMark";
import { OfficialBrandText } from "./OfficialBrandText";
import { PublicHeader } from "./PublicHeader";
import { CommunityContactForm } from "./CommunityContactForm";
import {
  aboutChromeMy,
  extraSectionChromeMy,
  sectionCopyMy,
  usePublicLanguage,
} from "../lib/public-language";

function CommitteeCard({ member, leadershipLabel }: { member: CommitteeMember; leadershipLabel: string }) {
  return (
    <article className="committee-card">
      <span>{member.role}</span>
      <h3>{member.name}</h3>
      <small>{leadershipLabel}</small>
    </article>
  );
}

export function SectionPage({ sectionKey }: { sectionKey: SectionKey }) {
  const section = sectionDefinitions[sectionKey];
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [pageCopy, setPageCopy] = useState(section);
  const [aboutProfile, setAboutProfile] = useState<AboutProfile>(() => cloneAboutProfile());
  const [pageMedia, setPageMedia] = useState<PageMedia | undefined>(() =>
    supportsPageMedia(sectionKey) ? defaultPageMedia[sectionKey] : undefined,
  );
  const [giving, setGiving] = useState<GivingContent>(defaultGivingContent);
  const [certificates, setCertificates] = useState<CertificatesContent>(defaultCertificatesContent);
  const [language, setLanguage] = usePublicLanguage();
  const my = language === "my";
  const overlay = my ? sectionCopyMy[sectionKey] : null;
  const displayCopy = overlay
    ? {
        ...pageCopy,
        label: overlay.label,
        eyebrow: overlay.eyebrow,
        title: overlay.title,
        summary: overlay.summary,
        statement: overlay.statement,
        features: overlay.features,
      }
    : pageCopy;
  const visibleFeatures = sectionKey === "our-work"
    ? displayCopy.features.map((feature) =>
        feature.number === "03" && feature.title === "Community care"
          ? sectionDefinitions["our-work"].features[2]
          : feature,
      )
    : displayCopy.features;
  const aboutMedia = pageMedia || defaultPageMedia.about;
  const workMedia = pageMedia || defaultPageMedia["our-work"];
  const visibleCertificates = certificates.items.filter((item) => item.visible);
  const aboutDisplay = my
    ? {
        ...aboutProfile,
        historyEyebrow: aboutChromeMy.historyEyebrow,
        historyTitle: aboutChromeMy.historyTitle,
        historyBody: aboutChromeMy.historyBody,
        focusEyebrow: aboutChromeMy.focusEyebrow,
        focusTitle: aboutChromeMy.focusTitle,
        focuses: aboutChromeMy.focuses,
        committeeEyebrow: aboutChromeMy.committeeEyebrow,
        committeeTitle: aboutChromeMy.committeeTitle,
      }
    : aboutProfile;
  const leadershipLabel = my ? "အသိုင်းအဝိုင်း ခေါင်းဆောင်မှု" : "Community leadership";

  useEffect(() => {
    if (sectionKey !== "stories") {
      return;
    }

    fetch("/api/posts")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => {
        if (Array.isArray(payload.posts)) setPosts(payload.posts);
      })
      .catch(() => setPosts([]));
  }, [sectionKey]);

  useEffect(() => {
    fetch(`/api/pages?key=${encodeURIComponent(sectionKey)}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => {
        if (payload.page) {
          setPageCopy((current) => ({ ...current, ...payload.page }));
          if (sectionKey === "about" && payload.page.about) {
            setAboutProfile(payload.page.about);
          }
          if (payload.page.media && supportsPageMedia(sectionKey)) {
            setPageMedia(payload.page.media);
          }
          if (sectionKey === "giving" && payload.page.content?.giving) {
            setGiving(payload.page.content.giving);
          }
          if (sectionKey === "certificates" && payload.page.content?.certificates) {
            setCertificates(payload.page.content.certificates);
          }
        }
      })
      .catch(() => {
        setPageCopy(section);
        if (sectionKey === "about") setAboutProfile(cloneAboutProfile(defaultAboutProfile));
        if (supportsPageMedia(sectionKey)) setPageMedia(defaultPageMedia[sectionKey]);
        if (sectionKey === "giving") setGiving(defaultGivingContent);
        if (sectionKey === "certificates") setCertificates(defaultCertificatesContent);
      });
  }, [section, sectionKey]);

  return (
    <main className={`section-page section-${sectionKey}`} lang={my ? "my" : undefined}>
      <PublicHeader
        activeHref={`/${sectionKey}`}
        language={language}
        onLanguageChange={setLanguage}
      />

      <section className={`section-page-hero${sectionKey === "about" ? " has-feature-photo" : ""}${sectionKey === "our-work" ? " has-work-photo" : ""}`}>
        {sectionKey === "about" ? (
          <>
            <figure className="section-about-photo">
              {/* vinext's image optimizer does not serve this static WebP reliably. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={aboutMedia.heroImageUrl}
                alt={aboutMedia.heroImageAlt}
                width={1536}
                height={1024}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <figcaption>
                {my
                  ? aboutChromeMy.communityPhoto
                  : "Community photo · Burmese Catholic Community of WA"}
              </figcaption>
            </figure>
            <div className="section-about-copy">
              <p className="section-about-kicker">
                <span aria-hidden="true">01</span>
                {displayCopy.eyebrow}
              </p>
              <h1 className="sr-only">{displayCopy.title}</h1>
              <p className="section-lead">{displayCopy.summary}</p>
            </div>
          </>
        ) : sectionKey === "our-work" ? (
          <>
            <div className="section-work-copy">
              <p className="eyebrow">{displayCopy.eyebrow}</p>
              <h1>{displayCopy.title}</h1>
              <p className="section-lead">{displayCopy.summary}</p>
            </div>
            <figure className="section-work-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={workMedia.heroImageUrl}
                alt={workMedia.heroImageAlt}
                loading="eager"
                fetchPriority="high"
              />
              <figcaption>
                {my
                  ? extraSectionChromeMy.workPhotoCaption
                  : "Faith, culture and community in Western Australia"}
              </figcaption>
            </figure>
          </>
        ) : (
          <>
            <div>
              <p className="eyebrow">{displayCopy.eyebrow}</p>
              <h1>{displayCopy.title}</h1>
              <p className="section-lead">{displayCopy.summary}</p>
            </div>
            <div className="section-emblem" aria-hidden="true">
              <span>{displayCopy.label}</span>
              <i />
              <b>AU</b>
            </div>
          </>
        )}
      </section>

      <section className="section-statement">
        <p>{displayCopy.statement}</p>
      </section>

      {sectionKey === "giving" && giving.showAmounts ? (
        <section className="giving-totals" aria-labelledby="giving-totals-title">
          <div className="giving-totals-intro">
            <p className="eyebrow">{my ? extraSectionChromeMy.givingEyebrow : "Published figures · Australian Dollars (AUD)"}</p>
            <h2 id="giving-totals-title">{my ? extraSectionChromeMy.givingTitle : "Donation amount and yearly total"}</h2>
            <p>{giving.note}</p>
            <small>{giving.updatedLabel}</small>
          </div>
          <div className="giving-totals-grid">
            <article>
              <span>{giving.amountLabel}</span>
              <strong>{giving.amountValue}</strong>
            </article>
            <article>
              <span>{giving.totalLabel}</span>
              <strong>{giving.totalValue}</strong>
            </article>
          </div>
          <div className="giving-howto">
            <h3>{my ? extraSectionChromeMy.howToGive : "How to give"}</h3>
            <p>{giving.howToGive}</p>
            <Link className="button button-dark" href="/get-involved#community-contact">
              {my ? extraSectionChromeMy.contactGetInvolved : "Contact through Get Involved"}
            </Link>
          </div>
        </section>
      ) : null}

      {sectionKey === "certificates" ? (
        <section className="certificates-gallery" aria-labelledby="certificates-gallery-title">
          <div className="certificates-gallery-intro">
            <p className="eyebrow">{my ? extraSectionChromeMy.certificatesEyebrow : "Public record"}</p>
            <h2 id="certificates-gallery-title">{my ? extraSectionChromeMy.certificatesTitle : "Certificates"}</h2>
            <p>{certificates.galleryIntro}</p>
          </div>
          {visibleCertificates.length ? (
            <div className="certificates-grid">
              {visibleCertificates.map((item) => (
                <article key={item.id} className="certificate-card">
                  {item.imageUrl ? (
                    <figure>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.imageAlt || item.title} loading="lazy" />
                    </figure>
                  ) : (
                    <div className="certificate-placeholder" aria-hidden="true">
                      <span>Certificate</span>
                    </div>
                  )}
                  <div className="certificate-copy">
                    <span>{[item.year, item.issuer].filter(Boolean).join(" · ")}</span>
                    <h3>{item.title}</h3>
                    {item.description ? <p>{item.description}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="section-empty">
              <span>{my ? extraSectionChromeMy.comingIntoView : "COMING INTO VIEW"}</span>
              <p>
                {my
                  ? extraSectionChromeMy.certificatesEmpty
                  : "Approved certificates will appear here after administrators publish them."}
              </p>
            </div>
          )}
        </section>
      ) : null}

      {sectionKey === "stories" && (
        <section className="story-feed-boundary" aria-labelledby="story-feed-boundary-title">
          <div>
            <p className="eyebrow">{my ? extraSectionChromeMy.storiesBoundaryEyebrow : "A clear content boundary"}</p>
            <h2 id="story-feed-boundary-title">
              {my
                ? extraSectionChromeMy.storiesBoundaryTitle
                : "This is the changing news and stories feed."}
            </h2>
          </div>
          <div>
            <p>
              {my
                ? extraSectionChromeMy.storiesBoundaryBody
                : "Recent photographs, announcements and recaps appear here after administrator review. The permanent explanation of the organisation's service remains on Our Work. Any fundraising appeal must state its date, authorised beneficiary, collection method, closing date and reporting commitment. Payment details appear only after organisation approval."}
            </p>
            <Link href="/our-work">
              {my ? extraSectionChromeMy.readOurWork : "Read about Our Work"}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}

      {sectionKey === "stories" && (
        <section className="facebook-community-panel" aria-labelledby="facebook-community-title">
          <div>
            <p className="eyebrow">{my ? extraSectionChromeMy.facebookEyebrow : "Official community channel"}</p>
            <h2 id="facebook-community-title">
              {my ? extraSectionChromeMy.facebookTitle : "See community life as it happens."}
            </h2>
          </div>
          <div className="facebook-community-action">
            <p>
              {my
                ? extraSectionChromeMy.facebookBody
                : "Visit the official Burmese Catholic Community of Western Australia Facebook group for current conversations and activity updates."}
            </p>
            <a
              href="https://web.facebook.com/groups/115394412003293"
              target="_blank"
              rel="noreferrer"
            >
              {my ? extraSectionChromeMy.facebookLink : "Visit the official Facebook group"} <span aria-hidden="true">↗</span>
            </a>
            <small>{my ? extraSectionChromeMy.facebookNote : "Facebook may require visitors to sign in."}</small>
          </div>
        </section>
      )}

      <section className={`section-feature-grid${sectionKey === "our-work" ? " work-focus-grid" : ""}`}>
        {visibleFeatures.map((feature, index) => (
          <article key={feature.number}>
            {sectionKey === "our-work" && (
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={workMedia.featureImages[index]?.url || defaultPageMedia["our-work"].featureImages[index].url}
                  alt={workMedia.featureImages[index]?.alt || defaultPageMedia["our-work"].featureImages[index].alt}
                  loading="lazy"
                />
              </figure>
            )}
            <span>{feature.number}</span>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      {sectionKey === "our-work" && (
        <section className="work-updates-route" aria-labelledby="work-updates-title">
          <div>
            <p className="eyebrow">{my ? extraSectionChromeMy.workUpdatesEyebrow : "Looking for current activity?"}</p>
            <h2 id="work-updates-title">
              {my
                ? extraSectionChromeMy.workUpdatesTitle
                : "Our Work explains what we do. News & Stories shows what is happening now."}
            </h2>
          </div>
          <div>
            <p>
              {my
                ? extraSectionChromeMy.workUpdatesBody
                : "Recent photographs, announcements and community updates belong in one clear feed, separate from this permanent overview of faith, culture and community care."}
            </p>
            <Link className="button button-dark" href="/stories">
              {my ? extraSectionChromeMy.viewStories : "View News & Stories"}
            </Link>
            <a href="https://web.facebook.com/groups/115394412003293" target="_blank" rel="noreferrer">
              {my ? extraSectionChromeMy.facebookLink : "Visit the official Facebook group"} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      )}

      {sectionKey === "about" && (
        <>
          <section className="bcc-history" aria-labelledby="bcc-history-title">
            <div className="bcc-history-intro">
              <div>
                <p className="eyebrow">{aboutDisplay.historyEyebrow}</p>
                <h2 id="bcc-history-title">{aboutDisplay.historyTitle}</h2>
              </div>
              <div className="bcc-history-copy">
                {aboutDisplay.historyBody.split(/\n\n+/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="bcc-facts" aria-label="Organisation facts">
              <article><span>{my ? aboutChromeMy.formed : "Formed"}</span><strong>{aboutProfile.formed}</strong></article>
              <article><span>{my ? aboutChromeMy.incorporated : "Incorporated"}</span><strong>{aboutProfile.incorporated}</strong></article>
              <article><span>{my ? aboutChromeMy.registeredName : "Registered name"}</span><strong>{aboutProfile.legalName}</strong></article>
              <article><span>ABN</span><strong>{aboutProfile.abn}</strong></article>
            </div>
          </section>

          <section className="bcc-ministries" aria-labelledby="bcc-ministries-title">
            <div className="bcc-section-heading">
              <p className="eyebrow">{aboutDisplay.focusEyebrow}</p>
              <h2 id="bcc-ministries-title">{aboutDisplay.focusTitle}</h2>
            </div>
            <div className="bcc-ministry-grid">
              {aboutDisplay.focuses.map((focus, index) => (
                <article key={`${index}-${focus.title}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{focus.title}</h3>
                  <p>{focus.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="bcc-committee" id="committee" aria-labelledby="bcc-committee-title">
            <div className="bcc-section-heading committee-heading">
              <div>
                <p className="eyebrow">{aboutDisplay.committeeEyebrow}</p>
                <h2 id="bcc-committee-title">{aboutDisplay.committeeTitle}</h2>
              </div>
              <p>
                {my
                  ? `${aboutChromeMy.committeeIntro} ${aboutChromeMy.updated} ${aboutProfile.committeeUpdated}.`
                  : `Meet the people entrusted with serving the community. For privacy, personal contact details are not published. Updated ${aboutProfile.committeeUpdated}.`}
              </p>
            </div>

            <div className="committee-grid">
              {aboutProfile.committee.slice(0, 11).map((member) => (
                <CommitteeCard member={member} key={member.name} leadershipLabel={leadershipLabel} />
              ))}
            </div>

            <details className="executive-directory">
              <summary>
                {my ? `${aboutChromeMy.viewAll} ${aboutProfile.committee.slice(11).length}` : `View all ${aboutProfile.committee.slice(11).length} executive committee members`}
                <span aria-hidden="true">+</span>
              </summary>
              <div className="committee-grid">
                {aboutProfile.committee.slice(11).map((member) => (
                  <CommitteeCard member={member} key={member.name} leadershipLabel={leadershipLabel} />
                ))}
              </div>
            </details>
          </section>

          <section className="bcc-contact" aria-labelledby="bcc-contact-title">
            <div>
              <p className="eyebrow">{my ? aboutChromeMy.contactEyebrow : "Contact the community"}</p>
              <h2 id="bcc-contact-title">{my ? aboutChromeMy.contactTitle : "One private starting point."}</h2>
            </div>
            <div className="bcc-contact-action">
              <p>
                {my
                  ? aboutChromeMy.contactBody
                  : "Send your enquiry through the secure community form. An authorised administrator can direct it to the appropriate committee member."}
              </p>
              <Link className="button button-light" href="/get-involved#community-contact">
                {my ? aboutChromeMy.contactButton : "Contact the community"}
              </Link>
              <small>
                {my
                  ? aboutChromeMy.contactNote
                  : "Messages are recorded privately for responsible follow-up."}
              </small>
            </div>
          </section>

          <p className="bcc-source-note">
            {aboutProfile.sourceNote}
          </p>
        </>
      )}

      {sectionKey === "stories" && (
        <section className="section-published">
          <div className="section-published-heading">
            <p className="eyebrow">{my ? extraSectionChromeMy.recentUpdates : "Recent approved updates"}</p>
            <h2>{my ? extraSectionChromeMy.storiesFeed : "News & Stories feed"}</h2>
          </div>
          {posts.length ? (
          <div className="section-published-grid">
            {posts.map((post) => {
              const gallery =
                post.gallery?.length
                  ? post.gallery
                  : post.mediaUrl
                    ? [
                        {
                          id: post.mediaId || post.id,
                          url: post.mediaUrl,
                          contentType: post.mediaType || "image/",
                          alt: post.mediaAlt || post.title,
                        },
                      ]
                    : [];
              const cover = gallery[0];
              return (
              <article key={post.id}>
                {cover && cover.contentType.startsWith("image/") && (
                  <figure className="section-story-album">
                    {/* Public media is served only when attached to a published post. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover.url}
                      alt={cover.alt || post.title}
                      loading="lazy"
                      decoding="async"
                    />
                    {gallery.length > 1 ? (
                      <div className="section-story-thumbs">
                        {gallery.slice(1).map((item) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={item.id}
                            src={item.url}
                            alt={item.alt || post.title}
                            loading="lazy"
                          />
                        ))}
                      </div>
                    ) : null}
                  </figure>
                )}
                <div className="section-published-copy">
                  <span>{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <time>{post.date}</time>
                </div>
              </article>
              );
            })}
          </div>
          ) : (
            <div className="section-empty">
              <span>{my ? extraSectionChromeMy.comingIntoView : "COMING INTO VIEW"}</span>
              <p>
                {my
                  ? extraSectionChromeMy.storiesEmpty
                  : "Approved public updates for this section will appear here."}
              </p>
            </div>
          )}
        </section>
      )}

      {sectionKey === "get-involved" && <CommunityContactForm />}

      <footer className="section-footer">
        <Link className="wordmark official-wordmark" href="/">
          <LogoMark />
          <OfficialBrandText />
        </Link>
        <p>
          {my
            ? extraSectionChromeMy.footerNote
            : "Australian community action with a clear public purpose."}
        </p>
      </footer>
    </main>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import type { StaffUser } from "../lib/auth";
import {
  cloneAboutProfile,
  defaultAboutProfile,
  type AboutProfile,
} from "../lib/bcc-profile";
import {
  defaultHomePage,
  type HomePageSettings,
} from "../lib/home";
import {
  sectionDefinitions,
  sectionKeys,
  type SectionFeature,
  type SectionKey,
} from "../lib/sections";
import { AboutProfileEditor } from "./AboutProfileEditor";

type PageFields = {
  eyebrow: string;
  title: string;
  summary: string;
  statement: string;
  features: [SectionFeature, SectionFeature, SectionFeature];
  about: AboutProfile;
};

type PageSelection = "home" | SectionKey;

function defaults(key: SectionKey): PageFields {
  const page = sectionDefinitions[key];
  return {
    eyebrow: page.eyebrow,
    title: page.title,
    summary: page.summary,
    statement: page.statement,
    features: page.features.map((feature) => ({ ...feature })) as PageFields["features"],
    about: cloneAboutProfile(defaultAboutProfile),
  };
}

export function PageManager({ currentUser }: { currentUser: StaffUser }) {
  const [key, setKey] = useState<PageSelection>("about");
  const [fields, setFields] = useState<PageFields>(() => defaults("about"));
  const [home, setHome] = useState<HomePageSettings>(defaultHomePage);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const endpoint = key === "home"
      ? "/api/home"
      : `/api/pages?key=${encodeURIComponent(key)}`;
    fetch(endpoint, { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        if (key === "home" && payload.home) setHome(payload.home);
        if (key !== "home" && payload.page) {
          setFields({
            ...payload.page,
            features: payload.page.features || defaults(key).features,
            about: payload.page.about || cloneAboutProfile(defaultAboutProfile),
          });
        }
      })
      .catch((error) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setNotice("Using the reviewed repository copy for this page.");
      });
    return () => controller.abort();
  }, [key]);

  function selectPage(nextKey: PageSelection) {
    setKey(nextKey);
    if (nextKey === "home") {
      setHome(defaultHomePage);
    } else {
      setFields(defaults(nextKey));
    }
    setNotice("");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch(key === "home" ? "/api/home" : "/api/pages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(key === "home" ? home : { key, ...fields }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save page");
      if (key === "home" && payload.home) setHome(payload.home);
      if (key !== "home" && payload.page) {
        setFields({
          ...payload.page,
          features: payload.page.features || defaults(key).features,
          about: payload.page.about || cloneAboutProfile(defaultAboutProfile),
        });
      }
      setNotice(
        key === "home"
          ? "Home page public copy and pathways updated."
          : `${sectionDefinitions[key].label} public copy updated.`,
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save page");
    } finally {
      setSaving(false);
    }
  }

  function updateAbout(patch: Partial<AboutProfile>) {
    setFields((current) => ({
      ...current,
      about: { ...current.about, ...patch },
    }));
  }

  async function uploadHeroImage(file: File | undefined) {
    if (!file) return;
    setUploadingHero(true);
    setNotice("");
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("altText", home.heroImageAlt || file.name);
      const response = await fetch("/api/media", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to upload hero image");
      const mediaId = Number(payload.media.id);
      setHome((current) => ({
        ...current,
        heroImageUrl: `/api/media?id=${mediaId}`,
        heroImageAlt:
          current.heroImageAlt.trim() ||
          String(payload.media.alt_text || file.name).slice(0, 240),
      }));
      setNotice(
        "Hero image uploaded. Click Save page settings to show it on the public home page.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to upload hero image");
    } finally {
      setUploadingHero(false);
    }
  }

  return (
    <section className="operations-panel" id="pages">
      <div className="panel-heading">
        <div><p>WEBSITE PAGE SETTINGS</p><h2>Edit website pages</h2></div>
        <span>Administrator approval</span>
      </div>
      {currentUser.role === "editor" ? (
        <p className="team-readonly">
          Editors can place posts on every public page. Only Administrators and
          Owners can change the page-level headline and statement.
        </p>
      ) : (
        <form className="page-manager-form" onSubmit={save}>
          <label>
            Edit website page
            <select value={key} onChange={(event) => selectPage(event.target.value as PageSelection)}>
              <option value="home">Home page</option>
              {sectionKeys.map((item) => (
                <option key={item} value={item}>{sectionDefinitions[item].label}</option>
              ))}
            </select>
            <small className="field-guidance">
              This changes the permanent page wording and framework—not a post.
            </small>
          </label>
          {key === "home" ? (
            <>
              <label>
                Announcement
                <input maxLength={120} required value={home.announcement} onChange={(event) => setHome({ ...home, announcement: event.target.value })} />
              </label>
              <label>
                Hero eyebrow
                <input maxLength={80} required value={home.eyebrow} onChange={(event) => setHome({ ...home, eyebrow: event.target.value })} />
              </label>
              <label className="wide">
                Hero headline
                <input maxLength={160} required value={home.title} onChange={(event) => setHome({ ...home, title: event.target.value })} />
              </label>
              <label className="wide">
                Hero introduction
                <textarea rows={3} maxLength={600} required value={home.intro} onChange={(event) => setHome({ ...home, intro: event.target.value })} />
              </label>
              <label className="wide">
                Hero image URL
                <input maxLength={500} required value={home.heroImageUrl} onChange={(event) => setHome({ ...home, heroImageUrl: event.target.value })} />
                <small className="field-guidance">
                  Prefer Upload hero image below (sets `/api/media?id=…`). Default bundled path also works after deploy.
                </small>
              </label>
              <label className="wide">
                Upload hero image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  disabled={uploadingHero || saving}
                  onChange={(event) => {
                    void uploadHeroImage(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <small className="field-guidance">
                  {uploadingHero
                    ? "Uploading…"
                    : "Replaces the hero photo on the public website after you save."}
                </small>
              </label>
              <label className="wide">
                Hero image description
                <input maxLength={240} required value={home.heroImageAlt} onChange={(event) => setHome({ ...home, heroImageAlt: event.target.value })} />
                <small className="field-guidance">Describe the people and activity for visitors using assistive technology.</small>
              </label>
              <label>
                Pathway heading
                <input maxLength={160} required value={home.helpTitle} onChange={(event) => setHome({ ...home, helpTitle: event.target.value })} />
              </label>
              <label>
                Pathway introduction
                <input maxLength={300} required value={home.helpIntro} onChange={(event) => setHome({ ...home, helpIntro: event.target.value })} />
              </label>
              <div className="home-pathway-editor wide">
                <div className="home-pathway-editor-heading">
                  <strong>Homepage pathways</strong>
                  <small>Titles, descriptions, links and visibility</small>
                </div>
                {home.pathways.map((pathway, index) => (
                  <fieldset key={index}>
                    <legend>{String(index + 1).padStart(2, "0")}</legend>
                    <label>
                      Title
                      <input
                        maxLength={100}
                        required
                        value={pathway.title}
                        onChange={(event) => {
                          const pathways = [...home.pathways] as HomePageSettings["pathways"];
                          pathways[index] = { ...pathway, title: event.target.value };
                          setHome({ ...home, pathways });
                        }}
                      />
                    </label>
                    <label className="wide">
                      Description
                      <textarea
                        rows={2}
                        maxLength={360}
                        required
                        value={pathway.description}
                        onChange={(event) => {
                          const pathways = [...home.pathways] as HomePageSettings["pathways"];
                          pathways[index] = { ...pathway, description: event.target.value };
                          setHome({ ...home, pathways });
                        }}
                      />
                    </label>
                    <label className="wide">
                      Destination link
                      <input
                        maxLength={500}
                        required
                        value={pathway.href}
                        onChange={(event) => {
                          const pathways = [...home.pathways] as HomePageSettings["pathways"];
                          pathways[index] = { ...pathway, href: event.target.value };
                          setHome({ ...home, pathways });
                        }}
                      />
                    </label>
                    <label className="pathway-visibility">
                      <input
                        type="checkbox"
                        checked={pathway.visible}
                        onChange={(event) => {
                          const pathways = [...home.pathways] as HomePageSettings["pathways"];
                          pathways[index] = { ...pathway, visible: event.target.checked };
                          setHome({ ...home, pathways });
                        }}
                      />
                      Show on home page
                    </label>
                  </fieldset>
                ))}
              </div>
            </>
          ) : (
            <>
              {key === "about" && (
                <div className="about-editor-selected wide" role="status">
                  <span>ABOUT PAGE SELECTED</span>
                  <strong>Full history, organisation details and contact editor</strong>
                  <small>Changes saved here update the public About page.</small>
                </div>
              )}
              {key === "about" && (
                <AboutProfileEditor profile={fields.about} onChange={updateAbout} />
              )}
              <label>
                Eyebrow
                <input maxLength={80} required value={fields.eyebrow} onChange={(event) => setFields({ ...fields, eyebrow: event.target.value })} />
              </label>
              <label className="wide">
                Headline
                <input maxLength={160} required value={fields.title} onChange={(event) => setFields({ ...fields, title: event.target.value })} />
              </label>
              <label className="wide">
                Summary
                <textarea rows={3} maxLength={600} required value={fields.summary} onChange={(event) => setFields({ ...fields, summary: event.target.value })} />
              </label>
              <label className="wide">
                Public statement
                <input maxLength={220} required value={fields.statement} onChange={(event) => setFields({ ...fields, statement: event.target.value })} />
              </label>
              <div className="home-pathway-editor wide">
                <div className="home-pathway-editor-heading">
                  <strong>Page feature cards</strong>
                  <small>Content changes inside the protected page framework</small>
                </div>
                {fields.features.map((feature, index) => (
                  <fieldset key={feature.number}>
                    <legend>{feature.number}</legend>
                    <label>
                      Title
                      <input
                        maxLength={100}
                        required
                        value={feature.title}
                        onChange={(event) => {
                          const features = [...fields.features] as PageFields["features"];
                          features[index] = { ...feature, title: event.target.value };
                          setFields({ ...fields, features });
                        }}
                      />
                    </label>
                    <label>
                      Description
                      <textarea
                        rows={3}
                        maxLength={360}
                        required
                        value={feature.description}
                        onChange={(event) => {
                          const features = [...fields.features] as PageFields["features"];
                          features[index] = { ...feature, description: event.target.value };
                          setFields({ ...fields, features });
                        }}
                      />
                    </label>
                  </fieldset>
                ))}
              </div>
            </>
          )}
          <button className="button-review" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Update public page"}
          </button>
          {notice && <div className="admin-notice" role="status">{notice}</div>}
        </form>
      )}
    </section>
  );
}

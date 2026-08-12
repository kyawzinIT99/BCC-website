"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { publicNavigation } from "../lib/sections";
import { LogoMark } from "./LogoMark";

export const publicLanguages = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
  { code: "fa", label: "Dari" },
  { code: "kar", label: "Karen" },
  { code: "vi", label: "Vietnamese" },
] as const;

export type PublicLanguage = (typeof publicLanguages)[number]["code"];

export function PublicHeader({
  activeHref,
  language = "en",
  onLanguageChange,
}: {
  activeHref?: string;
  language?: PublicLanguage;
  onLanguageChange?: (language: PublicLanguage) => void;
}) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageMenuId = useId();
  const languageRef = useRef<HTMLDivElement>(null);
  const currentLanguage =
    publicLanguages.find((option) => option.code === language) ?? publicLanguages[0];

  useEffect(() => {
    if (!languageOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!languageRef.current?.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLanguageOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [languageOpen]);

  function isActive(href: string) {
    if (!activeHref) return false;
    if (href === "/") return activeHref === "/";
    return activeHref === href;
  }

  const primaryLinks = publicNavigation.filter((item) => !("cta" in item && item.cta));
  const cta = publicNavigation.find((item) => "cta" in item && item.cta);

  return (
    <header className="public-header-shell bcc-menubar bcc-menubar--pro">
      <div className="bcc-menubar-bar">
        <div className="public-brand-cluster">
          <Link
            className="wordmark"
            href="/"
            aria-label="Burmese Catholic Community of Western Australia home"
          >
            <LogoMark />
            <span className="brand-name">
              BURMESE CATHOLIC
              <br />
              COMMUNITY WA
            </span>
          </Link>
        </div>

        <nav className="bcc-menubar-nav" aria-label="Community pages">
          <div className="bcc-menubar-nav-track">
            {primaryLinks.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "active" : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="bcc-menubar-tools">
          <div className="language-access" ref={languageRef}>
            <button
              type="button"
              className="language-trigger"
              aria-expanded={languageOpen}
              aria-controls={languageMenuId}
              aria-haspopup="menu"
              onClick={() => setLanguageOpen((value) => !value)}
            >
              <span className="language-trigger-label">Language</span>
              <span className="language-trigger-value">{currentLanguage.label}</span>
              <span className="language-trigger-caret" aria-hidden="true" />
            </button>
            {languageOpen && (
              <div className="language-menu" id={languageMenuId} role="menu">
                {publicLanguages.map((option) => (
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={option.code === language}
                    key={option.code}
                    onClick={() => {
                      onLanguageChange?.(option.code);
                      setLanguageOpen(false);
                    }}
                  >
                    {option.label}
                    {option.code === language && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
                <a href="https://www.tisnational.gov.au/" target="_blank" rel="noreferrer">
                  More language help
                </a>
              </div>
            )}
          </div>

          <a className="verified-help-link" href="/get-involved#official-pathways">
            Verified help
          </a>

          {cta && (
            <Link className="public-cta bcc-menubar-cta" href={cta.href}>
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

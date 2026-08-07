"use client";

import Link from "next/link";
import { useState } from "react";
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
  const currentLanguage =
    publicLanguages.find((option) => option.code === language) ?? publicLanguages[0];

  function isActive(href: string) {
    if (!activeHref) return false;
    if (href === "/") return activeHref === "/";
    return activeHref === href;
  }

  const primaryLinks = publicNavigation.filter((item) => !("cta" in item && item.cta));
  const cta = publicNavigation.find((item) => "cta" in item && item.cta);

  return (
    <div className="public-header-shell bcc-menubar">
      <header className="site-header section-header bcc-menubar-top">
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
          <span className="independent-label">Independent community organisation</span>
        </div>
        {cta && (
          <Link className="public-cta bcc-menubar-cta" href={cta.href}>
            {cta.label}
          </Link>
        )}
      </header>

      <nav className="bcc-menubar-strip" aria-label="All community pages">
        <div className="bcc-menubar-strip-inner">
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

      <div className="language-access">
        <button
          type="button"
          aria-expanded={languageOpen}
          aria-controls="language-menu"
          onClick={() => setLanguageOpen((value) => !value)}
        >
          Language: {currentLanguage.label}
          <span aria-hidden="true">⌄</span>
        </button>
        {languageOpen && (
          <div className="language-menu" id="language-menu" role="menu">
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
              More language help ↗
            </a>
          </div>
        )}
        <a className="verified-help-link" href="/get-involved#official-pathways">
          Verified help
        </a>
      </div>
    </div>
  );
}

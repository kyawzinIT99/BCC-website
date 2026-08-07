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
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const currentLanguage =
    publicLanguages.find((option) => option.code === language) ?? publicLanguages[0];

  return (
    <div className="public-header-shell">
      <header className="site-header section-header">
        <div className="public-brand-cluster">
          <Link
            className="wordmark"
            href="/"
            aria-label="Burmese Catholic Community of Western Australia home"
            onClick={() => setMenuOpen(false)}
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
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="public-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
        <nav
          className={menuOpen ? "main-nav section-nav is-open" : "main-nav section-nav"}
          id="public-navigation"
          aria-label="Public pages"
        >
          {publicNavigation.map((item) => {
            const active = item.href === activeHref;

            return (
              <Link
                className={[
                  active ? "active" : "",
                  item.href === "/get-involved" ? "public-cta" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                href={item.href}
                key={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
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

"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { chromeMy, navLabel, publicLanguages, type PublicLanguage } from "../lib/public-language";
import { publicNavigation } from "../lib/sections";
import { LogoMark } from "./LogoMark";
import { OfficialBrandText } from "./OfficialBrandText";

export { publicLanguages, type PublicLanguage };

const primaryHrefs = new Set([
  "/about",
  "/our-work",
  "/giving",
  "/certificates",
  "/stories",
  "/events",
  "/live",
  "/gallery",
]);

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
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const languageMenuId = useId();
  const moreMenuId = useId();
  const mobileMenuId = useId();
  const languageRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const currentLanguage =
    publicLanguages.find((option) => option.code === language) ?? publicLanguages[0];

  const navItems = publicNavigation.filter((item) => !("cta" in item && item.cta));
  const primaryLinks = navItems.filter((item) => primaryHrefs.has(item.href));
  const moreLinks = navItems.filter(
    (item) => item.href !== "/" && !primaryHrefs.has(item.href),
  );
  const cta = publicNavigation.find((item) => "cta" in item && item.cta);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!languageRef.current?.contains(target)) setLanguageOpen(false);
      if (!moreRef.current?.contains(target)) setMoreOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLanguageOpen(false);
        setMoreOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function isActive(href: string) {
    if (!activeHref) return false;
    if (href === "/") return activeHref === "/";
    return activeHref === href;
  }

  const moreActive = moreLinks.some((item) => isActive(item.href));

  return (
    <header className="public-header-shell bcc-menubar bcc-menubar--pro">
      <div className="bcc-menubar-bar">
        <Link
          className="wordmark official-wordmark"
          href="/"
          aria-label="Burmese Catholic Community of Western Australia home"
        >
          <LogoMark />
          <OfficialBrandText />
        </Link>

        <nav className="bcc-menubar-nav bcc-menubar-nav--desktop" aria-label="Community pages">
          {primaryLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {navLabel(item.href, language, item.label)}
              </Link>
            );
          })}

          {moreLinks.length > 0 && (
            <div className="bcc-menubar-more" ref={moreRef}>
              <button
                type="button"
                className={moreActive ? "active" : undefined}
                aria-expanded={moreOpen}
                aria-controls={moreMenuId}
                aria-haspopup="menu"
                onClick={() => {
                  setMoreOpen((value) => !value);
                  setLanguageOpen(false);
                }}
              >
                {language === "my" ? chromeMy.more : "More"}
                <span className="bcc-menubar-caret" aria-hidden="true" />
              </button>
              {moreOpen && (
                <div className="bcc-menubar-dropdown" id={moreMenuId} role="menu">
                  {moreLinks.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className={active ? "active" : undefined}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMoreOpen(false)}
                      >
                        {navLabel(item.href, language, item.label)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="bcc-menubar-tools">
          <div className="language-access" ref={languageRef}>
            <button
              type="button"
              className="language-trigger"
              aria-expanded={languageOpen}
              aria-controls={languageMenuId}
              aria-haspopup="menu"
              onClick={() => {
                setLanguageOpen((value) => !value);
                setMoreOpen(false);
              }}
            >
              <span className="language-trigger-value">{currentLanguage.label}</span>
              <span className="bcc-menubar-caret" aria-hidden="true" />
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
                  {language === "my" ? chromeMy.languageHelp : "More language help"}
                </a>
              </div>
            )}
          </div>

          {cta && (
            <Link className="public-cta bcc-menubar-cta" href={cta.href}>
              {navLabel(cta.href, language, cta.label)}
            </Link>
          )}

          <button
            type="button"
            className="bcc-menubar-burger"
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="bcc-menubar-backdrop"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="bcc-menubar-drawer" id={mobileMenuId} aria-label="All pages">
            {navItems
              .filter((item) => item.href !== "/")
              .map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={active ? "active" : undefined}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    {navLabel(item.href, language, item.label)}
                  </Link>
                );
              })}
            {cta && (
              <Link
                className="bcc-menubar-drawer-cta"
                href={cta.href}
                onClick={() => setMobileOpen(false)}
              >
                {navLabel(cta.href, language, cta.label)}
              </Link>
            )}
          </nav>
        </>
      )}
    </header>
  );
}

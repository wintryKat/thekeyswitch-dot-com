"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "R\u00e9sum\u00e9" },
  { href: "/blog", label: "Blog" },
  { href: "/switches", label: "Switches" },
  { href: "/weather", label: "Weather" },
  { href: "/xr", label: "XR" },
  { href: "/metrics", label: "Metrics" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-[var(--surface-border)] bg-[var(--background)]/80 backdrop-blur-md"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--accent-light)] transition-colors hover:text-[var(--accent)]"
        >
          <Image src="/favicon.svg" alt="" width={24} height={24} aria-hidden="true" />
          The Key Switch
        </Link>

        {/* Desktop nav */}
        <ul className="hidden gap-1 md:flex" role="list">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "text-[var(--accent-light)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-1 -bottom-[13px] h-[2px] rounded-full bg-[var(--accent)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Theme toggle + Mobile hamburger */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)] md:hidden"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="transition-transform duration-200"
            >
              {mobileOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="5" x2="17" y2="5" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="15" x2="17" y2="15" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu — animated slide */}
      <div
        id="mobile-nav"
        ref={mobileMenuRef}
        className={`overflow-hidden border-t border-[var(--surface-border)] transition-[max-height,opacity] duration-300 ease-in-out md:hidden ${
          mobileOpen
            ? "max-h-[500px] opacity-100"
            : "max-h-0 opacity-0 border-t-transparent"
        }`}
        aria-hidden={!mobileOpen}
      >
        <ul className="mx-auto max-w-6xl space-y-1 px-4 py-3" role="list">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  tabIndex={mobileOpen ? 0 : -1}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-md px-3 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--accent)]/15 text-[var(--accent-light)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

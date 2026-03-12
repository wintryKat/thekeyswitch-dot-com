"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/admin/posts",
    label: "Posts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><line x1="6" y1="8" x2="18" y2="8" /><line x1="6" y1="12" x2="14" y2="12" /><line x1="6" y1="16" x2="10" y2="16" />
      </svg>
    ),
  },
  {
    href: "/admin/switches",
    label: "Switches",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 10h2v4H6z" /><path d="M10 10h4v4h-4z" /><path d="M16 10h2v4h-2z" />
      </svg>
    ),
  },
];

function handleLogout() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/";
}

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <nav className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-3">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2 border-b border-[var(--surface-border)] px-2 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent-light)]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="5" r="3" />
            <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-[var(--foreground)]">
          Admin Panel
        </span>
      </div>

      {/* Links */}
      <ul className="space-y-1">
        {sidebarLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-[var(--accent)]/15 text-[var(--accent-light)]"
                  : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Logout */}
      <div className="mt-3 border-t border-[var(--surface-border)] pt-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/10"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}

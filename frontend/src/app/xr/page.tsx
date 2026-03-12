"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";

const WorkshopScene = dynamic(
  () => import("@/components/three/WorkshopScene"),
  { ssr: false }
);

export default function XRPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    // Check WebGL2 support
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    // Slight delay so the loading screen renders before heavy JS kicks in
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide interaction hint after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(t);
  }, []);

  /* ---- No WebGL fallback ---- */
  if (!hasWebGL) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 text-6xl" aria-hidden="true">
          🎮
        </div>
        <h1 className="mb-4 text-3xl font-bold text-[var(--foreground)]">
          WebGL Not Available
        </h1>
        <p className="mb-6 max-w-md text-[var(--muted)]">
          The 3D experience requires a browser with WebGL support. Try Chrome,
          Firefox, or Edge on a desktop device for the best experience.
        </p>
        <Link
          href="/switches"
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          View Switch Comparison Tool Instead
        </Link>
      </div>
    );
  }

  /* ---- Main view ---- */
  return (
    <div className="relative">
      {/* Loading screen */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--background)]">
          <div className="text-center">
            <div className="relative mx-auto mb-5 h-12 w-12">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              <div className="absolute inset-2 animate-spin rounded-full border-2 border-[var(--accent-light)] border-b-transparent [animation-direction:reverse] [animation-duration:1.5s]" />
            </div>
            <p className="text-sm font-medium text-[var(--muted)]">
              Initializing 3D scene&hellip;
            </p>
          </div>
        </div>
      )}

      {/* 3D Scene */}
      <div className="h-[85vh] w-full">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                <p className="text-[var(--muted)]">Loading 3D scene&hellip;</p>
              </div>
            </div>
          }
        >
          {!isLoading && <WorkshopScene />}
        </Suspense>
      </div>

      {/* Controls hint — top right */}
      <div
        className={`absolute right-4 top-4 z-20 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-xs text-[var(--muted)] shadow-lg backdrop-blur-sm transition-opacity duration-700 ${
          showHint ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <p className="mb-1 font-semibold text-[var(--foreground)]">
          Controls
        </p>
        <ul className="space-y-0.5">
          <li>Drag to rotate</li>
          <li>Scroll to zoom</li>
          <li>Hover keycaps to interact</li>
        </ul>
      </div>

      {/* Bottom overlay with info + links */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 to-transparent px-4 pb-8 pt-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-[var(--foreground)]">
            The Mechanical Workshop
          </h1>
          <p className="mb-5 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
            An interactive 3D scene built with React Three Fiber, Three.js, and
            Drei. Featuring a mechanical keyboard with hoverable keycaps,
            animated switch cross-sections, and a reflective environment.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/switches"
              className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              Explore Switch Data &rarr;
            </Link>
            <a
              href="https://github.com/wintryKat/thekeyswitch-dot-com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-5 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-border)]"
            >
              View Source
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

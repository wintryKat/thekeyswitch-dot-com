import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WebXR Lab | The Key Switch",
  description: "Immersive 3D experiences built with WebXR and Three.js.",
};

export default function XRPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
        WebXR Lab
      </h1>
      <p className="mb-10 max-w-2xl text-[var(--muted)] leading-relaxed">
        Immersive 3D experiences built with WebXR, Three.js, and spatial
        computing APIs. Compatible with VR headsets, AR devices, and desktop
        browsers.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-[var(--surface-border)] bg-[var(--surface)]/50">
          <div className="text-center">
            <div className="mb-2 text-3xl">🥽</div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              VR Scene Viewer
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Three.js canvas will mount here
            </p>
          </div>
        </div>
        <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-[var(--surface-border)] bg-[var(--surface)]/50">
          <div className="text-center">
            <div className="mb-2 text-3xl">📱</div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              AR Model Placement
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              WebXR AR session will initialize here
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6">
        <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
          Browser Compatibility
        </h2>
        <p className="text-sm text-[var(--muted)]">
          WebXR experiences require a compatible browser. Chrome and Edge support
          both VR and AR sessions. On mobile, Chrome for Android supports AR via
          ARCore. A fallback orbit-controls viewer is provided for unsupported
          browsers.
        </p>
      </div>
    </div>
  );
}

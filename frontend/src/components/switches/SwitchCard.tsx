"use client";

import type { KeySwitch } from "@/lib/graphql/types";

interface SwitchCardProps {
  sw: KeySwitch;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled: boolean;
  colorIndex?: number;
}

const COMPARE_COLORS = [
  "border-violet-500/60",
  "border-cyan-500/60",
  "border-amber-500/60",
  "border-red-500/60",
];

const TYPE_BADGE: Record<string, { label: string; classes: string }> = {
  linear: {
    label: "Linear",
    classes: "bg-blue-500/10 border-blue-500/25 text-blue-400",
  },
  tactile: {
    label: "Tactile",
    classes: "bg-violet-500/10 border-violet-500/25 text-violet-400",
  },
  clicky: {
    label: "Clicky",
    classes: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
  },
};

export default function SwitchCard({
  sw,
  isSelected,
  onToggle,
  disabled,
  colorIndex,
}: SwitchCardProps) {
  const typeBadge = TYPE_BADGE[sw.type?.toLowerCase()] ?? {
    label: sw.type || "Unknown",
    classes: "bg-gray-500/10 border-gray-500/25 text-gray-400",
  };

  const borderClass =
    isSelected && colorIndex !== undefined
      ? COMPARE_COLORS[colorIndex % COMPARE_COLORS.length]
      : "border-[var(--surface-border)]";

  return (
    <div
      className={`group relative rounded-xl border-2 bg-[var(--surface)] p-5 transition-all duration-200 ${borderClass} ${
        isSelected
          ? "ring-1 ring-[var(--accent)]/20 shadow-md"
          : "hover:border-[var(--muted)]/30 hover:shadow-sm"
      }`}
    >
      {/* Compare checkbox */}
      <label
        className={`absolute right-3 top-3 flex items-center gap-1.5 text-xs cursor-pointer select-none ${
          disabled && !isSelected
            ? "opacity-40 cursor-not-allowed"
            : "opacity-70 hover:opacity-100"
        }`}
      >
        <span className="text-[var(--muted)]">Compare</span>
        <input
          type="checkbox"
          checked={isSelected}
          disabled={disabled && !isSelected}
          onChange={() => onToggle(sw.id)}
          className="h-4 w-4 rounded border-[var(--surface-border)] accent-[var(--accent)] cursor-pointer disabled:cursor-not-allowed"
        />
      </label>

      {/* Type badge */}
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeBadge.classes}`}
      >
        {typeBadge.label}
      </span>

      {/* Name and manufacturer */}
      <h3 className="mt-3 text-base font-semibold text-[var(--foreground)] leading-snug">
        {sw.name}
      </h3>
      <p className="mt-0.5 text-sm text-[var(--muted)]">{sw.manufacturer}</p>

      {/* Key specs */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {sw.actuationForceGf != null && (
          <div>
            <span className="text-[var(--muted)] text-xs">Actuation</span>
            <p className="font-medium text-[var(--foreground)]">
              {sw.actuationForceGf}gf
            </p>
          </div>
        )}
        {sw.bottomOutForceGf != null && (
          <div>
            <span className="text-[var(--muted)] text-xs">Bottom-out</span>
            <p className="font-medium text-[var(--foreground)]">
              {sw.bottomOutForceGf}gf
            </p>
          </div>
        )}
        {sw.totalTravelMm != null && (
          <div>
            <span className="text-[var(--muted)] text-xs">Total Travel</span>
            <p className="font-medium text-[var(--foreground)]">
              {sw.totalTravelMm}mm
            </p>
          </div>
        )}
        {sw.preTravelMm != null && (
          <div>
            <span className="text-[var(--muted)] text-xs">Pre-travel</span>
            <p className="font-medium text-[var(--foreground)]">
              {sw.preTravelMm}mm
            </p>
          </div>
        )}
      </div>

      {/* Material / spring info */}
      {(sw.springType || sw.stemMaterial || sw.housingMaterial) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {sw.springType && (
            <span className="inline-block rounded-md bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--muted)] border border-[var(--surface-border)]">
              {sw.springType}
            </span>
          )}
          {sw.stemMaterial && (
            <span className="inline-block rounded-md bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--muted)] border border-[var(--surface-border)]">
              {sw.stemMaterial}
            </span>
          )}
          {sw.housingMaterial && (
            <span className="inline-block rounded-md bg-[var(--background)] px-2 py-0.5 text-xs text-[var(--muted)] border border-[var(--surface-border)]">
              {sw.housingMaterial}
            </span>
          )}
        </div>
      )}

      {/* Price */}
      {sw.priceUsd != null && (
        <p className="mt-3 text-xs text-[var(--muted)]">
          ~${sw.priceUsd.toFixed(2)}/switch
        </p>
      )}
    </div>
  );
}

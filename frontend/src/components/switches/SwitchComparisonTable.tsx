"use client";

import type { KeySwitch } from "@/lib/graphql/types";

interface SwitchComparisonTableProps {
  switches: KeySwitch[];
}

const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

interface SpecRow {
  label: string;
  getValue: (s: KeySwitch) => string;
}

const SPEC_ROWS: SpecRow[] = [
  { label: "Manufacturer", getValue: (s) => s.manufacturer || "—" },
  {
    label: "Type",
    getValue: (s) =>
      s.type ? s.type.charAt(0).toUpperCase() + s.type.slice(1) : "—",
  },
  {
    label: "Actuation Force",
    getValue: (s) =>
      s.actuationForceGf != null ? `${s.actuationForceGf}gf` : "—",
  },
  {
    label: "Bottom-out Force",
    getValue: (s) =>
      s.bottomOutForceGf != null ? `${s.bottomOutForceGf}gf` : "—",
  },
  {
    label: "Pre-travel",
    getValue: (s) => (s.preTravelMm != null ? `${s.preTravelMm}mm` : "—"),
  },
  {
    label: "Total Travel",
    getValue: (s) => (s.totalTravelMm != null ? `${s.totalTravelMm}mm` : "—"),
  },
  { label: "Spring", getValue: (s) => s.springType || "—" },
  { label: "Stem Material", getValue: (s) => s.stemMaterial || "—" },
  { label: "Housing Material", getValue: (s) => s.housingMaterial || "—" },
  {
    label: "Sound Profile",
    getValue: (s) => s.soundProfile || "—",
  },
  {
    label: "Price",
    getValue: (s) =>
      s.priceUsd != null ? `$${s.priceUsd.toFixed(2)}` : "—",
  },
];

export default function SwitchComparisonTable({
  switches,
}: SwitchComparisonTableProps) {
  if (switches.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--surface-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--surface-border)] bg-[var(--surface)]">
            <th className="px-4 py-3 text-left font-medium text-[var(--muted)] whitespace-nowrap">
              Specification
            </th>
            {switches.map((s, i) => (
              <th key={s.id} className="px-4 py-3 text-left whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="font-semibold text-[var(--foreground)]">
                    {s.name}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SPEC_ROWS.map((row, rowIndex) => (
            <tr
              key={row.label}
              className={`border-b border-[var(--surface-border)] last:border-b-0 ${
                rowIndex % 2 === 0 ? "bg-[var(--background)]" : "bg-[var(--surface)]/50"
              }`}
            >
              <td className="px-4 py-2.5 font-medium text-[var(--muted)] whitespace-nowrap">
                {row.label}
              </td>
              {switches.map((s) => {
                const value = row.getValue(s);
                return (
                  <td
                    key={s.id}
                    className="px-4 py-2.5 text-[var(--foreground)]"
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

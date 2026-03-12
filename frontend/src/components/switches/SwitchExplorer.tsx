"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { KeySwitch } from "@/lib/graphql/types";
import SwitchCard from "./SwitchCard";
import SwitchComparisonTable from "./SwitchComparisonTable";
import ForceCurveChart from "@/components/d3/ForceCurveChart";

interface SwitchExplorerProps {
  initialSwitches: KeySwitch[];
}

const MAX_COMPARE = 4;

const TYPE_FILTERS = [
  { value: "", label: "All Types" },
  { value: "linear", label: "Linear" },
  { value: "tactile", label: "Tactile" },
  { value: "clicky", label: "Clicky" },
];

export default function SwitchExplorer({ initialSwitches }: SwitchExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read compare IDs from URL
  const compareParam = searchParams.get("compare") || "";
  const selectedIds = useMemo(
    () => compareParam.split(",").filter(Boolean),
    [compareParam]
  );

  // Local filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Update URL with selected switch IDs
  const setSelectedIds = useCallback(
    (ids: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (ids.length > 0) {
        params.set("compare", ids.join(","));
      } else {
        params.delete("compare");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const toggleCompare = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((sid) => sid !== id));
      } else if (selectedIds.length < MAX_COMPARE) {
        setSelectedIds([...selectedIds, id]);
      }
    },
    [selectedIds, setSelectedIds]
  );

  // Filter switches
  const filteredSwitches = useMemo(() => {
    let result = initialSwitches;

    if (typeFilter) {
      result = result.filter(
        (s) => s.type?.toLowerCase() === typeFilter
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.manufacturer.toLowerCase().includes(q) ||
          (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [initialSwitches, typeFilter, searchQuery]);

  // Get full switch objects for selected IDs
  const selectedSwitches = useMemo(
    () =>
      selectedIds
        .map((id) => initialSwitches.find((s) => s.id === id))
        .filter(Boolean) as KeySwitch[],
    [selectedIds, initialSwitches]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, [setSelectedIds]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <svg
              aria-hidden="true"
              focusable="false"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search switches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] pl-9 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 w-full sm:w-64 transition-colors"
            />
          </div>

          {/* Type filter buttons */}
          <div className="flex rounded-lg border border-[var(--surface-border)] overflow-hidden overflow-x-auto">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTypeFilter(filter.value)}
                className={`px-3.5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  typeFilter === filter.value
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-border)]/50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selection indicator */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted)]">
              {selectedIds.length}/{MAX_COMPARE} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-sm font-medium text-[var(--accent-light)] hover:text-[var(--accent)] transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Switch catalog grid */}
      {filteredSwitches.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSwitches.map((sw) => {
            const isSelected = selectedIds.includes(sw.id);
            const colorIndex = isSelected
              ? selectedIds.indexOf(sw.id)
              : undefined;
            return (
              <SwitchCard
                key={sw.id}
                sw={sw}
                isSelected={isSelected}
                onToggle={toggleCompare}
                disabled={selectedIds.length >= MAX_COMPARE}
                colorIndex={colorIndex}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[var(--surface-border)] text-[var(--muted)]">
          <p className="text-sm">
            {initialSwitches.length === 0
              ? "No switches available yet. Check back soon!"
              : "No switches match your filters."}
          </p>
        </div>
      )}

      {/* Comparison section */}
      <div id="comparison" className="scroll-mt-20">
        {selectedSwitches.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                Force Curve Comparison
              </h2>
              <span className="text-xs text-[var(--muted)] hidden sm:block">
                Hover over data points for details
              </span>
            </div>

            {/* Force curve chart */}
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4 sm:p-6">
              <ForceCurveChart switches={selectedSwitches} />
            </div>

            {/* Comparison table */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">
                Specifications
              </h2>
              <SwitchComparisonTable switches={selectedSwitches} />
            </div>
          </div>
        )}

        {selectedSwitches.length === 0 && (
          <ForceCurveChart switches={[]} />
        )}
      </div>
    </div>
  );
}

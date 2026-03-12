import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerClient } from "@/lib/graphql/client";
import { GET_SWITCHES } from "@/lib/graphql/queries";
import type { KeySwitch, SwitchConnection } from "@/lib/graphql/types";
import SwitchExplorer from "@/components/switches/SwitchExplorer";

export const metadata: Metadata = {
  title: "Keyboard Switch Comparison | The Key Switch",
  description:
    "Interactive force-curve visualizations and comparison tool for mechanical keyboard switches. Compare actuation force, travel distance, and spring characteristics.",
};

async function fetchSwitches(): Promise<KeySwitch[]> {
  try {
    const client = getServerClient();
    const data = await client.request<{ switches: SwitchConnection }>(
      GET_SWITCHES,
      { pageSize: 200 }
    );
    return data.switches.nodes;
  } catch (error) {
    console.error("Failed to fetch switches:", error);
    return [];
  }
}

export default async function SwitchesPage() {
  const switches = await fetchSwitches();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="mb-10">
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
          Keyboard Switch Comparison Tool
        </h1>
        <p className="max-w-2xl text-[var(--muted)] leading-relaxed">
          Compare mechanical keyboard switches side-by-side with interactive
          force-curve visualizations. Filter by type, search by name or
          manufacturer, and select up to 4 switches to compare.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            {/* Filter skeleton */}
            <div className="flex gap-3">
              <div className="h-10 w-64 animate-pulse rounded-lg bg-[var(--surface)]" />
              <div className="h-10 w-80 animate-pulse rounded-lg bg-[var(--surface)]" />
            </div>
            {/* Card grid skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl bg-[var(--surface)]"
                />
              ))}
            </div>
          </div>
        }
      >
        <SwitchExplorer initialSwitches={switches} />
      </Suspense>
    </div>
  );
}

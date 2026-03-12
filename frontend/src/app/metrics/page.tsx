import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Metrics | The Key Switch",
  description: "Live observability dashboards for infrastructure health.",
};

export default function MetricsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
        System Metrics
      </h1>
      <p className="mb-10 max-w-2xl text-[var(--muted)] leading-relaxed">
        Live observability dashboards showing infrastructure health, API latency
        percentiles, error rates, and deployment statistics pulled from
        Prometheus.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Uptime", value: "99.9%", color: "text-emerald-400" },
          { label: "p99 Latency", value: "-- ms", color: "text-amber-400" },
          { label: "Error Rate", value: "-- %", color: "text-red-400" },
          { label: "Deployments", value: "--", color: "text-blue-400" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-5"
          >
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              {metric.label}
            </p>
            <p className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="flex aspect-[2/1] items-center justify-center rounded-xl border border-dashed border-[var(--surface-border)] bg-[var(--surface)]/50">
          <p className="text-sm text-[var(--muted)]">
            Request latency chart (Prometheus)
          </p>
        </div>
        <div className="flex aspect-[2/1] items-center justify-center rounded-xl border border-dashed border-[var(--surface-border)] bg-[var(--surface)]/50">
          <p className="text-sm text-[var(--muted)]">
            Throughput over time chart (Prometheus)
          </p>
        </div>
      </div>
    </div>
  );
}

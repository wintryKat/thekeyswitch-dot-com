"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getPublicUrl } from "@/lib/graphql/client";
import { GET_SYSTEM_METRICS } from "@/lib/graphql/queries";
import type { SystemMetrics } from "@/lib/graphql/types";
import { formatBytes, formatUptime } from "@/lib/utils";
import GaugeChart from "@/components/charts/GaugeChart";
import {
  CpuAreaChart,
  NetworkChart,
  LoadAverageChart,
  UsageBar,
} from "@/components/charts/MetricsLineChart";

/* ---------- history point type ---------- */

interface HistoryPoint {
  time: string;
  cpu: number;
  rx: number;
  tx: number;
  load1: number;
  load5: number;
  load15: number;
}

const MAX_HISTORY = 60; // 60 samples * 5s = 5 minutes
const POLL_INTERVAL = 5_000;

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(getPublicUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: GET_SYSTEM_METRICS }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0]?.message ?? "GraphQL error");

      const m: SystemMetrics = json.data.systemMetrics;
      setMetrics(m);
      setConnected(true);
      setError(null);

      const now = new Date(m.timestamp);
      const timeLabel = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setHistory((prev) => {
        const next = [
          ...prev,
          {
            time: timeLabel,
            cpu: m.cpuUsagePercent,
            rx: m.networkRxBytesPerSec,
            tx: m.networkTxBytesPerSec,
            load1: m.loadAverage1m,
            load5: m.loadAverage5m,
            load15: m.loadAverage15m,
          },
        ];
        return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    intervalRef.current = setInterval(fetchMetrics, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchMetrics]);

  /* ---------- render ---------- */

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            System Metrics
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Live infrastructure dashboard &mdash; polling every 5 s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              connected ? "bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.6)]" : "bg-red-500"
            }`}
          />
          <span className="text-xs font-medium text-[var(--muted)]">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {error && !metrics && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          Failed to fetch metrics: {error}
        </div>
      )}

      {!metrics && !error && (
        <div className="flex items-center gap-3 py-24 justify-center text-[var(--muted)]">
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm">Connecting to metrics API&hellip;</span>
        </div>
      )}

      {metrics && (
        <>
          {/* ===== Top Row: Key Stats ===== */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* CPU Gauge */}
            <div className="flex items-center justify-center rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <GaugeChart
                value={metrics.cpuUsagePercent}
                label="CPU Usage"
                color={
                  metrics.cpuUsagePercent > 80
                    ? "#ef4444"
                    : metrics.cpuUsagePercent > 50
                      ? "#f59e0b"
                      : "#22c55e"
                }
              />
            </div>

            {/* Memory */}
            <div className="flex flex-col justify-center rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-5">
              <UsageBar
                label="Memory"
                usedBytes={metrics.memoryUsedBytes}
                totalBytes={metrics.memoryTotalBytes}
                color="#3b82f6"
              />
            </div>

            {/* Disk */}
            <div className="flex flex-col justify-center rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-5">
              <UsageBar
                label="Disk"
                usedBytes={metrics.diskUsedBytes}
                totalBytes={metrics.diskTotalBytes}
                color="#8b5cf6"
              />
            </div>

            {/* Uptime */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-5">
              <span className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                Uptime
              </span>
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatUptime(metrics.uptimeSeconds)}
              </span>
              <span className="mt-1 text-xs text-[var(--muted)]">
                since last restart
              </span>
            </div>
          </div>

          {/* ===== Middle Row: Real-time Charts ===== */}
          <div className="mb-6 grid gap-4 lg:grid-cols-3">
            {/* CPU History */}
            <ChartCard title="CPU History" subtitle="Last 5 minutes">
              <CpuAreaChart data={history} />
            </ChartCard>

            {/* Network I/O */}
            <ChartCard title="Network I/O" subtitle="Bytes per second">
              <NetworkChart data={history} />
            </ChartCard>

            {/* Load Average */}
            <ChartCard title="Load Average" subtitle="1m / 5m / 15m">
              <LoadAverageChart data={history} />
            </ChartCard>
          </div>

          {/* ===== Bottom Row: Container Status ===== */}
          <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] overflow-hidden">
            <div className="border-b border-[var(--surface-border)] px-5 py-3">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Container Status
              </h2>
            </div>

            {metrics.containerMetrics.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[var(--muted)]">
                No container metrics available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--surface-border)] text-xs uppercase tracking-wider text-[var(--muted)]">
                      <th className="px-5 py-2.5 font-medium">Container</th>
                      <th className="px-5 py-2.5 font-medium">Status</th>
                      <th className="px-5 py-2.5 font-medium text-right">CPU</th>
                      <th className="px-5 py-2.5 font-medium text-right">
                        Memory
                      </th>
                      <th className="px-5 py-2.5 font-medium text-right">
                        Mem Limit
                      </th>
                      <th className="px-5 py-2.5 font-medium text-right">
                        Mem %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.containerMetrics.map((c) => {
                      const memPct =
                        c.memoryLimitBytes > 0
                          ? (c.memoryUsedBytes / c.memoryLimitBytes) * 100
                          : 0;
                      const isRunning =
                        c.status.toLowerCase() === "running";

                      return (
                        <tr
                          key={c.name}
                          className="border-b border-[var(--surface-border)] last:border-b-0 hover:bg-[var(--background)]/40 transition-colors"
                        >
                          <td className="px-5 py-2.5 font-mono text-xs text-[var(--foreground)]">
                            {c.name}
                          </td>
                          <td className="px-5 py-2.5">
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className={`inline-block h-2 w-2 rounded-full ${
                                  isRunning ? "bg-emerald-500 dark:bg-emerald-400" : "bg-red-500"
                                }`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  isRunning
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {c.status}
                              </span>
                            </span>
                          </td>
                          <td className="px-5 py-2.5 text-right font-mono text-xs text-[var(--foreground)]">
                            {c.cpuPercent.toFixed(1)}%
                          </td>
                          <td className="px-5 py-2.5 text-right font-mono text-xs text-[var(--foreground)]">
                            {formatBytes(c.memoryUsedBytes)}
                          </td>
                          <td className="px-5 py-2.5 text-right font-mono text-xs text-[var(--muted)]">
                            {formatBytes(c.memoryLimitBytes)}
                          </td>
                          <td className="px-5 py-2.5 text-right">
                            <span
                              className={`font-mono text-xs font-medium ${
                                memPct > 80
                                  ? "text-red-600 dark:text-red-400"
                                  : memPct > 60
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-[var(--foreground)]"
                              }`}
                            >
                              {memPct.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Chart card wrapper ---------- */

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <p className="text-xs text-[var(--muted)]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

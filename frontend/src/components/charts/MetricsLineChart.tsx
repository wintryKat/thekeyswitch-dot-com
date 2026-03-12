"use client";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatBytes, formatBytesPerSec } from "@/lib/utils";

/* ---------- shared tooltip ---------- */

interface PayloadEntry {
  name: string;
  value: number;
  color: string;
}

function MetricTooltip({
  active,
  payload,
  formatter,
}: {
  active?: boolean;
  payload?: PayloadEntry[];
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-lg">
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[var(--muted)]">{entry.name}:</span>
          <span className="font-medium text-[var(--foreground)]">
            {formatter ? formatter(entry.value) : entry.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- CPU Area Chart ---------- */

interface CpuChartProps {
  data: { time: string; cpu: number }[];
}

export function CpuAreaChart({ data }: CpuChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--surface-border)"
          vertical={false}
        />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          tickLine={false}
          axisLine={false}
          width={36}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          content={
            <MetricTooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
          }
        />
        <Area
          type="monotone"
          dataKey="cpu"
          name="CPU"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#cpuGrad)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ---------- Network I/O Chart ---------- */

interface NetworkChartProps {
  data: { time: string; rx: number; tx: number }[];
}

export function NetworkChart({ data }: NetworkChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--surface-border)"
          vertical={false}
        />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v: number) => formatBytesPerSec(v)}
        />
        <Tooltip
          content={<MetricTooltip formatter={(v: number) => formatBytesPerSec(v)} />}
        />
        <Line
          type="monotone"
          dataKey="rx"
          name="RX"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="tx"
          name="TX"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ---------- Load Average Chart ---------- */

interface LoadChartProps {
  data: { time: string; load1: number; load5: number; load15: number }[];
}

export function LoadAverageChart({ data }: LoadChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--surface-border)"
          vertical={false}
        />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          tickLine={false}
          axisLine={false}
          width={36}
          tickFormatter={(v: number) => v.toFixed(1)}
        />
        <Tooltip
          content={<MetricTooltip formatter={(v: number) => v.toFixed(2)} />}
        />
        <Line
          type="monotone"
          dataKey="load1"
          name="1m"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="load5"
          name="5m"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="load15"
          name="15m"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ---------- Usage Bar ---------- */

interface UsageBarProps {
  label: string;
  usedBytes: number;
  totalBytes: number;
  color?: string;
}

export function UsageBar({
  label,
  usedBytes,
  totalBytes,
  color = "var(--accent)",
}: UsageBarProps) {
  const pct = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          {label}
        </span>
        <span className="text-lg font-bold text-[var(--foreground)]">
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--surface-border)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-[var(--muted)]">
        {formatBytes(usedBytes)} / {formatBytes(totalBytes)}
      </span>
    </div>
  );
}

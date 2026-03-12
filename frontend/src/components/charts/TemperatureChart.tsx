"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface TemperatureChartProps {
  times: string[];
  temperatures: number[];
}

interface ChartDataPoint {
  time: string;
  label: string;
  temp: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint; value: number }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--surface-border)",
        borderRadius: "8px",
        padding: "8px 12px",
      }}
    >
      <p style={{ color: "var(--muted)", fontSize: "12px", margin: 0 }}>
        {data.payload.time}
      </p>
      <p
        style={{
          color: "var(--foreground)",
          fontSize: "16px",
          fontWeight: 600,
          margin: "4px 0 0",
        }}
      >
        {data.value.toFixed(1)}&deg;C
      </p>
    </div>
  );
}

export default function TemperatureChart({
  times,
  temperatures,
}: TemperatureChartProps) {
  const data: ChartDataPoint[] = times.map((t, i) => {
    const date = new Date(t);
    return {
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      label: date.getHours().toString().padStart(2, "0") + ":00",
      temp: temperatures[i],
    };
  });

  const minTemp = Math.floor(Math.min(...temperatures)) - 2;
  const maxTemp = Math.ceil(Math.max(...temperatures)) + 2;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--surface-border)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: "var(--muted)", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "var(--surface-border)" }}
          interval={2}
        />
        <YAxis
          domain={[minTemp, maxTemp]}
          tick={{ fill: "var(--muted)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}\u00B0`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="temp"
          stroke="var(--accent)"
          strokeWidth={2}
          fill="url(#tempGradient)"
          dot={false}
          activeDot={{
            r: 5,
            fill: "var(--accent)",
            stroke: "var(--background)",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

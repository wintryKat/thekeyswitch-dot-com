"use client";

interface GaugeChartProps {
  value: number; // 0-100
  label: string;
  color?: string;
}

export default function GaugeChart({
  value,
  label,
  color = "var(--accent)",
}: GaugeChartProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset =
    circumference - (clampedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        role="img"
        aria-label={`${label}: ${clampedValue.toFixed(1)} percent`}
      >
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--surface-border)"
          strokeWidth="12"
        />
        {/* Value arc */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 80 80)"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
        {/* Value text */}
        <text
          x="80"
          y="76"
          textAnchor="middle"
          fill="var(--foreground)"
          fontSize="28"
          fontWeight="bold"
        >
          {clampedValue.toFixed(1)}%
        </text>
        <text
          x="80"
          y="96"
          textAnchor="middle"
          fill="var(--muted)"
          fontSize="12"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}

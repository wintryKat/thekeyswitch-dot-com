"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import type { KeySwitch } from "@/lib/graphql/types";

interface ForceCurveChartProps {
  switches: KeySwitch[];
}

const COLORS = [
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#ef4444", // red
];

interface CurvePoint {
  distance_mm: number;
  force_gf: number;
}

/**
 * Normalize force curve data from the GraphQL API.
 * The API returns `forceCurve` as `number[][]` (e.g. [[0,0],[1,45],[2,62]]),
 * where each inner array is [distance_mm, force_gf].
 */
function normalizeCurve(raw: unknown): CurvePoint[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p) => Array.isArray(p) && p.length >= 2)
    .map((p) => ({ distance_mm: p[0] as number, force_gf: p[1] as number }));
}

export default function ForceCurveChart({ switches }: ForceCurveChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);

  // Responsive resize
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({
          width: Math.max(300, width),
          height: Math.max(250, Math.min(500, width * 0.55)),
        });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // D3 chart rendering
  useEffect(() => {
    if (!svgRef.current || switches.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const isNarrow = dimensions.width < 500;
    const margin = { top: 24, right: isNarrow ? 16 : 130, bottom: isNarrow ? 80 : 54, left: isNarrow ? 48 : 64 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process switch data
    let maxDistance = 0;
    let maxForce = 0;
    const switchData = switches.map((s, i) => {
      const curve = normalizeCurve(s.forceCurve);
      curve.forEach((p) => {
        if (p.distance_mm > maxDistance) maxDistance = p.distance_mm;
        if (p.force_gf > maxForce) maxForce = p.force_gf;
      });
      return { switch: s, curve, color: COLORS[i % COLORS.length] };
    });

    // If no curve data exists, show a message
    if (maxDistance === 0 && maxForce === 0) {
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("fill", "var(--muted)")
        .style("font-size", "14px")
        .text("No force curve data available for the selected switches");
      return;
    }

    // Scales
    const x = d3
      .scaleLinear()
      .domain([0, maxDistance * 1.05])
      .range([0, width]);
    const y = d3
      .scaleLinear()
      .domain([0, maxForce * 1.15])
      .range([height, 0]);

    // Grid lines (horizontal)
    g.append("g")
      .attr("class", "grid-h")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", "var(--surface-border)")
      .style("stroke-opacity", 0.6);

    // Grid lines (vertical)
    g.append("g")
      .attr("class", "grid-v")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(-height)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", "var(--surface-border)")
      .style("stroke-opacity", 0.6);

    // Remove domain lines from grids
    g.selectAll(".grid-h .domain, .grid-v .domain").remove();

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(8))
      .call((axis) => axis.select(".domain").style("stroke", "var(--muted)"))
      .selectAll("text")
      .style("fill", "var(--muted)")
      .style("font-size", "12px");

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(8))
      .call((axis) => axis.select(".domain").style("stroke", "var(--muted)"))
      .selectAll("text")
      .style("fill", "var(--muted)")
      .style("font-size", "12px");

    // Tick lines
    svg.selectAll(".tick line").style("stroke", "var(--muted)");

    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 42)
      .attr("text-anchor", "middle")
      .style("fill", "var(--muted)")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .text("Travel Distance (mm)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -48)
      .attr("text-anchor", "middle")
      .style("fill", "var(--muted)")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .text("Force (gf)");

    // Line generator
    const line = d3
      .line<CurvePoint>()
      .x((d) => x(d.distance_mm))
      .y((d) => y(d.force_gf))
      .curve(d3.curveMonotoneX);

    // Draw each switch's curve
    switchData.forEach(({ switch: s, curve, color }) => {
      if (curve.length === 0) return;

      // Glow filter for the line
      const filterId = `glow-${s.id.replace(/[^a-zA-Z0-9]/g, "")}`;
      const defs = svg.select("defs").empty()
        ? svg.append("defs")
        : svg.select("defs");

      const filter = defs.append("filter").attr("id", filterId);
      filter
        .append("feGaussianBlur")
        .attr("stdDeviation", "3")
        .attr("result", "coloredBlur");
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      // Draw the line with glow
      const path = g
        .append("path")
        .datum(curve)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("filter", `url(#${filterId})`)
        .attr("d", line);

      // Animate the line drawing
      const totalLength = path.node()?.getTotalLength() || 0;
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);

      // Interactive data points
      g.selectAll(null)
        .data(curve)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.distance_mm))
        .attr("cy", (d) => y(d.force_gf))
        .attr("r", 4)
        .attr("fill", color)
        .attr("stroke", "var(--surface)")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0)
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d) {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("r", 7)
            .attr("opacity", 1);
          const [px, py] = d3.pointer(event, containerRef.current);
          setTooltip({
            x: px,
            y: py - 48,
            content: `${s.name}: ${d.distance_mm}mm / ${d.force_gf}gf`,
          });
        })
        .on("mouseleave", function () {
          d3.select(this)
            .transition()
            .duration(150)
            .attr("r", 4)
            .attr("opacity", 0);
          setTooltip(null);
        })
        .transition()
        .delay(1200)
        .duration(300)
        .attr("opacity", 0);
    });

    // Legend
    if (isNarrow) {
      // Horizontal legend below chart on narrow screens
      const legend = g
        .append("g")
        .attr("transform", `translate(0, ${height + 40})`);

      let xOffset = 0;
      switchData.forEach(({ switch: s, color }) => {
        const entry = legend
          .append("g")
          .attr("transform", `translate(${xOffset}, 0)`);

        entry
          .append("circle")
          .attr("cx", 5)
          .attr("cy", 6)
          .attr("r", 4)
          .attr("fill", color);

        const truncatedName = s.name.length > 12 ? s.name.slice(0, 12) + "\u2026" : s.name;
        entry
          .append("text")
          .attr("x", 14)
          .attr("y", 10)
          .style("fill", "var(--foreground)")
          .style("font-size", "10px")
          .style("font-weight", "500")
          .text(truncatedName);

        xOffset += truncatedName.length * 6.5 + 24;
      });
    } else {
      // Vertical legend to the right on wider screens
      const legend = g
        .append("g")
        .attr("transform", `translate(${width + 20}, 0)`);

      switchData.forEach(({ switch: s, color }, i) => {
        const entry = legend
          .append("g")
          .attr("transform", `translate(0, ${i * 28})`);

        entry
          .append("line")
          .attr("x1", 0)
          .attr("x2", 16)
          .attr("y1", 6)
          .attr("y2", 6)
          .attr("stroke", color)
          .attr("stroke-width", 2.5)
          .attr("stroke-linecap", "round");

        entry
          .append("circle")
          .attr("cx", 8)
          .attr("cy", 6)
          .attr("r", 3)
          .attr("fill", color);

        entry
          .append("text")
          .attr("x", 22)
          .attr("y", 10)
          .style("fill", "var(--foreground)")
          .style("font-size", "11px")
          .style("font-weight", "500")
          .text(s.name.length > 18 ? s.name.slice(0, 18) + "\u2026" : s.name);
      });
    }
  }, [switches, dimensions]);

  if (switches.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-[var(--surface-border)] bg-[var(--surface)]/50 text-[var(--muted)]">
        <div className="text-center">
          <svg
            className="mx-auto mb-3 h-10 w-10 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          <p className="text-sm font-medium">Select switches above to compare force curves</p>
          <p className="mt-1 text-xs opacity-60">Up to 4 switches can be compared simultaneously</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        ref={svgRef}
        className="w-full"
        style={{ overflow: "visible" }}
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] shadow-lg border border-[var(--surface-border)] backdrop-blur-sm"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateX(-50%)",
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

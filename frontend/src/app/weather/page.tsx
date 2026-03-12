import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weather Dashboard | The Key Switch",
  description: "Real-time weather data with interactive maps and forecasts.",
};

export default function WeatherPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
        Weather Dashboard
      </h1>
      <p className="mb-10 max-w-2xl text-[var(--muted)] leading-relaxed">
        Real-time weather data with interactive maps, multi-day forecasts, and
        historical trend analysis powered by the Spring Boot API.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Temperature", value: "--", unit: "°F" },
          { label: "Humidity", value: "--", unit: "%" },
          { label: "Wind Speed", value: "--", unit: "mph" },
          { label: "Pressure", value: "--", unit: "hPa" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-5"
          >
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-[var(--foreground)]">
              {stat.value}
              <span className="ml-1 text-base font-normal text-[var(--muted)]">
                {stat.unit}
              </span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-[var(--surface-border)] bg-[var(--surface)]/50 p-12 text-center">
        <p className="text-sm text-[var(--muted)]">
          Weather map and forecast charts will render here once the weather API
          integration is complete.
        </p>
      </div>
    </div>
  );
}

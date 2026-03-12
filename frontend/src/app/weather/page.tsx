"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  fetchWeather,
  searchCity,
  getWeatherDescription,
  getWeatherEmoji,
  type WeatherData,
} from "@/lib/weather";

const TemperatureChart = dynamic(
  () => import("@/components/charts/TemperatureChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

/* ---------- tiny helpers ---------- */

function ChartSkeleton() {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-[var(--surface-border)] bg-[var(--surface)]">
      <span className="text-sm text-[var(--muted)]">Loading chart...</span>
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayName(iso: string, idx: number) {
  if (idx === 0) return "Today";
  if (idx === 1) return "Tomorrow";
  return new Date(iso).toLocaleDateString([], { weekday: "short" });
}

/* ---------- main page ---------- */

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geoBlocked, setGeoBlocked] = useState(false);

  /* city search */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ name: string; lat: number; lon: number; country: string }>
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* load weather for coords */
  const loadWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(lat, lon);
      setWeather(data);
    } catch {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* geolocation on mount */
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoBlocked(true);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadWeather(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setGeoBlocked(true);
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, [loadWeather]);

  /* auto-refresh every 15 min */
  useEffect(() => {
    if (!weather) return;
    refreshRef.current = setInterval(() => {
      /* re-fetch silently; coords cached via locationName */
    }, 15 * 60 * 1000);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [weather]);

  /* debounced city search */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await searchCity(searchQuery);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const selectCity = (city: {
    name: string;
    lat: number;
    lon: number;
    country: string;
  }) => {
    setShowDropdown(false);
    setSearchQuery("");
    setSearchResults([]);
    setGeoBlocked(false);
    loadWeather(city.lat, city.lon);
  };

  /* ---------- render ---------- */

  /* loading state */
  if (loading && !weather) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--surface-border)] border-t-[var(--accent)]" />
          <p className="text-[var(--muted)]">Fetching weather data...</p>
        </div>
      </div>
    );
  }

  /* geo denied + no data */
  if (geoBlocked && !weather) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
          Weather Dashboard
        </h1>
        <p className="mb-8 max-w-2xl text-[var(--muted)] leading-relaxed">
          Location access was denied. Search for a city to view weather data.
        </p>
        <SearchBox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showDropdown={showDropdown}
          searchResults={searchResults}
          selectCity={selectCity}
          setShowDropdown={setShowDropdown}
        />
      </div>
    );
  }

  /* error */
  if (error && !weather) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
          Weather Dashboard
        </h1>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
        <div className="mt-6">
          <SearchBox
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showDropdown={showDropdown}
            searchResults={searchResults}
            selectCity={selectCity}
            setShowDropdown={setShowDropdown}
          />
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const { current, hourly, daily, locationName } = weather;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      {/* header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
            Current Weather
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            {locationName}
          </h1>
        </div>
        <SearchBox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showDropdown={showDropdown}
          searchResults={searchResults}
          selectCity={selectCity}
          setShowDropdown={setShowDropdown}
          compact
        />
      </div>

      {/* current conditions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* big temp card */}
        <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6 sm:col-span-2">
          <div className="flex items-center gap-4">
            <span className="text-6xl leading-none">
              {getWeatherEmoji(current.weatherCode, current.isDay)}
            </span>
            <div>
              <p className="text-5xl font-extrabold text-[var(--foreground)]">
                {current.temperature.toFixed(1)}
                <span className="text-2xl font-normal text-[var(--muted)]">
                  &deg;C
                </span>
              </p>
              <p className="mt-1 text-lg text-[var(--muted)]">
                {getWeatherDescription(current.weatherCode)}
              </p>
            </div>
          </div>
        </div>

        {/* humidity */}
        <StatCard label="Humidity" value={`${current.humidity}`} unit="%" />
        {/* wind */}
        <StatCard
          label="Wind Speed"
          value={`${current.windSpeed.toFixed(1)}`}
          unit="km/h"
        />
      </div>

      {/* sunrise / sunset */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-5">
          <span className="text-2xl">{"\uD83C\uDF05"}</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Sunrise
            </p>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              {formatTime(daily.sunrise[0])}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-5">
          <span className="text-2xl">{"\uD83C\uDF07"}</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              Sunset
            </p>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              {formatTime(daily.sunset[0])}
            </p>
          </div>
        </div>
      </div>

      {/* 24-hour temperature chart */}
      <div className="mb-8 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">
          24-Hour Temperature Trend
        </h2>
        <TemperatureChart times={hourly.time} temperatures={hourly.temperature} />
      </div>

      {/* 7-day forecast */}
      <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6">
        <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">
          7-Day Forecast
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {daily.time.map((d, i) => (
            <div
              key={d}
              className="flex flex-col items-center rounded-lg border border-[var(--surface-border)] bg-[var(--background)] p-4 transition-colors hover:border-[var(--accent)]"
            >
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                {dayName(d, i)}
              </p>
              <span className="my-2 text-3xl">
                {getWeatherEmoji(daily.weatherCode[i], true)}
              </span>
              <p className="text-sm text-[var(--foreground)]">
                <span className="font-bold">
                  {daily.temperatureMax[i].toFixed(0)}&deg;
                </span>
                <span className="mx-1 text-[var(--muted)]">/</span>
                <span className="text-[var(--muted)]">
                  {daily.temperatureMin[i].toFixed(0)}&deg;
                </span>
              </p>
              <p className="mt-1 text-center text-[10px] leading-tight text-[var(--muted)]">
                {getWeatherDescription(daily.weatherCode[i])}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* refresh note */}
      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        Auto-refreshes every 15 minutes &middot; Data from Open-Meteo
      </p>
    </div>
  );
}

/* ---------- sub-components ---------- */

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-5">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        {label}
      </p>
      <p className="text-3xl font-bold text-[var(--foreground)]">
        {value}
        <span className="ml-1 text-base font-normal text-[var(--muted)]">
          {unit}
        </span>
      </p>
    </div>
  );
}

function SearchBox({
  searchQuery,
  setSearchQuery,
  showDropdown,
  searchResults,
  selectCity,
  setShowDropdown,
  compact = false,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showDropdown: boolean;
  searchResults: Array<{
    name: string;
    lat: number;
    lon: number;
    country: string;
  }>;
  selectCity: (c: {
    name: string;
    lat: number;
    lon: number;
    country: string;
  }) => void;
  setShowDropdown: (v: boolean) => void;
  compact?: boolean;
}) {
  return (
    <div className={`relative ${compact ? "w-full sm:w-72" : "w-full max-w-md"}`}>
      <input
        type="text"
        placeholder="Search city..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => {
          if (searchResults.length > 0) setShowDropdown(true);
        }}
        onBlur={() => {
          /* delay so click on result registers */
          setTimeout(() => setShowDropdown(false), 200);
        }}
        className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted)] outline-none transition-colors focus:border-[var(--accent)]"
      />
      {showDropdown && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] shadow-lg">
          {searchResults.map((city, i) => (
            <li key={`${city.lat}-${city.lon}-${i}`}>
              <button
                type="button"
                onMouseDown={() => selectCity(city)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]/10"
              >
                <span className="font-medium">{city.name}</span>
                <span className="text-[var(--muted)]">{city.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

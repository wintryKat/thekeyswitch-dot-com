export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
}

export interface HourlyForecast {
  time: string[];
  temperature: number[];
  humidity: number[];
  precipitation: number[];
}

export interface DailyForecast {
  time: string[];
  temperatureMax: number[];
  temperatureMin: number[];
  weatherCode: number[];
  sunrise: string[];
  sunset: string[];
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  locationName: string;
}

export async function fetchWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current:
      "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
    hourly: "temperature_2m,relative_humidity_2m,precipitation",
    daily: "temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset",
    timezone: "auto",
    forecast_days: "7",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`
  );
  if (!response.ok) throw new Error("Failed to fetch weather data");
  const data = await response.json();

  // Reverse geocode for location name
  const geoResponse = await fetch(
    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1`
  );
  const geoData = geoResponse.ok ? await geoResponse.json() : { results: [] };
  const locationName =
    geoData.results?.[0]?.name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;

  return {
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
    },
    hourly: {
      time: data.hourly.time.slice(0, 24),
      temperature: data.hourly.temperature_2m.slice(0, 24),
      humidity: data.hourly.relative_humidity_2m.slice(0, 24),
      precipitation: data.hourly.precipitation.slice(0, 24),
    },
    daily: {
      time: data.daily.time,
      temperatureMax: data.daily.temperature_2m_max,
      temperatureMin: data.daily.temperature_2m_min,
      weatherCode: data.daily.weather_code,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
    },
    locationName,
  };
}

export async function searchCity(
  query: string
): Promise<Array<{ name: string; lat: number; lon: number; country: string }>> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`
  );
  if (!response.ok) return [];
  const data = await response.json();
  return (data.results || []).map((r: Record<string, unknown>) => ({
    name: r.name as string,
    lat: r.latitude as number,
    lon: r.longitude as number,
    country: (r.country as string) || "",
  }));
}

export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] || "Unknown";
}

export function getWeatherEmoji(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "\u2600\uFE0F" : "\uD83C\uDF19";
  if (code <= 3) return isDay ? "\u26C5" : "\u2601\uFE0F";
  if (code <= 48) return "\uD83C\uDF2B\uFE0F";
  if (code <= 55) return "\uD83C\uDF26\uFE0F";
  if (code <= 65) return "\uD83C\uDF27\uFE0F";
  if (code <= 75) return "\uD83C\uDF28\uFE0F";
  if (code <= 82) return "\uD83C\uDF26\uFE0F";
  return "\u26C8\uFE0F";
}

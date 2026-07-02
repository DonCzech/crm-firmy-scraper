export const DASHBOARD_ACTIVE_BOARD_KEY = 'core_dashboard_active_board_v1';
export const HEADER_WEATHER_SNAPSHOT_KEY = 'core_header_weather_snapshot_v1';
export const WEATHER_CITY_KEY_PREFIX = 'core_dashboard_weather_city_';

export type WeatherSnapshot = {
  city: string;
  temp: number | null;
  wind: number | null;
  code: number | null;
  label: string;
  updatedAt: number;
};

export function weatherLabel(code: number): string {
  if (code === 0) return 'Jasno';
  if (code === 1 || code === 2) return 'Polojasno';
  if (code === 3) return 'Zamračeno';
  if (code === 45 || code === 48) return 'Mlha';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Mrholí';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Prší';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Sněží';
  if ([95, 96, 99].includes(code)) return 'Bouřka';
  return 'Počasí';
}

export async function fetchCurrentWeatherByCity(city: string): Promise<WeatherSnapshot> {
  const normalizedCity = city.trim() || 'Praha';
  const gRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalizedCity)}&count=1&language=cs&format=json`,
  );
  const gJson = (await gRes.json()) as { results?: Array<{ latitude: number; longitude: number }> };
  const first = gJson.results?.[0];
  if (!first) {
    throw new Error('Město nenalezeno');
  }
  const wRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${first.latitude}&longitude=${first.longitude}&current=temperature_2m,wind_speed_10m,weather_code`,
  );
  const wJson = (await wRes.json()) as {
    current?: { temperature_2m?: number; wind_speed_10m?: number; weather_code?: number };
  };
  const numericCode = Number(wJson.current?.weather_code ?? -1);
  return {
    city: normalizedCity,
    temp: wJson.current?.temperature_2m ?? null,
    wind: wJson.current?.wind_speed_10m ?? null,
    code: Number.isFinite(numericCode) ? numericCode : null,
    label: weatherLabel(numericCode),
    updatedAt: Date.now(),
  };
}

export function getWeatherCityStorageKey(boardId: string): string {
  return `${WEATHER_CITY_KEY_PREFIX}${boardId}`;
}

export function readPreferredWeatherCity(): string {
  if (typeof window === 'undefined') return 'Praha';
  try {
    const activeBoard = window.localStorage.getItem(DASHBOARD_ACTIVE_BOARD_KEY)?.trim();
    if (activeBoard) {
      const byActiveBoard = window.localStorage.getItem(getWeatherCityStorageKey(activeBoard))?.trim();
      if (byActiveBoard) return byActiveBoard;
    }
    const keys = Object.keys(window.localStorage);
    const anyCityKey = keys.find((key) => key.startsWith(WEATHER_CITY_KEY_PREFIX));
    const fallback = anyCityKey ? window.localStorage.getItem(anyCityKey)?.trim() : '';
    return fallback || 'Praha';
  } catch {
    return 'Praha';
  }
}

export function writeHeaderWeatherSnapshot(snapshot: WeatherSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HEADER_WEATHER_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage failures
  }
}

export function readHeaderWeatherSnapshot(): WeatherSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(HEADER_WEATHER_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WeatherSnapshot;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}


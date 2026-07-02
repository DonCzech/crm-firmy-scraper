import { useEffect, useMemo, useRef, useState } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudRain, CloudSun, Snowflake, Sun, Zap } from 'lucide-react';
import {
  fetchCurrentWeatherByCity,
  readHeaderWeatherSnapshot,
  readPreferredWeatherCity,
  type WeatherSnapshot,
  writeHeaderWeatherSnapshot,
} from '@/store-inventory/weather/shared-weather';

function WeatherIcon({ code }: { code: number | null }) {
  if (code === null) return <Cloud className="size-4 text-muted-foreground" />;
  if (code === 0) return <Sun className="size-4 text-amber-500" />;
  if (code === 1 || code === 2) return <CloudSun className="size-4 text-muted-foreground" />;
  if (code === 3) return <Cloud className="size-4 text-muted-foreground" />;
  if (code === 45 || code === 48) return <CloudFog className="size-4 text-muted-foreground" />;
  if ([51, 53, 55, 56, 57].includes(code)) return <CloudDrizzle className="size-4 text-sky-600" />;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain className="size-4 text-sky-600" />;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <Snowflake className="size-4 text-cyan-600" />;
  if ([95, 96, 99].includes(code)) return <Zap className="size-4 text-violet-600" />;
  return <Cloud className="size-4 text-muted-foreground" />;
}

export function WeatherIndicator() {
  const [state, setState] = useState<WeatherSnapshot | null>(null);
  const pendingCityTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    const cached = readHeaderWeatherSnapshot();
    if (cached) {
      setState(cached);
    }

    const load = async (forceCity?: string) => {
      try {
        const city = forceCity || readPreferredWeatherCity();
        const next = await fetchCurrentWeatherByCity(city);
        if (!active) return;
        setState(next);
        writeHeaderWeatherSnapshot(next);
      } catch {
        // keep previous value
      }
    };

    void load();
    const onWeatherUpdated = (event: Event) => {
      const detail = (event as CustomEvent<WeatherSnapshot>).detail;
      if (!detail || !active) return;
      setState(detail);
      writeHeaderWeatherSnapshot(detail);
    };
    const onWeatherCityChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ city?: string }>).detail;
      const city = detail?.city?.trim();
      if (!city || !active) return;
      if (pendingCityTimerRef.current) window.clearTimeout(pendingCityTimerRef.current);
      pendingCityTimerRef.current = window.setTimeout(() => {
        void load(city);
      }, 450);
    };
    window.addEventListener('coreWeatherUpdated', onWeatherUpdated as EventListener);
    window.addEventListener('coreWeatherCityChanged', onWeatherCityChanged as EventListener);
    const timer = window.setInterval(() => void load(), 10 * 60 * 1000);
    return () => {
      active = false;
      window.removeEventListener('coreWeatherUpdated', onWeatherUpdated as EventListener);
      window.removeEventListener('coreWeatherCityChanged', onWeatherCityChanged as EventListener);
      if (pendingCityTimerRef.current) {
        window.clearTimeout(pendingCityTimerRef.current);
      }
      window.clearInterval(timer);
    };
  }, []);

  const temperatureText = useMemo(() => {
    if (!state || state.temp == null) return '— °C';
    return `${state.temp.toFixed(1)} °C`;
  }, [state]);

  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-border/70 px-2.5 py-1 text-xs text-foreground">
      <WeatherIcon code={state?.code ?? null} />
      <span className="font-medium tabular-nums">{temperatureText}</span>
      <span className="text-muted-foreground">{state?.label || 'Počasí'}</span>
    </div>
  );
}

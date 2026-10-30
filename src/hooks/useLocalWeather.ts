import { useState, useEffect, useCallback, useRef } from "react";
import type { WeatherData } from "@/hooks/useDataUpdates";
import { getWeatherCondition } from "@/lib/weatherConditions";
import { toUF, type CityOption } from "@/data/brazilCities";

const STORAGE_KEY = "painel-agro:weather-location";
const OPEN_METEO_API = "https://api.open-meteo.com/v1/forecast";
const REVERSE_GEOCODE_API = "https://api.bigdatacloud.net/data/reverse-geocode-client";
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutos

export type LocationSource = "geo" | "manual";

export interface UserLocation extends CityOption {
  source: LocationSource;
}

export type LocalWeatherStatus =
  | "locating" // aguardando permissão / GPS
  | "loading" // buscando previsão
  | "ready"
  | "needs-city" // localização indisponível/negada -> exibir picklist
  | "error";

type StoredPreference = { mode: "geo" } | ({ mode: "manual" } & CityOption);

function readPreference(): StoredPreference | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPreference) : null;
  } catch {
    return null;
  }
}

function savePreference(pref: StoredPreference) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
  } catch {
    /* armazenamento indisponível (modo privado etc.) */
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; state: string }> {
  try {
    const url = `${REVERSE_GEOCODE_API}?latitude=${lat}&longitude=${lon}&localityLanguage=pt`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("reverse geocode failed");
    const data = await res.json();
    const city: string = data.city || data.locality || "Minha localização";
    const subdivisionCode: string = data.principalSubdivisionCode || ""; // ex.: "BR-SP"
    const state = subdivisionCode.startsWith("BR-")
      ? subdivisionCode.slice(3)
      : toUF(data.principalSubdivision);
    return { city, state };
  } catch {
    return { city: "Minha localização", state: "" };
  }
}

async function fetchForecast(loc: CityOption): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(loc.lat),
    longitude: String(loc.lon),
    current: "temperature_2m,relative_humidity_2m,weather_code",
    daily: "precipitation_probability_max",
    timezone: "America/Sao_Paulo",
    forecast_days: "1",
  });
  const res = await fetch(`${OPEN_METEO_API}?${params}`);
  if (!res.ok) throw new Error("Failed to fetch forecast");
  const data = await res.json();
  if (!data.current) throw new Error("No forecast data");

  const weatherCode: number = data.current.weather_code || 0;
  const condition = getWeatherCondition(weatherCode);
  return {
    city: loc.city,
    state: loc.state,
    temperature: Math.round(data.current.temperature_2m),
    humidity: Math.round(data.current.relative_humidity_2m),
    rainProbability: data.daily?.precipitation_probability_max?.[0] || 0,
    condition: condition.description,
    conditionIcon: condition.icon,
  };
}

/**
 * Clima da localização do usuário (geolocalização do navegador) com
 * fallback para uma cidade escolhida manualmente em uma picklist.
 */
export function useLocalWeather() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<LocalWeatherStatus>("locating");
  const [message, setMessage] = useState<string | null>(null);
  const requestId = useRef(0);

  const requestGeolocation = useCallback(() => {
    const id = ++requestId.current;
    setMessage(null);

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("needs-city");
      setMessage("Seu navegador não suporta geolocalização. Escolha uma cidade:");
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setStatus("needs-city");
      setMessage("Localização indisponível nesta conexão. Escolha uma cidade:");
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (id !== requestId.current) return;
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const { city, state } = await reverseGeocode(lat, lon);
        if (id !== requestId.current) return;
        savePreference({ mode: "geo" });
        setLocation({ city, state, lat, lon, source: "geo" });
      },
      (err) => {
        if (id !== requestId.current) return;
        setStatus("needs-city");
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? "Localização não autorizada. Escolha uma cidade:"
            : "Não foi possível obter sua localização. Escolha uma cidade:"
        );
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 }
    );
  }, []);

  const selectCity = useCallback((city: CityOption) => {
    requestId.current++; // cancela pedidos de geolocalização pendentes
    savePreference({ mode: "manual", ...city });
    setMessage(null);
    setLocation({ ...city, source: "manual" });
  }, []);

  // Inicialização: respeita a preferência salva do usuário
  useEffect(() => {
    const pref = readPreference();
    if (pref?.mode === "manual") {
      setLocation({ city: pref.city, state: pref.state, lat: pref.lat, lon: pref.lon, source: "manual" });
    } else {
      requestGeolocation();
    }
  }, [requestGeolocation]);

  // Busca a previsão sempre que a localização mudar (e atualiza periodicamente)
  useEffect(() => {
    if (!location) return;
    let cancelled = false;

    const load = async (showLoading: boolean) => {
      if (showLoading) setStatus("loading");
      try {
        const data = await fetchForecast(location);
        if (cancelled) return;
        setWeather(data);
        setStatus("ready");
      } catch (err) {
        console.error("Error fetching local weather:", err);
        if (cancelled) return;
        setStatus("error");
        setMessage("Erro ao carregar o clima desta cidade.");
      }
    };

    load(true);
    const interval = setInterval(() => load(false), REFRESH_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [location]);

  return { location, weather, status, message, requestGeolocation, selectCity };
}


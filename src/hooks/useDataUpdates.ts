import { useState, useEffect, useCallback, useRef } from "react";

// Types for each data source
export interface Quote {
    name: string;
    value: string;
    change: number;
}

export interface WeatherData {
    city: string;
    state: string;
    temperature: number;
    humidity: number;
    rainProbability: number;
    condition?: string;
    conditionIcon?: string;
}

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    imageUrl: string;
    articleUrl: string;
    source?: string;
    pubDate?: string;
}

export interface Category {
    id: string;
    title: string;
    news: NewsItem[];
}

// Global state for last update time (shared across components)
let globalLastUpdate: string | null = null;
let globalUpdateListeners: Set<(timestamp: string) => void> = new Set();

function notifyGlobalUpdate(timestamp: string) {
    // Only update if new timestamp is more recent than current
    if (!globalLastUpdate) {
        globalLastUpdate = timestamp;
        globalUpdateListeners.forEach(listener => listener(timestamp));
    } else {
        const newDate = new Date(timestamp).getTime();
        const currentDate = new Date(globalLastUpdate).getTime();
        if (newDate > currentDate) {
            globalLastUpdate = timestamp;
            globalUpdateListeners.forEach(listener => listener(timestamp));
        }
    }
}

/**
 * Hook to subscribe to global last update time
 * Returns the timestamp of the most recently updated JSON file
 */
export function useGlobalLastUpdate() {
    const [lastUpdate, setLastUpdate] = useState<string | null>(globalLastUpdate);

    useEffect(() => {
        const listener = (timestamp: string) => setLastUpdate(timestamp);
        globalUpdateListeners.add(listener);
        return () => { globalUpdateListeners.delete(listener); };
    }, []);

    return lastUpdate;
}

/**
 * Hook for Quotes data with timestamp-based updates
 */
export function useQuotesData() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentTimestamp = useRef<string | null>(null);

    const fetchQuotes = useCallback(async () => {
        try {
            // Add cache-busting parameter to prevent browser caching
            const response = await fetch(`/data/quotes.json?t=${Date.now()}`);
            if (!response.ok) throw new Error("Failed to fetch quotes");

            const data = await response.json();

            // Only update if timestamp is newer
            if (data.lastUpdate && data.lastUpdate !== currentTimestamp.current) {
                currentTimestamp.current = data.lastUpdate;
                setQuotes(data.quotes);
                setError(null);
                notifyGlobalUpdate(data.lastUpdate);
                console.log(`📊 Cotações atualizadas: ${data.lastUpdate}`);
            }
        } catch (err) {
            console.error("Error fetching quotes:", err);
            setError("Erro ao carregar cotações");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuotes();
        // Poll every 60 seconds to check for updates
        const interval = setInterval(fetchQuotes, 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchQuotes]);

    return { quotes, loading, error };
}

/**
 * Hook for Weather data with timestamp-based updates
 */
export function useWeatherData() {
    const [weather, setWeather] = useState<WeatherData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentTimestamp = useRef<string | null>(null);

    const fetchWeather = useCallback(async () => {
        try {
            // Add cache-busting parameter to prevent browser caching
            const response = await fetch(`/data/weather.json?t=${Date.now()}`);
            if (!response.ok) throw new Error("Failed to fetch weather");

            const data = await response.json();

            // Only update if timestamp is newer
            if (data.lastUpdate && data.lastUpdate !== currentTimestamp.current) {
                currentTimestamp.current = data.lastUpdate;
                setWeather(data.weather);
                setError(null);
                notifyGlobalUpdate(data.lastUpdate);
                console.log(`🌤️ Clima atualizado: ${data.lastUpdate}`);
            }
        } catch (err) {
            console.error("Error fetching weather:", err);
            setError("Erro ao carregar clima");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeather();
        // Poll every 60 seconds to check for updates
        const interval = setInterval(fetchWeather, 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchWeather]);

    return { weather, loading, error };
}

/**
 * Hook for News data with timestamp-based updates
 */
export function useNewsData() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [sources, setSources] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentTimestamp = useRef<string | null>(null);

    const fetchNews = useCallback(async () => {
        try {
            // Add cache-busting parameter to prevent browser caching
            const response = await fetch(`/data/news.json?t=${Date.now()}`);
            if (!response.ok) throw new Error("Failed to fetch news");

            const data = await response.json();

            // Only update if timestamp is newer
            if (data.lastUpdate && data.lastUpdate !== currentTimestamp.current) {
                currentTimestamp.current = data.lastUpdate;
                setCategories(data.categories);
                setSources(data.sources || {});
                setError(null);
                notifyGlobalUpdate(data.lastUpdate);
                console.log(`📰 Notícias atualizadas: ${data.lastUpdate}`);
            }
        } catch (err) {
            console.error("Error fetching news:", err);
            setError("Erro ao carregar notícias");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
        // Poll every 60 seconds to check for updates
        const interval = setInterval(fetchNews, 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchNews]);

    return { categories, sources, loading, error };
}

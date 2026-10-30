import { useEffect, useRef, useState } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { SUGGESTED_CITIES, toUF, type CityOption } from "@/data/brazilCities";

const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";

interface CityPickerProps {
  onSelect: (city: CityOption) => void;
  autoFocus?: boolean;
}

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  admin1?: string;
  feature_code?: string;
}

/**
 * Picklist pesquisável de cidades brasileiras.
 * Sem texto digitado, exibe cidades sugeridas; com 2+ caracteres,
 * pesquisa na API de geocodificação do Open-Meteo (restrita ao Brasil).
 */
const CityPicker = ({ onSelect, autoFocus }: CityPickerProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<CityOption[]>(SUGGESTED_CITIES);
  const [searching, setSearching] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Pesquisa com debounce
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      if (term.length === 0) {
        setResults(SUGGESTED_CITIES);
      } else {
        const norm = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        setResults(
          SUGGESTED_CITIES.filter((c) =>
            c.city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(norm)
          )
        );
      }
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          name: term,
          count: "20",
          language: "pt",
          format: "json",
          countryCode: "BR",
        });
        const res = await fetch(`${GEOCODING_API}?${params}`, { signal: controller.signal });
        const data = await res.json();
        const seen = new Set<string>();
        const list: CityOption[] = ((data.results as GeocodingResult[]) || [])
          .filter((r) => !r.country_code || r.country_code === "BR")
          .map((r) => ({ city: r.name, state: toUF(r.admin1), lat: r.latitude, lon: r.longitude }))
          .filter((c) => {
            const key = `${c.city}|${c.state}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        setResults(list);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => setHighlight(0), [results]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const choose = (city: CityOption) => {
    setOpen(false);
    setQuery("");
    onSelect(city);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && results[highlight]) choose(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="city-picker-list"
          aria-label="Escolha uma cidade"
          placeholder="Buscar cidade..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full rounded-md border border-border/60 bg-background/60 pl-7 pr-7 py-1.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-agro-gold/60"
        />
        {searching && (
          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && (
        <ul
          id="city-picker-list"
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-md border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl"
        >
          {query.trim().length < 2 && (
            <li className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Sugestões • Região Cooxupé
            </li>
          )}
          {results.length === 0 && !searching && (
            <li className="px-3 py-2 text-xs text-muted-foreground">Nenhuma cidade encontrada</li>
          )}
          {results.map((c, i) => (
            <li
              key={`${c.city}-${c.state}-${c.lat}`}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(c)}
              onMouseEnter={() => setHighlight(i)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm cursor-pointer ${
                i === highlight ? "bg-agro-gold/15 text-agro-gold" : "text-foreground"
              }`}
            >
              <MapPin className="w-3 h-3 flex-shrink-0 opacity-70" />
              <span className="truncate">
                {c.city}
                {c.state && <span className="text-muted-foreground">/{c.state}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityPicker;


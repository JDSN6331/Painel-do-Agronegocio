import { useState } from "react";
import { Cloud, Droplets, Thermometer, CloudRain, Sun, CloudSun, CloudFog, CloudDrizzle, CloudLightning, Snowflake, MapPin, LocateFixed, Pencil, X, Loader2 } from "lucide-react";
import { useWeatherData, type WeatherData } from "@/hooks/useDataUpdates";
import { useLocalWeather } from "@/hooks/useLocalWeather";
import CityPicker from "@/components/CityPicker";

// Map icon names to Lucide components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'sun': Sun,
  'cloud-sun': CloudSun,
  'cloud': Cloud,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'cloud-rain': CloudRain,
  'cloud-lightning': CloudLightning,
  'snowflake': Snowflake
};

const getConditionIcon = (iconName?: string) => {
  const IconComponent = iconMap[iconName || 'cloud'] || Cloud;
  return <IconComponent className="w-8 h-8 text-agro-gold-light" />;
};

const formatCity = (item: { city: string; state?: string }) =>
  item.state ? `${item.city}/${item.state}` : item.city;

/** Normaliza cidade/UF para comparação (ignora acentos e maiúsculas) */
const cityKey = (item: { city: string; state?: string }) =>
  `${item.city}|${item.state ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/** Conteúdo padrão de um card de clima (dados + condição) */
const WeatherCardBody = ({ item, title }: { item: WeatherData; title?: React.ReactNode }) => (
  <>
    {/* Left side - existing data */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        {title ?? (
          <span className="font-semibold text-sm sm:text-base text-foreground">
            {formatCity(item)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
        <div className="flex flex-col items-center">
          <Thermometer className="w-3 h-3 sm:w-4 sm:h-4 text-agro-gold-light mb-0.5 sm:mb-1" />
          <span className="text-xs sm:text-sm font-bold text-foreground">{item.temperature}°C</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground">Temp.</span>
        </div>
        <div className="flex flex-col items-center">
          <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mb-0.5 sm:mb-1" />
          <span className="text-xs sm:text-sm font-bold text-foreground">{item.humidity}%</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground">Umidade</span>
        </div>
        <div className="flex flex-col items-center">
          <CloudRain className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300 mb-0.5 sm:mb-1" />
          <span className="text-xs sm:text-sm font-bold text-foreground">{item.rainProbability}%</span>
          <span className="text-[10px] sm:text-xs text-muted-foreground">Chuva</span>
        </div>
      </div>
    </div>

    {/* Right side - weather condition */}
    <div className="flex flex-col items-center justify-center ml-2 sm:ml-3 pl-2 sm:pl-3 border-l border-border/50 min-w-[60px] sm:min-w-[80px]">
      {getConditionIcon(item.conditionIcon)}
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 text-center">
        {item.condition || 'Carregando...'}
      </span>
    </div>
  </>
);

/**
 * Card com o clima da localização do usuário.
 * Se a localização não for autorizada, exibe uma picklist de cidades.
 */
const LocalWeatherCard = ({ local }: { local: ReturnType<typeof useLocalWeather> }) => {
  const { location, weather, status, message, requestGeolocation, selectCity } = local;
  const [editing, setEditing] = useState(false);

  const showPicker = editing || status === "needs-city";

  const retry = () => {
    if (!location || location.source === "geo") requestGeolocation();
    else selectCity({ city: location.city, state: location.state, lat: location.lat, lon: location.lon });
  };

  // Modo de escolha de cidade (sem overflow-hidden para a lista não ser cortada)
  if (showPicker) {
    return (
      <div className="relative z-20 flex flex-col gap-2 p-2 sm:p-3 rounded-lg border border-agro-gold/40 backdrop-blur-lg bg-[hsl(var(--glass-bg))]">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-sm sm:text-base text-foreground">
            <MapPin className="w-4 h-4 text-agro-gold" />
            Escolha sua cidade
          </span>
          {editing && status !== "needs-city" && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="p-1 rounded text-muted-foreground hover:text-agro-gold"
              aria-label="Cancelar"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {message && status === "needs-city" && (
          <p className="text-[10px] sm:text-xs text-muted-foreground">{message}</p>
        )}
        <CityPicker
          autoFocus={editing}
          onSelect={(city) => {
            selectCity(city);
            setEditing(false);
          }}
        />
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            requestGeolocation();
          }}
          className="self-start flex items-center gap-1 text-[10px] sm:text-xs text-agro-gold hover:underline"
        >
          <LocateFixed className="w-3 h-3" />
          Usar minha localização
        </button>
      </div>
    );
  }

  if (status === "locating" || status === "loading" || !weather) {
    return (
      <div className="glass-card weather-card flex flex-col items-center justify-center gap-2 p-2 sm:p-3 rounded-lg min-h-[96px]">
        <Loader2 className="w-5 h-5 text-agro-gold animate-spin" />
        <span className="text-xs text-muted-foreground text-center">
          {status === "locating" ? "Obtendo sua localização..." : "Carregando clima..."}
        </span>
        {status === "locating" && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="relative z-10 text-[10px] sm:text-xs text-agro-gold hover:underline"
          >
            Escolher cidade manualmente
          </button>
        )}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="glass-card weather-card flex flex-col items-center justify-center gap-2 p-2 sm:p-3 rounded-lg min-h-[96px]">
        <span className="text-xs text-red-400 text-center">{message}</span>
        <div className="relative z-10 flex gap-3">
          <button
            type="button"
            onClick={retry}
            className="text-[10px] sm:text-xs text-agro-gold hover:underline"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-[10px] sm:text-xs text-agro-gold hover:underline"
          >
            Trocar cidade
          </button>
        </div>
      </div>
    );
  }

  const isGeo = location?.source === "geo";

  return (
    <div className="glass-card weather-card flex p-2 sm:p-3 rounded-lg transition-all duration-300 border-agro-gold/40">
      <WeatherCardBody
        item={weather}
        title={
          <div className="flex items-center justify-between gap-1 w-full min-w-0">
            <span
              className="flex items-center gap-1 font-semibold text-sm sm:text-base text-foreground min-w-0"
              title={isGeo ? "Sua localização" : "Cidade escolhida"}
            >
              {isGeo ? (
                <LocateFixed className="w-3.5 h-3.5 text-agro-gold flex-shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-agro-gold flex-shrink-0" />
              )}
              <span className="truncate">{formatCity(weather)}</span>
            </span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="relative z-10 p-1 rounded text-muted-foreground hover:text-agro-gold flex-shrink-0"
              aria-label="Trocar cidade"
              title="Trocar cidade"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      />
    </div>
  );
};

const WeatherPanel = () => {
  const { weather, loading, error } = useWeatherData();
  const local = useLocalWeather();

  // Se a cidade do usuário já for uma das cidades fixas, oculta o card fixo
  // repetido (o card de localização permanece, com a opção de trocar cidade).
  const localKey = local.location ? cityKey(local.location) : null;
  const fixedCities = localKey ? weather.filter((item) => cityKey(item) !== localKey) : weather;

  return (
    // relative + z-30: mantém a picklist acima das seções seguintes (abaixo do header z-50)
    <div className="glass-panel relative z-30 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold font-heading text-agro-gold flex items-center gap-2">
          <Cloud className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          Clima
        </h2>
        <span className="text-[10px] sm:text-xs text-muted-foreground">
          <span className="font-semibold">Fonte:</span> Open-Meteo
        </span>
      </div>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 ${
          !loading && !error && fixedCities.length === 2 ? "lg:grid-cols-3" : "lg:grid-cols-4"
        }`}
      >
        {/* Localização do usuário (ou cidade escolhida) */}
        <LocalWeatherCard local={local} />

        {loading && (
          <div className="flex items-center justify-center py-8 md:col-span-1 lg:col-span-3">
            <div className="animate-pulse text-muted-foreground">Carregando clima...</div>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center py-8 md:col-span-1 lg:col-span-3">
            <div className="text-red-400">{error}</div>
          </div>
        )}

        {!loading && !error && fixedCities.map((item) => (
          <div
            key={item.city}
            className="glass-card weather-card flex p-2 sm:p-3 rounded-lg transition-all duration-300 cursor-pointer"
          >
            <WeatherCardBody item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherPanel;

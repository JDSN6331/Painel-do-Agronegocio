import { Cloud, Droplets, Thermometer, CloudRain, Sun, CloudSun, CloudFog, CloudDrizzle, CloudLightning, Snowflake } from "lucide-react";
import { useWeatherData } from "@/hooks/useDataUpdates";

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

const WeatherPanel = () => {
  const { weather, loading, error } = useWeatherData();

  if (loading) {
    return (
      <div className="glass-panel p-4">
        <h2 className="text-lg font-semibold font-heading text-agro-gold mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Clima
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Carregando clima...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-4">
        <h2 className="text-lg font-semibold font-heading text-agro-gold mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Clima
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  const getConditionIcon = (iconName?: string) => {
    const IconComponent = iconMap[iconName || 'cloud'] || Cloud;
    return <IconComponent className="w-8 h-8 text-agro-gold-light" />;
  };

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-heading text-agro-gold flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Clima
        </h2>
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold">Fonte:</span> Open-Meteo
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {weather.map((item) => (
          <div
            key={item.city}
            className="weather-card flex p-3 rounded-lg bg-secondary/50 border border-border/50 transition-all duration-300 cursor-pointer"
          >
            {/* Left side - existing data */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-foreground">
                  {item.city}/{item.state}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center">
                  <Thermometer className="w-4 h-4 text-agro-gold-light mb-1" />
                  <span className="text-sm font-bold text-foreground">{item.temperature}°C</span>
                  <span className="text-xs text-muted-foreground">Temp.</span>
                </div>
                <div className="flex flex-col items-center">
                  <Droplets className="w-4 h-4 text-blue-400 mb-1" />
                  <span className="text-sm font-bold text-foreground">{item.humidity}%</span>
                  <span className="text-xs text-muted-foreground">Umidade</span>
                </div>
                <div className="flex flex-col items-center">
                  <CloudRain className="w-4 h-4 text-blue-300 mb-1" />
                  <span className="text-sm font-bold text-foreground">{item.rainProbability}%</span>
                  <span className="text-xs text-muted-foreground">Chuva</span>
                </div>
              </div>
            </div>

            {/* Right side - weather condition */}
            <div className="flex flex-col items-center justify-center ml-3 pl-3 border-l border-border/50 min-w-[80px]">
              {getConditionIcon(item.conditionIcon)}
              <span className="text-xs text-muted-foreground mt-1 text-center">
                {item.condition || 'Carregando...'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherPanel;

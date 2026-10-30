/**
 * Mapeamento dos códigos WMO (Open-Meteo) para descrição e ícone.
 * Mantido em sincronia com backend/weather.js.
 */
const CONDITIONS: Record<number, { description: string; icon: string }> = {
  0: { description: "Céu limpo", icon: "sun" },
  1: { description: "Principalmente limpo", icon: "sun" },
  2: { description: "Parcialmente nublado", icon: "cloud-sun" },
  3: { description: "Nublado", icon: "cloud" },
  45: { description: "Neblina", icon: "cloud-fog" },
  48: { description: "Neblina com geada", icon: "cloud-fog" },
  51: { description: "Garoa leve", icon: "cloud-drizzle" },
  53: { description: "Garoa moderada", icon: "cloud-drizzle" },
  55: { description: "Garoa intensa", icon: "cloud-drizzle" },
  61: { description: "Chuva leve", icon: "cloud-rain" },
  63: { description: "Chuva moderada", icon: "cloud-rain" },
  65: { description: "Chuva intensa", icon: "cloud-rain" },
  71: { description: "Neve leve", icon: "snowflake" },
  73: { description: "Neve moderada", icon: "snowflake" },
  75: { description: "Neve intensa", icon: "snowflake" },
  80: { description: "Pancadas leves", icon: "cloud-rain" },
  81: { description: "Pancadas moderadas", icon: "cloud-rain" },
  82: { description: "Pancadas intensas", icon: "cloud-rain" },
  95: { description: "Tempestade", icon: "cloud-lightning" },
  96: { description: "Tempestade com granizo", icon: "cloud-lightning" },
  99: { description: "Tempestade forte", icon: "cloud-lightning" },
};

export function getWeatherCondition(code: number) {
  return CONDITIONS[code] || { description: "Desconhecido", icon: "cloud" };
}


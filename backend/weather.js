import axios from 'axios';

// Cities to fetch weather for (latitude, longitude)
const CITIES = [
    { city: 'São Paulo', state: 'SP', lat: -23.5505, lon: -46.6333 },
    { city: 'Guaxupé', state: 'MG', lat: -21.3056, lon: -46.7128 },
    { city: 'São José do Rio Pardo', state: 'SP', lat: -21.5939, lon: -46.8889 },
    { city: 'Patrocínio', state: 'MG', lat: -18.9439, lon: -46.9928 }
];

// Open-Meteo API base URL (free, no API key required)
const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

/**
 * Map WMO weather code to description and icon
 */
function getWeatherCondition(code) {
    const conditions = {
        0: { description: 'Céu limpo', icon: 'sun' },
        1: { description: 'Principalmente limpo', icon: 'sun' },
        2: { description: 'Parcialmente nublado', icon: 'cloud-sun' },
        3: { description: 'Nublado', icon: 'cloud' },
        45: { description: 'Neblina', icon: 'cloud-fog' },
        48: { description: 'Neblina com geada', icon: 'cloud-fog' },
        51: { description: 'Garoa leve', icon: 'cloud-drizzle' },
        53: { description: 'Garoa moderada', icon: 'cloud-drizzle' },
        55: { description: 'Garoa intensa', icon: 'cloud-drizzle' },
        61: { description: 'Chuva leve', icon: 'cloud-rain' },
        63: { description: 'Chuva moderada', icon: 'cloud-rain' },
        65: { description: 'Chuva intensa', icon: 'cloud-rain' },
        71: { description: 'Neve leve', icon: 'snowflake' },
        73: { description: 'Neve moderada', icon: 'snowflake' },
        75: { description: 'Neve intensa', icon: 'snowflake' },
        80: { description: 'Pancadas leves', icon: 'cloud-rain' },
        81: { description: 'Pancadas moderadas', icon: 'cloud-rain' },
        82: { description: 'Pancadas intensas', icon: 'cloud-rain' },
        95: { description: 'Tempestade', icon: 'cloud-lightning' },
        96: { description: 'Tempestade com granizo', icon: 'cloud-lightning' },
        99: { description: 'Tempestade forte', icon: 'cloud-lightning' }
    };

    return conditions[code] || { description: 'Desconhecido', icon: 'cloud' };
}
/**
 * Fetch weather data for all configured cities
 */
export async function collectWeather() {
    console.log('\n🌤️ Starting weather collection...');
    console.log('━'.repeat(50));

    const weatherData = [];

    for (const location of CITIES) {
        const MAX_RETRIES = 3;
        const TIMEOUTS = [10000, 15000, 20000]; // Progressive timeouts

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const timeout = TIMEOUTS[attempt - 1] || TIMEOUTS[TIMEOUTS.length - 1];

            try {
                if (attempt === 1) {
                    console.log(`  Fetching weather for ${location.city}/${location.state}...`);
                } else {
                    console.log(`    🔄 Retry attempt ${attempt}/${MAX_RETRIES} (timeout: ${timeout / 1000}s)...`);
                }

                const response = await axios.get(OPEN_METEO_API, {
                    params: {
                        latitude: location.lat,
                        longitude: location.lon,
                        current: 'temperature_2m,relative_humidity_2m,weather_code',
                        daily: 'precipitation_probability_max',
                        timezone: 'America/Sao_Paulo',
                        forecast_days: 1
                    },
                    timeout
                });

                const data = response.data;

                if (!data.current) {
                    console.log(`    ⚠️ No data for ${location.city}`);
                    break; // No point retrying if no data
                }

                const temperature = Math.round(data.current.temperature_2m);
                const humidity = Math.round(data.current.relative_humidity_2m);
                const rainProbability = data.daily?.precipitation_probability_max?.[0] || 0;
                const weatherCode = data.current.weather_code || 0;
                const condition = getWeatherCondition(weatherCode);

                console.log(`    ✅ ${location.city}: ${temperature}°C, ${humidity}% umidade, ${rainProbability}% chuva, ${condition.description}`);

                weatherData.push({
                    city: location.city,
                    state: location.state,
                    temperature,
                    humidity,
                    rainProbability,
                    weatherCode,
                    condition: condition.description,
                    conditionIcon: condition.icon
                });

                break; // Success, exit retry loop

            } catch (error) {
                if (attempt < MAX_RETRIES) {
                    console.log(`    ⚠️ Attempt ${attempt} failed: ${error.message}`);
                    // Small delay before retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } else {
                    console.error(`    ❌ Error fetching ${location.city} after ${MAX_RETRIES} attempts:`, error.message);
                }
            }
        }
    }

    console.log('━'.repeat(50));
    console.log(`✅ Weather collection complete. ${weatherData.length} cities collected.\n`);

    return {
        lastUpdate: new Date().toISOString(),
        weather: weatherData
    };
}

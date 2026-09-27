export default {
  description: "Show current weather and forecast",

  async execute(args, terminal) {
    if (
      args.includes("help") ||
      args.includes("-h") ||
      args.includes("--help")
    ) {
      terminal.print("");
      terminal.print("Weather - WebTerm weather command");
      terminal.print("");
      terminal.print("USAGE:");
      terminal.print("  weather <city>");
      terminal.print("");
      terminal.print("OPTIONS:");
      terminal.print("  help              Show this help");
      terminal.print("  -h, --help        Show this help");
      terminal.print("  -f, --fahrenheit  Show temperature in °F");
      terminal.print("  -c, --celsius     Show temperature in °C");
      terminal.print("  --days <number>   Forecast 1-7 days");
      terminal.print("");
      terminal.print("EXAMPLES:");
      terminal.print("  weather Delhi");
      terminal.print("  weather Gwalior");
      terminal.print("  weather Mumbai -f");
      terminal.print("  weather Delhi --days 7");
      terminal.print("  weather Raipur -c --days 5");
      terminal.print("");
      terminal.print("DATA:");
      terminal.print("  Current temperature");
      terminal.print("  Feels-like temperature");
      terminal.print("  Humidity");
      terminal.print("  Wind speed");
      terminal.print("  Precipitation");
      terminal.print("  Weather condition");
      terminal.print("  Multi-day forecast");
      terminal.print("");
      terminal.print("Weather data: Open-Meteo");
      terminal.print("");
      return;
    }

    let unit = "celsius";
    let days = 3;
    const cityParts = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === "-f" || arg === "--fahrenheit") {
        unit = "fahrenheit";
        continue;
      }

      if (arg === "-c" || arg === "--celsius") {
        unit = "celsius";
        continue;
      }

      if (arg === "--days") {
        const value = Number(args[++i]);

        if (!Number.isInteger(value) || value < 1 || value > 7) {
          terminal.print("weather: --days must be between 1 and 7");
          return;
        }

        days = value;
        continue;
      }

      cityParts.push(arg);
    }

    if (!cityParts.length) {
      terminal.print("Usage: weather <city>");
      terminal.print("Try: weather help");
      return;
    }

    const city = cityParts.join(" ");

    try {
      terminal.print(`Searching weather for ${city}...`);

      const geoURL =
        "https://geocoding-api.open-meteo.com/v1/search?" +
        new URLSearchParams({
          name: city,
          count: "1",
          language: "en",
          format: "json"
        });

      const geoResponse = await fetch(geoURL);

      if (!geoResponse.ok) {
        throw new Error(`Geocoding HTTP ${geoResponse.status}`);
      }

      const geo = await geoResponse.json();

      if (!geo.results || !geo.results.length) {
        terminal.print(`weather: location not found: ${city}`);
        return;
      }

      const location = geo.results[0];

      const weatherURL =
        "https://api.open-meteo.com/v1/forecast?" +
        new URLSearchParams({
          latitude: String(location.latitude),
          longitude: String(location.longitude),

          current:
            "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",

          daily:
            "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",

          forecast_days: String(days),
          timezone: "auto",
          temperature_unit: unit,
          wind_speed_unit: "kmh",
          precipitation_unit: "mm"
        });

      const weatherResponse = await fetch(weatherURL);

      if (!weatherResponse.ok) {
        throw new Error(`Weather HTTP ${weatherResponse.status}`);
      }

      const weather = await weatherResponse.json();

      const current = weather.current;
      const daily = weather.daily;

      const weatherNames = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snowfall",
        73: "Moderate snowfall",
        75: "Heavy snowfall",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        97: "Heavy thunderstorm",
        99: "Thunderstorm with heavy hail"
      };

      const temperatureUnit =
        unit === "fahrenheit" ? "°F" : "°C";

      const condition =
        weatherNames[current.weather_code] ||
        "Unknown";

      terminal.print("");

      terminal.print("┌────────────────────────────────────┐");

      const title =
        `${location.name}, ${location.country}`;

      terminal.print(
        `│ ${title}`.padEnd(37) + "│"
      );

      terminal.print("├────────────────────────────────────┤");

      terminal.print(
        `│ Condition  : ${condition}`.padEnd(37) +
        "│"
      );

      terminal.print(
        `│ Temperature: ${current.temperature_2m}${temperatureUnit}`.padEnd(37) +
        "│"
      );

      terminal.print(
        `│ Feels like : ${current.apparent_temperature}${temperatureUnit}`.padEnd(37) +
        "│"
      );

      terminal.print(
        `│ Humidity   : ${current.relative_humidity_2m}%`.padEnd(37) +
        "│"
      );

      terminal.print(
        `│ Wind       : ${current.wind_speed_10m} km/h`.padEnd(37) +
        "│"
      );

      terminal.print(
        `│ Precip.    : ${current.precipitation} mm`.padEnd(37) +
        "│"
      );

      terminal.print("├────────────────────────────────────┤");

      terminal.print(
        `│ ${days}-DAY FORECAST`.padEnd(37) + "│"
      );

      for (let i = 0; i < daily.time.length; i++) {
        const date = daily.time[i];

        const code =
          daily.weather_code[i];

        const description =
          weatherNames[code] || "Unknown";

        const max =
          daily.temperature_2m_max[i];

        const min =
          daily.temperature_2m_min[i];

        const rain =
          daily.precipitation_probability_max[i];

        terminal.print(
          `│ ${date} ${min}°/${max}°${temperatureUnit} ${rain}% rain`
            .padEnd(37) + "│"
        );

        terminal.print(
          `│ ${description}`.padEnd(37) + "│"
        );
      }

      terminal.print(
        "└────────────────────────────────────┘"
      );

      terminal.print("");
      terminal.print("Data: Open-Meteo");

    } catch (error) {
      terminal.print(
        `weather: ${error.message || error}`
      );
    }
  }
};

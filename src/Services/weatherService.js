export async function getWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
    `&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await response.json();

  return {
    temperature: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
  };
}

export function getWeatherDescription(code) {
  if (code === 0) {
    return "Clear sky";
  }

  if ([1, 2, 3].includes(code)) {
    return "Cloudy";
  }

  if ([45, 48].includes(code)) {
    return "Foggy";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "Drizzle";
  }

  if ([61, 63, 65, 66, 67].includes(code)) {
    return "Rain";
  }

  if ([71, 73, 75, 77].includes(code)) {
    return "Snow";
  }

  if ([80, 81, 82].includes(code)) {
    return "Rain showers";
  }

  if ([95, 96, 99].includes(code)) {
    return "Thunderstorm";
  }

  return "Unknown";
}

export async function getLocationName(latitude, longitude) {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?lat=${latitude}` +
    `&lon=${longitude}` +
    `&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch location name");
  }

  const data = await response.json();
  const address = data.address || {};

  return {
    name:
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      "Unknown location",

    state: address.state || "",
  };
}
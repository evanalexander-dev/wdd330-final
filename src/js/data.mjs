const RestCountriesUrl = import.meta.env.VITE_REST_COUNTRIES_URL;
const OpenWeatherMapUrl = import.meta.env.VITE_OPENWEATHERMAP_URL;
const OpenWeatherMapKey = import.meta.env.VITE_OPENWEATHERMAP_KEY;

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export async function getAllBasicCountryData() {
  const res = await fetch(`${RestCountriesUrl}/all?fields=name,cca3,capital,region,area,population,flags`);
  const data = await convertToJson(res);
  return data;
}

export async function getCurrentWeather(lat, lon) {
  const res = await fetch(`${OpenWeatherMapUrl}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=imperial&appid=${OpenWeatherMapKey}`);
  const data = await convertToJson(res);
  return data;
}

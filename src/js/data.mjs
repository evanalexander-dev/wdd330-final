const RestCountriesUrl = import.meta.env.VITE_REST_COUNTRIES_URL;
const OpenWeatherMapUrl = import.meta.env.VITE_OPENWEATHERMAP_URL;
const OpenWeatherMapKey = import.meta.env.VITE_OPENWEATHERMAP_KEY;

/**
 * Convert API response to JSON or throw error
 * @param {Response} res Fetch API response
 * @returns {Promise<Object>} Parsed JSON data
 */
function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

/**
 * Fetch all countries with basic data
 * @returns {Promise<Array>} Array of country objects with basic info
 */
export async function getAllBasicCountryData() {
  const res = await fetch(`${RestCountriesUrl}/all?fields=name,cca3,capital,region,area,population,flags`);
  const data = await convertToJson(res);
  return data;
}

/**
 * Fetch detailed data for a specific country by code
 * @param {string} countryCode Alpha-3 country code (cca3)
 * @returns {Promise<Object>} Detailed country data
 */
export async function getCountryByCode(countryCode) {
  const res = await fetch(`${RestCountriesUrl}/alpha/${countryCode}`);
  const data = await convertToJson(res);
  return data[0]; // API returns an array with one item
}

export async function getCurrentWeather(lat, lon) {
  const res = await fetch(`${OpenWeatherMapUrl}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=imperial&appid=${OpenWeatherMapKey}`);
  const data = await convertToJson(res);
  return data;
}

import { loadHeaderFooter, setupThemeToggle, qs, createCountryDetailHTML, createErrorHTML } from "./utils.mjs";
import { getCountryByCode, getCurrentWeather } from "./data.mjs";
import { setupFavoritesButton } from "./favorites.mjs";

// DOM elements
const mainElement = qs("main");

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  // Load header and footer
  await loadHeaderFooter();

  // Setup theme toggler
  setupThemeToggle();

  // Get country code from URL
  const urlParams = new URLSearchParams(window.location.search);
  const countryCode = urlParams.get("code");

  if (!countryCode) {
    mainElement.innerHTML = createErrorHTML("No country code provided. Please go back and select a country.");
    return;
  }

  // Load country details
  await loadCountryDetails(countryCode);
});

/**
 * Load country details and render page
 * @param {string} countryCode Alpha-3 country code (cca3)
 */
async function loadCountryDetails(countryCode) {
  try {
    // Show loading state
    mainElement.innerHTML = `
      <div class="loading">
        <p>Loading country details...</p>
      </div>
    `;

    // Fetch country details
    const country = await getCountryByCode(countryCode);
    
    // Get weather for capital city if available
    let weatherData = null;
    if (country.capitalInfo && country.capitalInfo.latlng) {
      const [lat, lon] = country.capitalInfo.latlng;
      try {
        weatherData = await getCurrentWeather(lat, lon);
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      }
    }
    
    // Render country details
    mainElement.innerHTML = createCountryDetailHTML(country, weatherData);
    setupFavoritesButton(country);
    
    // Update page title
    document.title = `${country.name.common} | Global Explorer`;
    
  } catch (error) {
    console.error("Error loading country details:", error);
    mainElement.innerHTML = createErrorHTML("Failed to load country details. Please try again later.");
  }
}
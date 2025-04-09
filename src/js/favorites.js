import { loadHeaderFooter, renderCountryCards, qs } from "./utils.mjs";
import { getFavorites } from "./favorites.mjs";
import { getAllBasicCountryData } from "./data.mjs";

// Global variables
let allCountries = [];
const countriesContainer = qs(".countries-grid") || document.createElement('div');

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  // Load header and footer
  await loadHeaderFooter();

  // Create a main element if it doesn't exist
  if (!qs("main")) {
    const main = document.createElement('main');
    document.body.insertBefore(main, document.getElementById('main-footer'));
  }

  // Create and add the container for countries if not present
  if (!countriesContainer.classList.contains('countries-grid')) {
    countriesContainer.className = 'countries-grid';
    const main = qs("main");
    
    // Add heading and container to main
    main.innerHTML = `
      <h1>My Favorite Countries</h1>
      <p id="favorites-count"></p>
    `;
    main.appendChild(countriesContainer);
  }

  // Load countries data
  await loadCountriesData();

  // Listen for changes to favorites
  window.addEventListener('favorites-changed', async () => {
    await displayFavorites();
  });
});

/**
 * Load countries data from API
 */
async function loadCountriesData() {
  try {
    countriesContainer.innerHTML = `
      <div class="loading">
        <p>Loading countries...</p>
      </div>
    `;

    // Fetch all countries
    allCountries = await getAllBasicCountryData();

    // Display favorite countries
    await displayFavorites();
  } catch (error) {
    console.error("Error loading countries:", error);
    countriesContainer.innerHTML = `
      <div class="error">
        <p>❗ Failed to load countries. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Display favorite countries
 */
async function displayFavorites() {
  // Get favorite country codes
  const favoriteIds = getFavorites();
  const countElement = qs("#favorites-count");
  
  if (countElement) {
    countElement.textContent = `You have ${favoriteIds.length} favorite ${favoriteIds.length === 1 ? 'country' : 'countries'}.`;
  }

  if (favoriteIds.length === 0) {
    countriesContainer.innerHTML = `
      <div class="no-favorites">
        <p>You haven't added any favorite countries yet.</p>
        <p>Go to the <a href="/">home page</a> to explore countries and add favorites!</p>
      </div>
    `;
    return;
  }

  // Filter countries to only include favorites
  const favoriteCountries = allCountries.filter(
    country => favoriteIds.includes(country.cca3)
  );

  // Render favorite countries
  renderCountryCards(favoriteCountries, countriesContainer);
}
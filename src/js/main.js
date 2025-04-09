import { qs, loadHeaderFooter, setupThemeToggle, renderCountryCards, createErrorHTML } from "./utils.mjs";
import { initSearchFilters } from "./search.mjs";
import { getAllBasicCountryData } from "./data.mjs";

// Global variables
let allCountries = [];
let filteredCountries = [];
const countriesContainer = qs(".countries-grid");
const resultsCountElement = qs("#results-count");

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  // Load header and footer
  await loadHeaderFooter();

  // Setup theme toggler
  setupThemeToggle();

  // Initialize search and filters
  initSearchFilters(applyFilters, applyFilters);

  // Load countries data
  await loadCountriesData();
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

    // Apply initial filters (from URL params)
    applyFilters();
  } catch (error) {
    console.error("Error loading countries:", error);
    countriesContainer.innerHTML = createErrorHTML("Failed to load countries. Please try again later.");
  }
}

/**
 * Apply filters to countries data
 */
function applyFilters() {
  // Get current filters
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search") || "";
  const regionsParam = urlParams.get("regions");
  const regions = regionsParam ? regionsParam.split(",") : [];
  const population = urlParams.get("population") || "any";
  const sort = urlParams.get("sort") || "name";

  // Filter countries
  filteredCountries = allCountries.filter((country) => {
    // Filter by search query
    if (
      searchQuery &&
      !country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by region
    if (regions.length > 0 && !regions.includes(country.region.toLowerCase())) {
      return false;
    }

    // Filter by population
    if (population !== "any") {
      const pop = country.population;
      if (population === "small" && pop >= 1000000) {
        return false;
      } else if (
        population === "medium" &&
        (pop < 1000000 || pop > 100000000)
      ) {
        return false;
      } else if (population === "large" && pop <= 100000000) {
        return false;
      }
    }

    return true;
  });

  // Sort countries
  filteredCountries.sort((a, b) => {
    if (sort === "name") {
      return a.name.common.localeCompare(b.name.common);
    } else if (sort === "name-desc") {
      return b.name.common.localeCompare(a.name.common);
    } else if (sort === "population") {
      return a.population - b.population;
    } else if (sort === "population-desc") {
      return b.population - a.population;
    }
    return 0;
  });

  // Update results count
  updateResultsCount();

  // Render filtered countries
  renderCountryCards(filteredCountries, countriesContainer);
}

/**
 * Update the results count text
 */
function updateResultsCount() {
  const count = filteredCountries.length;
  const totalCount = allCountries.length;

  if (count === totalCount) {
    resultsCountElement.textContent = `Showing all ${count} countries`;
  } else {
    resultsCountElement.textContent = `Showing ${count} of ${totalCount} countries`;
  }
}

window.addEventListener('favorites-changed', () => {
  renderCountryCards(filteredCountries, countriesContainer);
})

import { loadHeaderFooter, setupThemeToggle, qs, createErrorHTML, createCompareUI, createSelectedCountryHTML, createComparisonTableHTML, populateCountryDropdown } from "./utils.mjs";
import { getAllBasicCountryData, getCountryByCode } from "./data.mjs";

// Global variables
let allCountries = [];
let selectedCountries = [null, null];
const compareContainer = qs("main");

// Initialize page
document.addEventListener("DOMContentLoaded", async () => {
  // Load header and footer
  await loadHeaderFooter();

  // Setup theme toggler
  setupThemeToggle();

  // Load the compare page content
  await initializePage();
});

/**
 * Initialize the compare page
 */
async function initializePage() {
  try {
    // Show loading state
    compareContainer.innerHTML = `
    <div class="loading">
        <p>Loading countries data...</p>
    </div>
    `;

    // Fetch all countries
    allCountries = await getAllBasicCountryData();

    // Sort countries alphabetically
    allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));

    // Render the comparison UI
    compareContainer.innerHTML = createCompareUI();

    // Initialize the country selectors
    initializeCountrySelectors();

  } catch (error) {
    console.error("Error initializing compare page:", error);
    compareContainer.innerHTML = createErrorHTML("Failed to load countries data. Please try again later.");
  }
}

/**
 * Initialize the country dropdown selectors with search capability
 */
function initializeCountrySelectors() {
  setupCountrySelector(1);
  setupCountrySelector(2);
}

/**
 * Set up a country selector with dropdown and search
 * @param {number} selectorIndex The index of the selector (1 or 2)
 */
function setupCountrySelector(selectorIndex) {
  const searchInput = qs(`#country-search-${selectorIndex}`);
  const dropdown = qs(`#dropdown-${selectorIndex}`);

  // Populate dropdown initially
  populateCountryDropdown(dropdown, allCountries, selectorIndex, handleCountrySelect);

  // Add search functionality
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredCountries = allCountries.filter(country =>
      country.name.common.toLowerCase().includes(searchTerm)
    );
    populateCountryDropdown(dropdown, filteredCountries, selectorIndex, handleCountrySelect);
  });

  // Show dropdown when focusing on search input
  searchInput.addEventListener('focus', () => {
    dropdown.style.display = 'block';
  });

  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

/**
 * Handle country selection from dropdown
 * @param {string} countryCode The selected country code 
 * @param {number} selectorIndex The selector index (1 or 2)
 */
async function handleCountrySelect(countryCode, selectorIndex) {
  // Update global selectedCountries array
  selectedCountries[selectorIndex - 1] = countryCode;

  // Update the selected country display
  await updateSelectedCountry(selectorIndex, countryCode);

  // Update comparison if both countries are selected
  if (selectedCountries[0] && selectedCountries[1]) {
    updateComparison();
  }

  // Hide dropdown
  qs(`#dropdown-${selectorIndex}`).style.display = 'none';

  // Clear search input
  qs(`#country-search-${selectorIndex}`).value = '';
}

/**
 * Update the selected country display
 * @param {number} selectorIndex The index of the selector (1 or 2)
 * @param {string} countryCode The country code
 */
async function updateSelectedCountry(selectorIndex, countryCode) {
  try {
    const countryDisplay = qs(`#country-card-${selectorIndex}`);

    // Show loading state
    countryDisplay.innerHTML = `<div class="loading">Loading...</div>`;

    // Fetch detailed country data
    const country = await getCountryByCode(countryCode);

    // Display country info
    countryDisplay.innerHTML = createSelectedCountryHTML(country);
  } catch (error) {
    console.error(`Error loading country data for selector ${selectorIndex}:`, error);

    const countryDisplay = qs(`#country-card-${selectorIndex}`);
    countryDisplay.innerHTML = createErrorHTML("Failed to load country data. Please try again.");
  }
}

/**
 * Update the comparison table with data from both selected countries
 */
async function updateComparison() {
  try {
    const comparisonContainer = qs('#comparison-table');

    // Show loading state
    comparisonContainer.innerHTML = `<div class="loading">Loading comparison data...</div>`;

    // Fetch detailed data for both countries
    const country1 = await getCountryByCode(selectedCountries[0]);
    const country2 = await getCountryByCode(selectedCountries[1]);

    // Create comparison table
    comparisonContainer.innerHTML = createComparisonTableHTML(country1, country2);
  } catch (error) {
    console.error("Error updating comparison:", error);

    const comparisonContainer = qs('#comparison-table');
    comparisonContainer.innerHTML = createErrorHTML("Failed to load comparison data. Please try again.");
  }
}
import { isFavorite, toggleFavorite } from "./favorites.mjs";

/**
 * Helper function to query select an element
 * @param {string} selector CSS selector string
 * @param {HTMLElement} parent Parent element to query within (defaults to document)
 * @returns {HTMLElement} The selected DOM element
 */
export const qs = (selector, parent = document) => parent.querySelector(selector);

/**
 * Helper function to query select all elements
 * @param {string} selector CSS selector string 
 * @param {HTMLElement} parent Parent element to query within (defaults to document)
 * @returns {NodeList} NodeList of selected elements
 */
export const qsAll = (selector, parent = document) => parent.querySelectorAll(selector);

/**
 * Renders content into a DOM element using a template
 * @param {string} template HTML string to render
 * @param {HTMLElement} parentElement Container where template will be rendered
 * @param {any} data Data to be used in the callback function
 * @param {Function} callback Optional function to call after rendering
 */
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) callback(data);
}

/**
 * Fetches and loads an HTML template from a file
 * @param {string} path Path to the template file
 * @returns {Promise<string>} HTML template as a string
 */
export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

/**
 * Sets up the mobile menu toggle functionality
 * Handles click events to toggle menu visibility
 */
function setupMobileMenu() {
  const menuToggle = qs('.mobile-menu-toggle');
  const navList = qs('.nav-list');

  menuToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });
}

/**
 * Loads and renders the header and footer templates
 * Sets up mobile menu after templates are loaded
 */
export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate("../partials/header.html");
  renderWithTemplate(headerTemplate, qs("#main-header"));

  const footerTemplate = await loadTemplate("../partials/footer.html");
  renderWithTemplate(footerTemplate, qs("#main-footer"));

  setupMobileMenu();
}

/**
 * Creates a country card DOM element
 * @param {Object} country The country data object
 * @returns {HTMLElement} The card DOM element
 */
export function createCountryCard(country, isFavorite = false) {
  const card = document.createElement('div');
  card.className = 'country-card';

  // Create the star icon for favorites
  const favoriteButton = document.createElement('button');
  favoriteButton.className = `favorite-button ${isFavorite ? 'active' : ''}`;
  favoriteButton.setAttribute('aria-label', isFavorite ? 'Remove from favorites' : 'Add to favorites');
  favoriteButton.innerHTML = isFavorite ? '★' : '☆';

  // Prevent the favorite button click from navigating to the detail page
  favoriteButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(country.cca3);
    // Update the button appearance
    const isNowFavorite = favoriteButton.classList.toggle('active');
    favoriteButton.innerHTML = isNowFavorite ? '★' : '☆';
    favoriteButton.setAttribute('aria-label', isNowFavorite ? 'Remove from favorites' : 'Add to favorites');
  });

  card.onclick = () => window.location.href=`/detail/?code=${country.cca3}`;

  const formattedPopulation = country.population.toLocaleString();
  const formattedArea = country.area.toLocaleString();
  
  card.innerHTML = `
    <div class="country-flag-container">
      <img src="${country.flags.png}" alt="${country.flags.alt}" class="country-flag">
    </div>
    <div class="country-info">
      <h3 class="country-name">${country.name.common}</h3>
      <div class="country-details">
        <div class="country-detail">
          <span>Capital${country.capital.length > 1 ? 's' : ''}: ${country.capital.join(', ') || 'N/A'}</span>
        </div>
        <div class="country-detail">
          <span>Region: ${country.region}</span>
        </div>
        <div class="country-detail">
          <span>Population: ${formattedPopulation}</span>
        </div>
        <div class="country-detail">
          <span>Area: ${formattedArea} km²</span>
        </div>
      </div>
    </div>
  `;

  const flagContainer = qs('.country-flag-container', card);
  flagContainer.appendChild(favoriteButton);
  
  return card;
}

/**
 * Renders a collection of countries as cards into a container element
 * @param {Array} countries Array of country objects
 * @param {HTMLElement} container The container to render cards into
 */
export async function renderCountryCards(countries, container) {
  container.innerHTML = '';

  if (!countries || countries.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = '<p>No countries found.</p>';
    container.appendChild(noResults);
    return;
  }

  countries.forEach(country => {
    const isCountryFavorite = isFavorite(country.cca3);

    const card = createCountryCard(country, isCountryFavorite);
    container.appendChild(card);
  });
}

/**
 * Create HTML for country detail page
 * @param {Object} country Country data object
 * @param {Object} weatherData Weather data (can be null)
 * @returns {string} HTML string for country detail page
 */
export function createCountryDetailHTML(country, weatherData) {
  // Format currencies
  const currencies = country.currencies ? 
    Object.values(country.currencies)
      .map(currency => `${currency.name} (${currency.symbol || ''})`)
      .join(", ") : 
    "N/A";
  
  // Format languages
  const languages = country.languages ? 
    Object.values(country.languages).join(", ") : 
    "N/A";
  
  // Format borders
  const borders = country.borders && country.borders.length > 0 ? 
    `<div class="border-countries">
      <h3>Border Countries:</h3>
      <div class="border-buttons">
        ${country.borders.map(border =>
          `<a href="/detail/?code=${border}" class="border-button">${border}</a>`
        ).join('')}
      </div>
    </div>` : 
    `<div class="border-countries">
      <h3>Border Countries:</h3>
      <p>No bordering countries (island or territory)</p>
    </div>`;
  
  // Create weather section if data available
  const weatherSection = weatherData ? createWeatherHTML(weatherData, country.capital?.[0]) : '';
  
  // Create HTML template
  return `
    <div class="detail-container">
      <div class="back-button-container">
        <button class="back-button" onclick="history.back()">← Back</button>
      </div>
      
      <div class="country-detail-grid">
          <img class="country-flag-large" src="${country.flags.svg}" alt="${country.flags.alt || `Flag of ${country.name.common}`}" />
        
        <div class="country-info-container">
          <h1>${country.name.common}</h1>
          ${country.name.official !== country.name.common ? `<p class="official-name">Official: ${country.name.official}</p>` : ''}
          
          <div class="detail-columns">
            <div class="detail-column">
              <p><strong>Capital:</strong> ${country.capital && country.capital.length > 0 ? country.capital.join(", ") : "N/A"}</p>
              <p><strong>Region:</strong> ${country.region || "N/A"}</p>
              <p><strong>Subregion:</strong> ${country.subregion || "N/A"}</p>
              <p><strong>Population:</strong> ${country.population?.toLocaleString() || "N/A"}</p>
              <p><strong>Area:</strong> ${country.area?.toLocaleString() || "N/A"} km²</p>
            </div>
            
            <div class="detail-column">
              <p><strong>Languages:</strong> ${languages}</p>
              <p><strong>Currencies:</strong> ${currencies}</p>
              <p><strong>Timezone${country.timezones?.length > 1 ? 's' : ''}:</strong> ${country.timezones?.join(", ") || "N/A"}</p>
              <p><strong>Driving Side:</strong> ${country.car?.side?.charAt(0).toUpperCase() + country.car?.side?.slice(1) || "N/A"}</p>
              ${country.unMember ? '<p><strong>UN Member:</strong> Yes</p>' : '<p><strong>UN Member:</strong> No</p>'}
            </div>
          </div>
          
          ${borders}

          <div class="actions-container">
            <button id="add-to-favorites" class="action-button detail-favorite-button">
              Add to Favorites
            </button>
          </div>
        </div>
      </div>
      
      ${weatherSection}
      
      <div class="maps-section">
        <h2>Maps</h2>
        <div class="map-links">
          <a href="${country.maps?.googleMaps || '#'}" target="_blank" rel="noopener noreferrer" class="map-button">
            View on Google Maps
          </a>
          <a href="${country.maps?.openStreetMaps || '#'}" target="_blank" rel="noopener noreferrer" class="map-button">
            View on OpenStreetMap
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Create HTML for weather section
 * @param {Object} weatherData Weather data
 * @param {string} capital Capital city name
 * @returns {string} HTML string for weather section
 */
export function createWeatherHTML(weatherData, capital) {
  if (!weatherData || !weatherData.current) {
    return '';
  }
  
  const current = weatherData.current;
  const daily = weatherData.daily?.slice(0, 5) || [];
  
  // Format current weather
  const temp = Math.round(current.temp);
  const feelsLike = Math.round(current.feels_like);
  const description = current.weather[0]?.description || '';
  const icon = current.weather[0]?.icon || '';
  
  return `
    <div class="weather-section">
      <h2>Weather in ${capital || 'Capital'}</h2>
      
      <div class="current-weather">
        <div class="weather-icon-large">
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
        </div>
        <div class="current-weather-details">
          <div class="current-temp">${temp}°F</div>
          <div class="weather-description">${description}</div>
          <div class="feels-like">Feels like: ${feelsLike}°F</div>
          <div class="weather-metrics">
            <span>Humidity: ${current.humidity}%</span>
            <span>Wind: ${Math.round(current.wind_speed)} mph</span>
          </div>
        </div>
      </div>
      
      ${daily.length > 0 ? `
        <div class="forecast">
          ${daily.map(day => {
            const date = new Date(day.dt * 1000);
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
            const dayTemp = Math.round(day.temp.day);
            const dayIcon = day.weather[0]?.icon || '';
            const dayDesc = day.weather[0]?.description || '';
            
            return `
              <div class="forecast-day">
                <div class="forecast-date">${dayName}</div>
                <div class="forecast-icon">
                  <img src="https://openweathermap.org/img/wn/${dayIcon}.png" alt="${dayDesc}" />
                </div>
                <div class="forecast-temp">${dayTemp}°F</div>
                <div class="forecast-desc">${dayDesc}</div>
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Create HTML for an error message
 * @param {string} message Error message to display
 * @returns {string} HTML string for error message
 */
export function createErrorHTML(message) {
  return `
    <div class="error-container">
      <div class="error-message">
        <p>❗ ${message}</p>
        <button class="back-button" onclick="history.back()">Go Back</button>
      </div>
    </div>
  `;
}

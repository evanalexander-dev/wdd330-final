/**
 * Helper function to query select an element
 * @param {string} selector CSS selector string
 * @param {HTMLElement} parent Parent element to query within (defaults to document)
 * @returns {HTMLElement} The selected DOM element
 */
export const qs = (selector, parent = document) => parent.querySelector(selector);

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
export function createCountryCard(country) {
  const card = document.createElement('div');
  card.className = 'country-card';
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
    const card = createCountryCard(country);
    container.appendChild(card);
  });
}

import { qs, qsAll } from "./utils.mjs";

/**
 * Initialize search and filter functionality
 * @param {Function} onSearch Callback function when search is submitted
 * @param {Function} onFilterChange Callback function when filters change
 */
export function initSearchFilters(onSearch, onFilterChange) {
  // Elements
  const searchForm = document.getElementById('country-search-form');
  const searchInput = document.getElementById('country-search-input');
  const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
  const filtersPanel = document.getElementById('filters-panel');
  const applyFiltersBtn = document.getElementById('apply-filters-btn');
  const clearFiltersBtn = document.getElementById('clear-filters-btn');
  const activeFiltersContainer = document.getElementById('active-filters');

  // Current filter state
  let filters = {
    search: '',
    regions: [],
    population: 'any',
    sort: 'name'
  };

  // Initialize from URL parameters (if any)
  initFromUrlParams();

  // Set up event listeners
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }

  if (toggleFiltersBtn && filtersPanel) {
    toggleFiltersBtn.addEventListener('click', () => filtersPanel.classList.toggle('visible'));

    // Close filters panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggleFiltersBtn.contains(e.target) &&
        !filtersPanel.contains(e.target) &&
        filtersPanel.classList.contains('visible')) {
        filtersPanel.classList.remove('visible');
      }
    });
  }

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
  }

  // Update UI based on initial state
  updateActiveFiltersDisplay();

  /**
   * Initialize filter state from URL parameters
   */
  function initFromUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // Get search query
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
      filters.search = searchQuery;
      if (searchInput) {
        searchInput.value = searchQuery;
      }
    }

    // Get regions
    const regionsParam = urlParams.get('regions');
    if (regionsParam) {
      filters.regions = regionsParam.split(',');

      // Update checkboxes
      filters.regions.forEach(region => {
        const checkbox = qs(`input[name="region"][value="${region}"]`);
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }

    // Get population filter
    const populationParam = urlParams.get('population');
    if (populationParam) {
      filters.population = populationParam;

      // Update radio button
      const populationRadio = qs(`input[name="population"][value="${populationParam}"]`);
      if (populationRadio) {
        populationRadio.checked = true;
      }
    }

    // Get sort option
    const sortParam = urlParams.get('sort');
    if (sortParam) {
      filters.sort = sortParam;

      // Update radio button
      const sortRadio = qs(`input[name="sort"][value="${sortParam}"]`);
      if (sortRadio) {
        sortRadio.checked = true;
      }
    }

    // Apply initial filters
    onFilterChange();
  }

  /**
   * Handle search form submission
   * @param {Event} e Form submit event
   */
  function handleSearch(e) {
    e.preventDefault();

    const query = searchInput.value.trim();
    filters.search = query;

    updateActiveFiltersDisplay();
    updateUrlParams();

    onSearch();
  }

  /**
   * Apply selected filters
   */
  function applyFilters() {
    // Get selected regions
    const regionCheckboxes = qsAll('input[name="region"]:checked');
    filters.regions = Array.from(regionCheckboxes).map(cb => cb.value);

    // Get selected population filter
    const populationRadio = qs('input[name="population"]:checked');
    filters.population = populationRadio ? populationRadio.value : 'any';

    // Get selected sort option
    const sortRadio = qs('input[name="sort"]:checked');
    filters.sort = sortRadio ? sortRadio.value : 'name';

    // Hide filters panel
    filtersPanel.classList.remove('visible');

    // Update UI and apply filters
    updateActiveFiltersDisplay();
    updateUrlParams();

    onFilterChange();
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    // Uncheck all region checkboxes
    qsAll('input[name="region"]').forEach(cb => {
      cb.checked = false;
    });

    // Reset population to "any"
    const anyPopulationRadio = qs('input[name="population"][value="any"]');
    if (anyPopulationRadio) {
      anyPopulationRadio.checked = true;
    }

    // Reset sort to "name"
    const nameSort = qs('input[name="sort"][value="name"]');
    if (nameSort) {
      nameSort.checked = true;
    }

    // Reset filter state
    filters.regions = [];
    filters.population = 'any';
    filters.sort = 'name';

    // Update UI and apply filters
    updateActiveFiltersDisplay();
    updateUrlParams();

    onFilterChange();
  }

  /**
   * Update active filters display
   */
  function updateActiveFiltersDisplay() {
    if (!activeFiltersContainer) return;

    // Clear current active filters
    activeFiltersContainer.innerHTML = '';

    // Add search filter if present
    if (filters.search) {
      addActiveFilterTag('Search', filters.search, () => {
        filters.search = '';
        if (searchInput) {
          searchInput.value = '';
        }
        updateActiveFiltersDisplay();
        updateUrlParams();

        onSearch();
      });
    }

    // Add region filters
    filters.regions.forEach(region => {
      const displayRegion = region.charAt(0).toUpperCase() + region.slice(1);
      addActiveFilterTag('Region', displayRegion, () => {
        // Remove region from filters
        filters.regions = filters.regions.filter(r => r !== region);

        // Uncheck the corresponding checkbox
        const checkbox = qs(`input[name="region"][value="${region}"]`);
        if (checkbox) {
          checkbox.checked = false;
        }

        updateActiveFiltersDisplay();
        updateUrlParams();

        onFilterChange();
      }, 'region');
    });

    // Add population filter if not "any"
    if (filters.population !== 'any') {
      let populationText = '';
      switch (filters.population) {
        case 'small':
          populationText = 'Less than 1M';
          break;
        case 'medium':
          populationText = '1M - 100M';
          break;
        case 'large':
          populationText = 'More than 100M';
          break;
      }

      addActiveFilterTag('Population', populationText, () => {
        filters.population = 'any';

        // Check the "any" radio button
        const anyRadio = qs('input[name="population"][value="any"]');
        if (anyRadio) {
          anyRadio.checked = true;
        }

        updateActiveFiltersDisplay();
        updateUrlParams();

        onFilterChange();
      }, 'population');
    }

    // Add sort filter if not default
    if (filters.sort !== 'name') {
      let sortText = '';
      switch (filters.sort) {
        case 'name-desc':
          sortText = 'Name (Z to A)';
          break;
        case 'population':
          sortText = 'Population (low to high)';
          break;
        case 'population-desc':
          sortText = 'Population (high to low)';
          break;
      }

      addActiveFilterTag('Sort', sortText, () => {
        filters.sort = 'name';

        // Check the default sort radio button
        const defaultSortRadio = qs('input[name="sort"][value="name"]');
        if (defaultSortRadio) {
          defaultSortRadio.checked = true;
        }

        updateActiveFiltersDisplay();
        updateUrlParams();

        onFilterChange();
      }, 'sort');
    }
  }

  /**
   * Add an active filter tag to the display
   * @param {string} type The filter type
   * @param {string} value The filter value
   * @param {Function} onRemove Callback when filter is removed
   * @param {string} cssClass Optional CSS class for styling
   */
  function addActiveFilterTag(type, value, onRemove, cssClass = '') {
    const tag = document.createElement('div');
    tag.className = `active-filter-tag ${cssClass}`;
    tag.innerHTML = `
        <span>${type}: ${value}</span>
        <button class="remove-filter" aria-label="Remove filter">
            ❌
        </button>
        `;

    // Add remove event listener
    const removeBtn = tag.querySelector('.remove-filter');
    if (removeBtn && typeof onRemove === 'function') {
      removeBtn.addEventListener('click', onRemove);
    }

    activeFiltersContainer.appendChild(tag);
  }

  /**
   * Update URL parameters with current filters
   */
  function updateUrlParams() {
    const urlParams = new URLSearchParams();

    // Add search parameter if present
    if (filters.search) {
      urlParams.set('search', filters.search);
    }

    // Add regions if selected
    if (filters.regions.length > 0) {
      urlParams.set('regions', filters.regions.join(','));
    }

    // Add population if not default
    if (filters.population !== 'any') {
      urlParams.set('population', filters.population);
    }

    // Add sort if not default
    if (filters.sort !== 'name') {
      urlParams.set('sort', filters.sort);
    }

    // Update URL without reloading the page
    const newUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }
}

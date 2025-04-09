// Initialize favorites from localStorage or create empty array if none exists
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

/**
 * Check if a country is in favorites
 * @param {string} countryCode The country code to check
 * @returns {boolean} True if the country is in favorites
 */
export function isFavorite(countryCode) {
  return favorites.includes(countryCode);
}

/**
 * Toggle a country in/out of favorites
 * @param {string} countryCode The country code to toggle
 * @returns {boolean} True if the country is now a favorite, false if removed
 */
export function toggleFavorite(countryCode) {
  const index = favorites.indexOf(countryCode);
  if (index === -1) {
    // Add to favorites
    favorites.push(countryCode);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    // Publish custom event so other components can update
    window.dispatchEvent(new CustomEvent('favorites-changed', { 
      detail: { added: countryCode } 
    }));
    return true;
  } else {
    // Remove from favorites
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    // Publish custom event so other components can update
    window.dispatchEvent(new CustomEvent('favorites-changed', { 
      detail: { removed: countryCode } 
    }));
    return false;
  }
}

/**
 * Get all favorite country codes
 * @returns {Array} Array of country codes
 */
export function getFavorites() {
  return [...favorites];
}

/**
 * Get count of favorite countries
 * @returns {number} Number of favorites
 */
export function getFavoritesCount() {
  return favorites.length;
}

/**
 * Set up favorites button functionality
 * @param {Object} country Country data
 */
export function setupFavoritesButton(country) {
  const favButton = document.getElementById('add-to-favorites');
  if (!favButton) return;
  
  // Check if already in favorites
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const isAlreadyFavorite = favorites.some(fav => fav === country.cca3);
  
  // Update button text based on favorite status
  if (isAlreadyFavorite) {
    favButton.textContent = 'Remove from Favorites';
    favButton.classList.add('is-favorite');
  }
  
  // Add click event listener
  favButton.addEventListener('click', () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isAlreadyFavorite = favorites.some(fav => fav === country.cca3);
    
    if (isAlreadyFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter(fav => fav !== country.cca3);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      
      favButton.textContent = 'Add to Favorites';
      favButton.classList.remove('is-favorite');
    } else {
      // Add to favorites
      favorites.push(country.cca3);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      
      favButton.textContent = 'Remove from Favorites';
      favButton.classList.add('is-favorite');
    }
  });
}

import { createSearchViewElement, type SearchViewElement, type SearchViewState } from './searchViewElement.js';

const INITIAL_STATE: SearchViewState = {
  openRowIndex: undefined,
  openCharacter: undefined,
  pokemonData: {},
  usedPokemon: [],
  isLoading: false,
  errorMessage: undefined
};

/**
 * Factory function to create search views
 * Now uses Custom Elements for security and performance
 */
export function createSearchView(): SearchViewElement {
  const viewElement = createSearchViewElement();
  
  // Initialize with default state
  viewElement.update(INITIAL_STATE);
  
  return viewElement;
}

// Re-export types for compatibility;

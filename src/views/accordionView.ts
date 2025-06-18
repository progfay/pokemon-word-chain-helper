import { createAccordionElement, type AccordionElement, type AccordionViewState } from './accordionElement.js';

const INITIAL_STATE: AccordionViewState = {
  openRowIndex: undefined,
  openCharacter: undefined,
  pokemonData: {},
  usedPokemon: [],
  isLoading: false,
  errorMessage: undefined
};

/**
 * Factory function to create accordion views
 * Now uses Custom Elements for security and performance
 */
export function createAccordionView(): AccordionElement {
  const viewElement = createAccordionElement();
  
  // Initialize with default state
  viewElement.update(INITIAL_STATE);
  
  return viewElement;
}

// Re-export types for compatibility;

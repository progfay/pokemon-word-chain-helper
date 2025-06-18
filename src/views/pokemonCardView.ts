import type { PokemonObject } from '../types/index.js';
import { createPokemonCardElement, type PokemonCardElement, type PokemonCardState } from './pokemonCardElement.js';

const INITIAL_HINTS: PokemonCardState['hints'] = {
  showImage: 'hidden',
  showTypes: false,
  showGeneration: false,
  showGenus: false,
  showName: false,
};

/**
 * Factory function to create Pokemon card views
 * Now uses Custom Elements for security and performance
 */
export function createPokemonCardView(): PokemonCardElement {
  const cardElement = createPokemonCardElement();
  
  // Initialize with default state
  cardElement.update({
    pokemon: undefined as unknown as PokemonObject,
    isSelected: false,
    isDisabled: false,
    hints: INITIAL_HINTS
  });
  
  return cardElement;
}

// Re-export types for compatibility;
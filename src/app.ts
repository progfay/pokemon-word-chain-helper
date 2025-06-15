import { initialPokemonData } from './modules/data.js';
import { initGameState } from './modules/gameState.js';
import { PokemonData } from './modules/pokemonData.js';
import { initSearchHandler } from './modules/search.js';
import { initUI } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Pokemon database
  for (const pokemon of initialPokemonData) {
    PokemonData.addPokemon(pokemon);
  }

  // Initialize UI and handlers
  initUI();
  initSearchHandler();
  initGameState();
});

// Main application entry point
import { initSearchHandler } from "./modules/search.js";
import { initGameState } from "./modules/gameState.js";
import { initUI } from "./modules/ui.js";
import { PokemonData } from "./modules/pokemonData.js";
import { initialPokemonData } from "./modules/data.js";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Pokemon database
  for (const pokemon of initialPokemonData) {
    PokemonData.addPokemon(pokemon);
  }

  // Initialize UI and handlers
  initUI();
  initSearchHandler();
  initGameState();
});

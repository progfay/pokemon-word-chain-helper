import { PokemonData } from "./pokemonData.js";

export function initGameState() {
  updateGameState();
}

export function updateGameState() {
  const usedPokemonList = document.getElementById("used-pokemon-list");
  const remainingNumber = document.getElementById("remaining-number");

  // Update used Pokemon list
  const usedPokemon = Array.from(PokemonData.usedPokemon);
  usedPokemonList.innerHTML = usedPokemon
    .map((name) => `<li class="used-pokemon">${name}</li>`)
    .join("");

  // Update remaining count
  const remaining = PokemonData.database.length - PokemonData.usedPokemon.size;
  remainingNumber.textContent = `残り: ${remaining}匹`;

  // Check for and display 'ん' ending Pokemon
  const nEndingPokemon = PokemonData.database.filter(
    (p) => !PokemonData.usedPokemon.has(p.name) && p.lastChar === "ン"
  );

  const warningContainer =
    document.getElementById("warning-container") ||
    document.createElement("div");
  warningContainer.id = "warning-container";

  if (nEndingPokemon.length > 0) {
    warningContainer.className = "warning";
    warningContainer.textContent = `注意: ${nEndingPokemon.length}匹の「ん」で終わるポケモンが残っています`;
  } else {
    warningContainer.textContent = "";
  }

  if (!document.getElementById("warning-container")) {
    document.getElementById("game-container").appendChild(warningContainer);
  }
}

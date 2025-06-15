import type { Pokemon } from "../types";
import { initialPokemonData } from "./data.js";

// Store used Pokemon names for tracking
const usedPokemonNames = new Set<string>();

export function initGameState(): void {
  updateGameState();
}

export function addUsedPokemon(pokemon: Pokemon): void {
  usedPokemonNames.add(pokemon.name);
  updateGameState();
}

export function updateGameState(): void {
  const usedPokemonList = document.getElementById("used-pokemon-list");
  const remainingNumber = document.getElementById("remaining-number");

  if (!usedPokemonList || !remainingNumber) {
    console.error("Required DOM elements not found");
    return;
  }

  // Update used Pokemon list with full details
  const usedPokemon = Array.from(usedPokemonNames)
    .map((name) => initialPokemonData.find((p) => p.name === name))
    .filter((p): p is Pokemon => p !== undefined);

  usedPokemonList.innerHTML = usedPokemon
    .map(
      (pokemon) => `<li class="used-pokemon">
      <span class="name">${pokemon.name}</span>
      <span class="details">(${pokemon.types.join("・")})</span>
    </li>`
    )
    .join("");

  // Update remaining count
  const remaining = initialPokemonData.length - usedPokemonNames.size;
  remainingNumber.textContent = `残り: ${remaining}匹`;

  // Check for and display 'ん' ending Pokemon
  const nEndingPokemon = initialPokemonData.filter(
    (p) => !usedPokemonNames.has(p.name) && p.lastChar === "ん"
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
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      gameContainer.appendChild(warningContainer);
    }
  }
}

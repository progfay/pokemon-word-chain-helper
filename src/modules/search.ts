import type { Pokemon } from "../types";
import { CharacterUtils } from "./characterUtils.js";
import { updateGameState } from "./gameState.js";
import { PokemonData } from "./pokemonData.js";

export function initSearchHandler(): void {
  const searchInput = document.getElementById(
    "search-input"
  ) as HTMLInputElement;
  const searchResults = document.getElementById("search-results");

  if (!searchInput || !searchResults) {
    console.error("Required DOM elements not found");
    return;
  }

  searchInput.addEventListener("input", (e: Event) => {
    const target = e.target as HTMLInputElement;
    const searchTerm = target.value;
    if (!searchTerm) {
      searchResults.innerHTML = "";
      return;
    }

    const firstChar = searchTerm.charAt(0);
    if (!CharacterUtils.isJapaneseChar(firstChar)) {
      searchResults.innerHTML = "日本語(ひらがな/カタカナ)で入力してください";
      return;
    }

    const normalizedChar = CharacterUtils.normalize(firstChar);
    const matchingPokemon = PokemonData.searchByFirstChar(normalizedChar);
    displaySearchResults(matchingPokemon, searchResults, searchInput);
  });
}

function displaySearchResults(
  pokemon: Pokemon[],
  container: HTMLElement,
  searchInput: HTMLInputElement
): void {
  if (pokemon.length === 0) {
    container.innerHTML = "該当するポケモンが見つかりません";
    return;
  }

  const html = pokemon
    .map(
      (p) => `
    <div class="pokemon-item" data-name="${p.name}">
      <span class="name">${p.name}</span>
      ${
        p.lastChar === "ン"
          ? '<span class="warning">「ん」で終わります</span>'
          : ""
      }
      <div class="pokemon-details">
        <p>タイプ: ${p.types.join("・")}</p>
        <p>世代: ${p.generation}</p>
      </div>
    </div>
  `
    )
    .join("");

  container.innerHTML = html;

  // Add click handlers to pokemon items
  const pokemonItems = container.querySelectorAll(".pokemon-item");
  for (const item of pokemonItems) {
    item.addEventListener("click", () => {
      const pokemonName = item.getAttribute("data-name");
      if (pokemonName) {
        PokemonData.markAsUsed(pokemonName);
        searchInput.value = "";
        container.innerHTML = "";
        updateGameState();
      }
    });
  }
}

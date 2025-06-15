import type { Pokemon } from "../types";
import { normalizeCharacters } from "./characterUtils.js";
import { addUsedPokemon } from "./gameState.js";
import { initialPokemonData } from "./data.js";

/**
 * Generate Pokemon image URL from Pokedex number
 */
function getPokemonImageUrl(pokedexNumber: number): string {
  return `https://img.yakkun.com/poke/icon96/n${pokedexNumber}.gif`;
}

// Helper to check if a character is hiragana or katakana
function isJapaneseChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x3040 && code <= 0x309f) || // Hiragana
    (code >= 0x30a0 && code <= 0x30ff) // Katakana
  );
}

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
    if (!isJapaneseChar(firstChar)) {
      searchResults.innerHTML = "日本語(ひらがな/カタカナ)で入力してください";
      return;
    }

    // Normalize the search character to hiragana for comparison
    const normalizedChar = normalizeCharacters(firstChar);
    // Search for matches in our processed Pokemon data
    const matchingPokemon = initialPokemonData.filter(
      (p) => p.firstChar === normalizedChar
    );
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

  const results = pokemon.map((p) => {
    const imageUrl = getPokemonImageUrl(p.pokedex_number);
    return `<div class="pokemon-card" data-pokemon='${JSON.stringify(p)}'>
      <img 
        src="${imageUrl}" 
        alt="${p.name}" 
        class="pokemon-image silhouette"
        loading="lazy"
      />
      <div class="pokemon-info">
        <div class="pokemon-name">${p.name}</div>
        <div class="pokemon-details">
          <div class="pokemon-types">${p.types.join("・")}</div>
          <div>世代: ${p.generation_id}</div>
          <div>図鑑番号: #${String(p.pokedex_number).padStart(3, "0")}</div>
          <div>${p.genus}</div>
        </div>
      </div>
    </div>`;
  });

  container.innerHTML = `<div class="results-grid">${results.join("")}</div>`;

  // Add click handlers for pokemon selection
  const cards = container.querySelectorAll(".pokemon-card");
  for (const card of cards) {
    card.addEventListener("click", () => {
      const pokemonData = JSON.parse(card.getAttribute("data-pokemon") || "{}");
      if (pokemonData.name) {
        // Remove silhouette from selected Pokemon
        const img = card.querySelector(".pokemon-image");
        if (img) {
          img.classList.remove("silhouette");
        }
        searchInput.value = pokemonData.name;
        addUsedPokemon(pokemonData);
      }
    });
  }
}

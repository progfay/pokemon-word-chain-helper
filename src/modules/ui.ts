import type { Pokemon } from "../types";
import { initialPokemonData } from "./data.js";

/**
 * Generate Pokemon image URL from Pokedex number
 */
function getPokemonImageUrl(pokedexNumber: number): string {
  return `https://img.yakkun.com/poke/icon96/n${pokedexNumber}.gif`;
}

export function initUI(): void {
  initInputValidation();
  initPokemonDetail();
}

function initInputValidation(): void {
  const input = document.getElementById("search-input") as HTMLInputElement;
  const status = document.querySelector(".input-status") as HTMLElement;

  if (!input || !status) {
    console.error("Required DOM elements not found");
    return;
  }

  input.addEventListener("input", (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    if (!value) {
      status.textContent = "";
      return;
    }

    const code = value.charCodeAt(0);
    const isJapanese =
      (code >= 0x3040 && code <= 0x309f) || // Hiragana
      (code >= 0x30a0 && code <= 0x30ff); // Katakana

    if (!isJapanese) {
      status.textContent = "❌";
      status.title = "日本語で入力してください";
    } else {
      status.textContent = "✓";
      status.title = "";
    }
  });
}

function initPokemonDetail(): void {
  const detailSection = document.getElementById("pokemon-detail");
  const searchResults = document.getElementById("search-results");

  if (!detailSection || !searchResults) {
    console.error("Required DOM elements not found");
    return;
  }

  searchResults.addEventListener("mouseover", (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const item = target.closest(".pokemon-card");
    if (item) {
      const pokemonData = JSON.parse(item.getAttribute("data-pokemon") || "{}");
      if (pokemonData.name) {
        const pokemon = initialPokemonData.find(
          (p) => p.name === pokemonData.name
        );
        if (pokemon) {
          updatePokemonDetail(pokemon);
          detailSection.classList.remove("hidden");
        }
      }
    }
  });

  searchResults.addEventListener("mouseout", () => {
    detailSection.classList.add("hidden");
  });
}

function updatePokemonDetail(pokemon: Pokemon): void {
  const detailSection = document.getElementById("pokemon-detail");
  if (!detailSection) return;

  const imageUrl = getPokemonImageUrl(pokemon.pokedex_number);
  detailSection.innerHTML = `
    <img 
      src="${imageUrl}" 
      alt="${pokemon.name}" 
      class="pokemon-image"
      loading="lazy"
    />
    <div class="pokemon-info">
      <h3 class="pokemon-name">${pokemon.name}</h3>
      <div class="pokemon-details">
        <div class="pokemon-types">${pokemon.types.join("・")}</div>
        <div>世代: ${pokemon.generation_id}</div>
        <div>図鑑番号: #${String(pokemon.pokedex_number).padStart(3, "0")}</div>
        <div>${pokemon.genus}</div>
      </div>
    </div>
  `;
}

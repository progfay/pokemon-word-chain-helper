import type { Pokemon } from "../types";
import { CharacterUtils } from "./characterUtils.js";
import { PokemonData } from "./pokemonData.js";

export function initUI(): void {
  initInputValidation();
  initPokemonDetail();
  updateGameState();
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

    const firstChar = value.charAt(0);
    if (!CharacterUtils.isJapaneseChar(firstChar)) {
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
    const item = target.closest(".pokemon-item");
    if (item) {
      const pokemonName = item.getAttribute("data-name");
      if (pokemonName) {
        const pokemon = PokemonData.database.find(
          (p) => p.name === pokemonName
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

export function updateGameState(): void {
  const usedPokemonList = document.getElementById("used-pokemon-list");
  const remainingNumber = document.getElementById("remaining-number");
  const warningContainer = document.getElementById("warning-container");

  if (!usedPokemonList || !remainingNumber) {
    console.error("Required DOM elements not found");
    return;
  }

  // Update used Pokemon list
  const usedPokemon = Array.from(PokemonData.usedPokemon);
  usedPokemonList.innerHTML = usedPokemon
    .map((name) => `<li>${name}</li>`)
    .join("");

  // Update remaining count
  const remaining = PokemonData.database.length - PokemonData.usedPokemon.size;
  remainingNumber.textContent = remaining.toString();

  // Check for and display 'ん' ending Pokemon
  const nEndingPokemon = PokemonData.database.filter(
    (p) => !PokemonData.usedPokemon.has(p.name) && p.lastChar === "ン"
  );

  if (nEndingPokemon.length > 0 && warningContainer) {
    warningContainer.className = "warning";
    warningContainer.textContent = `注意: ${nEndingPokemon.length}匹の「ん」で終わるポケモンが残っています`;
  } else if (warningContainer) {
    warningContainer.textContent = "";
  }
}

function updatePokemonDetail(pokemon: Pokemon): void {
  const detailSection = document.getElementById("pokemon-detail");
  if (!detailSection) return;

  detailSection.innerHTML = `
    <h3>${pokemon.name}</h3>
    <p>タイプ: ${pokemon.types.join("・")}</p>
    <p>世代: ${pokemon.generation}</p>
    <p>分類: ${pokemon.classification}</p>
  `;
}

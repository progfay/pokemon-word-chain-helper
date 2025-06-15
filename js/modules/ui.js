import { CharacterUtils } from "./characterUtils.js";
import { PokemonData } from "./pokemonData.js";

export function initUI() {
  initInputValidation();
  initPokemonDetail();
  updateGameState();
}

function initInputValidation() {
  const input = document.getElementById("search-input");
  const status = document.querySelector(".input-status");

  input.addEventListener("input", (e) => {
    const value = e.target.value;
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

function initPokemonDetail() {
  const detailSection = document.getElementById("pokemon-detail");
  const searchResults = document.getElementById("search-results");

  searchResults.addEventListener("mouseover", (e) => {
    const item = e.target.closest(".pokemon-item");
    if (item) {
      const pokemonName = item.dataset.name;
      const pokemon = PokemonData.database.find((p) => p.name === pokemonName);
      if (pokemon) {
        updatePokemonDetail(pokemon);
        detailSection.classList.remove("hidden");
      }
    }
  });

  searchResults.addEventListener("mouseout", () => {
    detailSection.classList.add("hidden");
  });
}

export function updateGameState() {
  const usedPokemonList = document.getElementById("used-pokemon-list");
  const remainingNumber = document.getElementById("remaining-number");
  const warningContainer = document.getElementById("warning-container");

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

  if (nEndingPokemon.length > 0) {
    if (!warningContainer) {
      const newWarningContainer = document.createElement("div");
      newWarningContainer.id = "warning-container";
      newWarningContainer.className = "warning";
      document
        .getElementById("game-container")
        .appendChild(newWarningContainer);
    }
    warningContainer.textContent = `注意: ${nEndingPokemon.length}匹の「ん」で終わるポケモンが残っています`;
  } else if (warningContainer) {
    warningContainer.textContent = "";
  }
}

function updatePokemonDetail(pokemon) {
  const detailSection = document.getElementById("pokemon-detail");
  detailSection.innerHTML = `
    <h3>${pokemon.name}</h3>
    <p>タイプ: ${pokemon.types.join("・")}</p>
    <p>世代: ${pokemon.generation}</p>
    <p>分類: ${pokemon.classification}</p>
  `;
}

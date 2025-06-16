import type { Pokemon } from "../types";
import { normalizeCharacters } from "./characterUtils.js";
import { pokemonByFirstChar } from "./data.js";

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

  let searchTimeout: number | undefined;

  searchInput.addEventListener("input", (e: Event) => {
    const target = e.target as HTMLInputElement;
    const searchTerm = target.value;

    if (searchTimeout) {
      window.clearTimeout(searchTimeout);
    }

    if (!searchTerm) {
      searchResults.innerHTML = "";
      return;
    }

    const firstChar = searchTerm.charAt(0);
    if (!isJapaneseChar(firstChar)) {
      searchResults.innerHTML = "日本語(ひらがな/カタカナ)で入力してください";
      return;
    }

    searchTimeout = window.setTimeout(() => {
      const normalizedChar = normalizeCharacters(firstChar);
      const matchingPokemon = pokemonByFirstChar.get(normalizedChar) || [];
      displaySearchResults(matchingPokemon, searchResults);
    }, 100);
  });
}

function createConfirmationDialog(): HTMLElement {
  const dialog = document.createElement("div");
  dialog.className = "confirmation-dialog";
  dialog.innerHTML = `
    <h3>本当に答えを見ますか？</h3>
    <p>一度表示すると戻せません。</p>
    <div class="dialog-buttons">
      <button class="dialog-button cancel">キャンセル</button>
      <button class="dialog-button confirm">確認</button>
    </div>
  `;
  return dialog;
}

interface HintState {
  image: 0 | 1 | 2; // 0: hidden, 1: silhouette, 2: color
  types: boolean;
  generation: boolean;
  genus: boolean;
  name: boolean;
}

function createHintControls(): HTMLElement {
  const controls = document.createElement("div");
  controls.className = "hint-controls";

  const buttons = [
    { id: "image", label: "画像", phases: true },
    { id: "types", label: "タイプ" },
    { id: "generation", label: "世代" },
    { id: "genus", label: "分類" },
    { id: "name", label: "名前", requireConfirm: true },
  ];

  for (const { id, label, phases, requireConfirm } of buttons) {
    const button = document.createElement("button");
    button.className = "hint-button";
    button.dataset.hint = id;
    button.textContent = label;
    if (phases) button.dataset.phases = "true";
    if (requireConfirm) button.dataset.requireConfirm = "true";
    controls.appendChild(button);
  }

  return controls;
}

function createPokemonCard(pokemon: Pokemon, index: number): HTMLElement {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  card.dataset.index = String(index);

  const hintState: HintState = {
    image: 0,
    types: false,
    generation: false,
    genus: false,
    name: false,
  };

  const content = document.createElement("div");
  content.className = "card-content";

  // Add image container (hidden by default)
  const imageContainer = document.createElement("div");
  imageContainer.className = "pokemon-image hidden";
  const img = document.createElement("img");
  img.src = getPokemonImageUrl(pokemon.pokedex_number);
  img.alt = "Pokemon image";
  imageContainer.appendChild(img);
  content.appendChild(imageContainer);

  // Add info sections (all hidden by default)
  const typeInfo = document.createElement("div");
  typeInfo.className = "pokemon-types hidden";
  typeInfo.textContent = pokemon.types.join(", ");
  content.appendChild(typeInfo);

  const genInfo = document.createElement("div");
  genInfo.className = "pokemon-generation hidden";
  genInfo.textContent = `第${pokemon.generation_id}世代`;
  content.appendChild(genInfo);

  const genusInfo = document.createElement("div");
  genusInfo.className = "pokemon-genus hidden";
  genusInfo.textContent = pokemon.genus;
  content.appendChild(genusInfo);

  const nameInfo = document.createElement("div");
  nameInfo.className = "pokemon-name hidden";
  nameInfo.textContent = pokemon.name;
  content.appendChild(nameInfo);

  const controls = createHintControls();
  controls.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;
    if (!target.matches(".hint-button")) return;

    const hintType = target.dataset.hint as keyof HintState;
    if (!hintType) return;

    if (target.dataset.phases === "true") {
      // Handle image phases (0: hidden -> 1: silhouette -> 2: color -> back to 0: hidden)
      if (hintState.image === 0) {
        // Show silhouette
        imageContainer.classList.remove("hidden");
        img.classList.add("silhouette");
        hintState.image = 1;
        target.classList.add("phase-1");
      } else if (hintState.image === 1) {
        // Show color image
        img.classList.remove("silhouette");
        hintState.image = 2;
        target.classList.remove("phase-1");
        target.classList.add("phase-2");
      } else if (hintState.image === 2) {
        // Back to hidden
        imageContainer.classList.add("hidden");
        img.classList.remove("silhouette");
        hintState.image = 0;
        target.classList.remove("phase-2");
      }
      return;
    }

    if (target.dataset.requireConfirm === "true") {
      const dialog = createConfirmationDialog();
      document.body.appendChild(dialog);

      const confirmed = await new Promise<boolean>((resolve) => {
        dialog.querySelector(".cancel")?.addEventListener("click", () => {
          dialog.remove();
          resolve(false);
        });
        dialog.querySelector(".confirm")?.addEventListener("click", () => {
          dialog.remove();
          resolve(true);
        });
      });

      if (!confirmed) return;
    }

    // Handle other hints
    const element = content.querySelector(`.pokemon-${hintType}`);
    if (element) {
      if (hintType in hintState) {
        (hintState[hintType] as boolean) = true;
        target.classList.add("active");
        element.classList.remove("hidden");
      }
    }
  });

  card.appendChild(controls);
  card.appendChild(content);
  return card;
}

function displaySearchResults(
  pokemon: Pokemon[],
  container: HTMLElement
): void {
  if (pokemon.length === 0) {
    container.innerHTML = "該当するポケモンが見つかりません";
    return;
  }

  container.innerHTML = "";

  const pokemonCount = document.createElement("div");
  pokemonCount.className = "pokemon-count";
  pokemonCount.textContent = `${pokemon.length}つのポケモンが見つかりました`;
  container.appendChild(pokemonCount);

  const resultsGrid = document.createElement("div");
  resultsGrid.className = "results-grid";

  pokemon.forEach((p, index) => {
    resultsGrid.appendChild(createPokemonCard(p, index));
  });

  container.appendChild(resultsGrid);
}

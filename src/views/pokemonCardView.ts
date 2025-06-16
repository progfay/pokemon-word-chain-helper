import type { Pokemon } from "../types/index.js";
import { createTypedView } from "./createTypedView.js";
import type { TypedView } from "./createTypedView.js";

export type PokemonCardState = {
  pokemon: Pokemon;
  isHighlighted: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  hints: {
    showImage: "hidden" | "silhouette" | "full";
    showTypes: boolean;
    showGeneration: boolean;
    showGenus: boolean;
    showName: boolean;
  };
};

type HintTogglePayload =
  | { type: "showImage"; value: "hidden" | "silhouette" | "full" }
  | { type: "showTypes" | "showGeneration" | "showGenus" | "showName"; value: boolean };

export type PokemonCardEvents = {
  "card:click": [Pokemon];
  "hint:toggle": [HintTogglePayload];
};

const INITIAL_HINTS: PokemonCardState["hints"] = {
  showImage: "hidden",
  showTypes: false,
  showGeneration: false,
  showGenus: false,
  showName: false,
};

const createPokemonCardElement = () => {
  const card = document.createElement("div");
  card.className = "pokemon-card";
  return card;
};

const createHintButtons = (hints: PokemonCardState["hints"]) => `
  <div class="pokemon-card__hint-controls">
    <button class="hint-button image-hint ${
      hints.showImage !== "hidden" ? "active" : ""
    }" data-hint="showImage" title="Toggle image visibility">
      <span class="hint-icon">👁️</span>
    </button>
    <button class="hint-button ${
      hints.showTypes ? "active" : ""
    }" data-hint="showTypes" title="Toggle type information">
      <span class="hint-icon">🏷️</span>
    </button>
    <button class="hint-button ${
      hints.showGeneration ? "active" : ""
    }" data-hint="showGeneration" title="Toggle generation">
      <span class="hint-icon">📅</span>
    </button>
    <button class="hint-button ${
      hints.showGenus ? "active" : ""
    }" data-hint="showGenus" title="Toggle genus">
      <span class="hint-icon">📝</span>
    </button>
    <button class="hint-button ${
      hints.showName ? "active" : ""
    }" data-hint="showName" title="Reveal Pokemon name">
      <span class="hint-icon">🏮</span>
    </button>
  </div>
`;

const updatePokemonCardElement = (
  card: HTMLElement,
  state: PokemonCardState
) => {
  const { pokemon, isHighlighted, isSelected, isDisabled, hints } = state;

  if (pokemon) {
    const paddedNumber = pokemon.pokedex_number.toString().padStart(3, "0");
    card.innerHTML = `
      ${createHintButtons(hints)}
      ${hints.showName ? `<div class="pokemon-card__name">${pokemon.name}</div>` : '<div class="pokemon-card__name">???</div>'}
      <div class="pokemon-card__content">
        ${
          hints.showImage !== "hidden"
            ? `
          <div class="pokemon-card__image ${
            hints.showImage === "silhouette" ? "silhouette" : ""
          }">
            <img src="https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${paddedNumber}.png" 
                alt="${pokemon.name}"
                loading="lazy"
                class="pokemon-image" />
          </div>
        `
            : ""
        }
        <div class="pokemon-card__info">
          <span class="pokemon-card__number">#${paddedNumber}</span>
          ${
            hints.showGenus
              ? `<span class="pokemon-card__genus">${pokemon.genus}</span>`
              : ""
          }
          ${
            hints.showGeneration
              ? `<span class="pokemon-card__generation">Gen ${pokemon.generation_id}</span>`
              : ""
          }
        </div>
        ${
          hints.showTypes
            ? `
          <div class="pokemon-card__types">
            ${pokemon.types
              .map(
                (type) => `<span class="type-label type-${type}">${type}</span>`
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>
    `;
  }

  card.classList.toggle("pokemon-card--highlighted", !!isHighlighted);
  card.classList.toggle("pokemon-card--selected", !!isSelected);
  card.classList.toggle("pokemon-card--disabled", !!isDisabled);
};

export const createPokemonCardView = (): TypedView<PokemonCardState> => {
  const state: PokemonCardState = {
    pokemon: undefined as unknown as Pokemon,
    isHighlighted: false,
    isSelected: false,
    isDisabled: false,
    hints: INITIAL_HINTS,
  };

  const view = createTypedView<PokemonCardState>({
    createElement: createPokemonCardElement,
    updateElement: (newState: Partial<PokemonCardState>) => {
      Object.assign(state, {
        ...state,
        ...newState,
        hints: {
          ...state.hints,
          ...(newState.hints || {}),
        },
      });
      updatePokemonCardElement(view.render(), state);
    },
    setupEventListeners: () => {
      const element = view.render();

      const handleClick = (e: Event) => {
        // Check if click target is a hint button
        const target = e.target as HTMLElement;
        const hintButton = target.closest(".hint-button");

        if (hintButton) {
          e.stopPropagation();
          const hintType = (hintButton as HTMLElement).dataset
            .hint as keyof PokemonCardState["hints"];

          if (hintType === "showImage") {
            const states: PokemonCardState["hints"]["showImage"][] = [
              "hidden",
              "silhouette",
              "full",
            ];
            const nextIndex =
              (states.indexOf(state.hints.showImage) + 1) % states.length;
            view.update({
              hints: {
                ...state.hints,
                [hintType]: states[nextIndex],
              },
            });
          } else {
            view.update({
              hints: {
                ...state.hints,
                [hintType]: !state.hints[hintType],
              },
            });
          }
        } else if (state.pokemon) {
          view.emit("card:click", state.pokemon);
        }
      };

      element.addEventListener("click", handleClick);

      return () => {
        element.removeEventListener("click", handleClick);
      };
    },
  });

  return view;
};

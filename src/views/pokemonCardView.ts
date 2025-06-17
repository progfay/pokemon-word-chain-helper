import type { PokemonObject, PokemonType } from '../types/index.js';
import { createTypedView } from './createTypedView.js';
import type { TypedView } from './createTypedView.js';

/**
 * Map numeric type IDs to type names for display
 */
const TYPE_ID_TO_NAME: Record<PokemonType, string> = {
  1: 'normal',
  2: 'fire',
  3: 'water',
  4: 'electric',
  5: 'grass',
  6: 'ice',
  7: 'fighting',
  8: 'poison',
  9: 'ground',
  10: 'flying',
  11: 'psychic',
  12: 'bug',
  13: 'rock',
  14: 'ghost',
  15: 'dragon',
  16: 'dark',
  17: 'steel',
  18: 'fairy',
};

export type PokemonCardState = {
  pokemon: PokemonObject;
  isHighlighted: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  hints: {
    showImage: 'hidden' | 'silhouette' | 'full';
    showTypes: boolean;
    showGeneration: boolean;
    showGenus: boolean;
    showName: boolean;
  };
};

type HintTogglePayload =
  | { type: 'showImage'; value: 'hidden' | 'silhouette' | 'full' }
  | {
      type: 'showTypes' | 'showGeneration' | 'showGenus' | 'showName';
      value: boolean;
    };

export type PokemonCardEvents = {
  'card:click': [PokemonObject];
  'hint:toggle': [HintTogglePayload];
};

const INITIAL_HINTS: PokemonCardState['hints'] = {
  showImage: 'hidden',
  showTypes: false,
  showGeneration: false,
  showGenus: false,
  showName: false,
};

const createPokemonCardElement = () => {
  const card = document.createElement('div');
  card.className = 'pokemon-card';
  return card;
};

const updatePokemonCardElement = (
  card: HTMLElement,
  state: PokemonCardState,
  view: TypedView<PokemonCardState>,
) => {
  const { pokemon, isHighlighted, isSelected, isDisabled, hints } = state;

  if (pokemon) {
    const paddedNumber = pokemon.pokedex_number.toString().padStart(3, '0');
    card.innerHTML = `
      <div class="pokemon-card__container">
        <div class="pokemon-card__checkbox-section">
          <input type="checkbox" class="pokemon-card__checkbox" ${isSelected ? 'checked' : ''} />
        </div>
        <div class="pokemon-card__image-section ${hints.showImage !== 'hidden' ? 'image-visible' : 'image-hidden'}" data-clickable="image">
          <img src="https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${paddedNumber}.png" 
              alt="${pokemon.name}"
              loading="lazy"
              class="pokemon-image ${hints.showImage === 'silhouette' ? 'silhouette' : ''}" />
        </div>
        <div class="pokemon-card__info-section">
          <div class="pokemon-card__number">No.${pokemon.pokedex_number}</div>
          <div class="pokemon-card__name-section" data-clickable="name">
            <span class="pokemon-card__name-label">
              ${hints.showName ? `**${pokemon.name}**` : '**Pokemon Name**'}
            </span>
          </div>
          <div class="pokemon-card__details">
            <div class="pokemon-card__detail-item" data-clickable="genus">
              - ${hints.showGenus ? `${pokemon.genus}ポケモン` : '(Genus)'}
            </div>
            <div class="pokemon-card__detail-item" data-clickable="types">
              - ${hints.showTypes ? pokemon.types.map((type) => TYPE_ID_TO_NAME[type] || 'unknown').join(', ') : '(Types)'}
            </div>
            <div class="pokemon-card__detail-item" data-clickable="generation">
              - ${hints.showGeneration ? `Gen ${pokemon.generation_id}` : '(Generation)'}
            </div>
          </div>
        </div>
      </div>
    `;

    // Set up checkbox event listener after content is added
    const checkbox = card.querySelector('.pokemon-card__checkbox') as HTMLInputElement;
    if (checkbox) {
      const handleCheckboxChange = () => {
        view.emit('card:click', pokemon);
      };
      
      // Remove any existing listener to avoid duplicates
      checkbox.removeEventListener('change', handleCheckboxChange);
      checkbox.addEventListener('change', handleCheckboxChange);
    }
  }

  card.classList.toggle('pokemon-card--highlighted', !!isHighlighted);
  card.classList.toggle('pokemon-card--selected', !!isSelected);
  card.classList.toggle('pokemon-card--disabled', !!isDisabled);
};

export const createPokemonCardView = (): TypedView<PokemonCardState> => {
  const state: PokemonCardState = {
    pokemon: undefined as unknown as PokemonObject,
    isHighlighted: false,
    isSelected: false,
    isDisabled: false,
    hints: INITIAL_HINTS,
  };

  const view = createTypedView<PokemonCardState>({
    createElement: createPokemonCardElement,
    updateElement: (newState: Partial<PokemonCardState>) => {
      Object.assign(state, {
        ...newState,
        hints: {
          ...state.hints,
          ...(newState.hints || {}),
        },
      });
      updatePokemonCardElement(view.render(), state, view);
    },
    setupEventListeners: () => {
      const element = view.render();

      const handleClick = (e: Event) => {
        const target = e.target as HTMLElement;
        const clickableElement = target.closest(
          '[data-clickable]',
        ) as HTMLElement;

        if (clickableElement) {
          e.stopPropagation();
          const clickType = clickableElement.dataset.clickable;

          switch (clickType) {
            case 'image': {
              const states: PokemonCardState['hints']['showImage'][] = [
                'hidden',
                'silhouette',
                'full',
              ];
              const nextIndex =
                (states.indexOf(state.hints.showImage) + 1) % states.length;
              view.update({
                hints: {
                  ...state.hints,
                  showImage: states[nextIndex],
                },
              });
              break;
            }
            case 'name':
              view.update({
                hints: {
                  ...state.hints,
                  showName: !state.hints.showName,
                },
              });
              break;
            case 'genus':
              view.update({
                hints: {
                  ...state.hints,
                  showGenus: !state.hints.showGenus,
                },
              });
              break;
            case 'types':
              view.update({
                hints: {
                  ...state.hints,
                  showTypes: !state.hints.showTypes,
                },
              });
              break;
            case 'generation':
              view.update({
                hints: {
                  ...state.hints,
                  showGeneration: !state.hints.showGeneration,
                },
              });
              break;
          }
        }
      };

      element.addEventListener('click', handleClick);

      return () => {
        element.removeEventListener('click', handleClick);
      };
    },
  });

  return view;
};

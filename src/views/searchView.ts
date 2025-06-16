import type { Pokemon } from '../types/index.js';
import type { EventEmitter, EventMap } from '../utils/eventEmitter.js';
import { createAccordionView } from './accordionView.js';
import { type TypedView, createTypedView } from './createTypedView.js';

interface SearchViewState {
  openRowIndex?: number;
  openCharacter?: string;
  pokemonData: { [char: string]: Pokemon[] };
  usedPokemon: Pokemon[];
  isLoading: boolean;
  errorMessage?: string;
}

interface SearchViewEvents extends EventMap {
  'search:character-select': [string];
  'search:pokemon-select': [Pokemon];
  'search:clear': [];
  [key: string]: unknown[];
}

const createSearchElement = () => {
  const container = document.createElement('div');
  container.className = 'search-container';

  const header = document.createElement('div');
  header.className = 'search-header';
  header.innerHTML = '<h2>ポケモン検索</h2>';

  const selectedDisplay = document.createElement('div');
  selectedDisplay.className = 'search-selected-display';
  selectedDisplay.innerHTML =
    '<p>選択された文字: <span class="selected-char">なし</span></p>';

  const error = document.createElement('div');
  error.className = 'search-error hidden';

  container.appendChild(header);
  container.appendChild(selectedDisplay);
  container.appendChild(error);

  return container;
};

const updateSearchElement = (
  container: HTMLElement,
  state: Partial<SearchViewState>,
) => {
  const selectedCharDisplay = container.querySelector('.selected-char');
  const error = container.querySelector('.search-error');

  if (!selectedCharDisplay || !error) return;

  if (state.openCharacter !== undefined) {
    selectedCharDisplay.textContent = state.openCharacter || 'なし';
  }

  if ('errorMessage' in state) {
    error.textContent = state.errorMessage || '';
    error.classList.toggle('hidden', !state.errorMessage);
  }
};

export const createSearchView = () => {
  const accordionView = createAccordionView();

  const view = createTypedView<SearchViewState>({
    createElement: () => {
      const container = createSearchElement();
      // Mount accordion view into the search container
      container.appendChild(accordionView.render());
      return container;
    },
    updateElement: (state) => {
      const element = view.render();
      updateSearchElement(element, state);

      // Update accordion view state
      accordionView.update({
        openCharacter: state.openCharacter,
        openRowIndex: state.openRowIndex,
        pokemonData: state.pokemonData || {},
        usedPokemon: state.usedPokemon || [],
        isLoading: state.isLoading,
        errorMessage: state.errorMessage,
      });
    },
    setupEventListeners: () => {
      const handleCharacterSelect = (char: string) => {
        const typedView = view as TypedView<SearchViewState> &
          EventEmitter<SearchViewEvents>;
        typedView.emit('search:character-select', char);
      };

      const handlePokemonSelect = (pokemon: Pokemon) => {
        const typedView = view as TypedView<SearchViewState> &
          EventEmitter<SearchViewEvents>;
        typedView.emit('search:pokemon-select', pokemon);
      };

      const handleAccordionClear = () => {
        const typedView = view as TypedView<SearchViewState> &
          EventEmitter<SearchViewEvents>;
        typedView.emit('search:clear');
      };

      accordionView.on('accordion:character-select', handleCharacterSelect);
      accordionView.on('accordion:pokemon-select', handlePokemonSelect);
      accordionView.on('accordion:clear', handleAccordionClear);

      return () => {
        accordionView.off('accordion:character-select', handleCharacterSelect);
        accordionView.off('accordion:pokemon-select', handlePokemonSelect);
        accordionView.off('accordion:clear', handleAccordionClear);
        accordionView.destroy();
      };
    },
  });

  return view as TypedView<SearchViewState> & EventEmitter<SearchViewEvents>;
};

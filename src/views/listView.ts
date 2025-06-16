import type { Pokemon } from '../types/index.js';
import type { EventEmitter, EventMap } from '../utils/eventEmitter.js';
import { type TypedView, createTypedView } from './createTypedView.js';
import { createPokemonCardView } from './pokemonCardView.js';

interface ListViewState {
  items: Pokemon[];
  selectedItem?: Pokemon;
  highlightedItem?: Pokemon;
  disabledItems: Pokemon[];
}

interface ListViewEvents extends EventMap {
  'item:click': [Pokemon];
  [key: string]: unknown[];
}

const createListElement = () => {
  const list = document.createElement('div');
  list.className = 'pokemon-list';
  return list;
};

export const createListView = () => {
  const pokemonCards = new Map<
    number,
    ReturnType<typeof createPokemonCardView>
  >();

  const view = createTypedView<ListViewState>({
    createElement: createListElement,
    updateElement: ({
      items = [],
      selectedItem,
      highlightedItem,
      disabledItems = [],
    }) => {
      const listElement = view.render();

      // Clear removed cards
      for (const [pokedexNumber, card] of pokemonCards.entries()) {
        if (!items.find((item) => item.pokedex_number === pokedexNumber)) {
          card.destroy();
          pokemonCards.delete(pokedexNumber);
        }
      }

      // Create or update cards
      for (const pokemon of items) {
        let card = pokemonCards.get(pokemon.pokedex_number);
        if (!card) {
          card = createPokemonCardView();
          pokemonCards.set(pokemon.pokedex_number, card);
          card.on('card:click', (clickedPokemon) => {
            (
              view as TypedView<ListViewState> & EventEmitter<ListViewEvents>
            ).emit('item:click', clickedPokemon);
          });
          card.on('hint:toggle', (_hintPayload) => {
            // The hint toggle is handled internally by the Pokemon card view
            // No need to emit to parent - it updates its own state
          });
          listElement?.appendChild(card.render());
        }

        card.update({
          pokemon,
          isSelected: selectedItem?.pokedex_number === pokemon.pokedex_number,
          isHighlighted:
            highlightedItem?.pokedex_number === pokemon.pokedex_number,
          isDisabled: disabledItems.some(
            (item) => item.pokedex_number === pokemon.pokedex_number,
          ),
        });
      }
    },
    cleanupEventListeners: () => {
      // Cleanup all card views
      for (const card of pokemonCards.values()) {
        card.destroy();
      }
      pokemonCards.clear();
    },
  });

  return view as TypedView<ListViewState> & EventEmitter<ListViewEvents>;
};

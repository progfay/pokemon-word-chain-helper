import type { Pokemon } from '../types/index.js';
import { createTypedView } from './createTypedView.js';

interface UsedPokemonViewState {
  usedPokemon: Pokemon[];
}

const createUsedPokemonElement = () => {
  const container = document.createElement('div');
  container.className = 'used-pokemon';

  const title = document.createElement('h3');
  title.className = 'used-pokemon__title';
  title.textContent = '使用済みポケモン';

  const list = document.createElement('div');
  list.className = 'used-pokemon__list';

  container.appendChild(title);
  container.appendChild(list);

  return container;
};

const updateUsedPokemonElement = (
  container: HTMLElement,
  state: Partial<UsedPokemonViewState>,
) => {
  const list = container.querySelector('.used-pokemon__list') as HTMLDivElement;

  if (!list) return;

  if (state.usedPokemon !== undefined) {
    list.innerHTML = '';

    if (state.usedPokemon.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'used-pokemon__empty';
      emptyMessage.textContent = 'まだポケモンが選ばれていません';
      list.appendChild(emptyMessage);
    } else {
      state.usedPokemon.forEach((pokemon, index) => {
        const item = document.createElement('div');
        item.className = 'used-pokemon__item';

        const order = document.createElement('span');
        order.className = 'used-pokemon__order';
        order.textContent = `${index + 1}.`;

        const name = document.createElement('span');
        name.className = 'used-pokemon__name';
        name.textContent = pokemon.name;

        const chars = document.createElement('span');
        chars.className = 'used-pokemon__chars';
        chars.textContent = `(${pokemon.firstChar} → ${pokemon.lastChar})`;

        item.appendChild(order);
        item.appendChild(name);
        item.appendChild(chars);
        list.appendChild(item);
      });
    }
  }
};

export const createUsedPokemonView = () => {
  const view = createTypedView<UsedPokemonViewState>({
    createElement: createUsedPokemonElement,
    updateElement: (state) => {
      const element = view.render();
      updateUsedPokemonElement(element, state);
    },
  });

  return view;
};

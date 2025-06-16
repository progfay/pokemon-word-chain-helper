import type { GameWarning } from '../types/index.js';
import { createTypedView } from './createTypedView.js';

interface WarningViewState {
  warnings: GameWarning[];
}

const createWarningElement = () => {
  const container = document.createElement('div');
  container.className = 'warnings';

  const title = document.createElement('h3');
  title.className = 'warnings__title';
  title.textContent = 'ゲームの警告';

  const list = document.createElement('div');
  list.className = 'warnings__list';

  container.appendChild(title);
  container.appendChild(list);

  return container;
};

const updateWarningElement = (
  container: HTMLElement,
  state: Partial<WarningViewState>,
) => {
  const list = container.querySelector('.warnings__list') as HTMLDivElement;

  if (!list) return;

  if (state.warnings !== undefined) {
    list.innerHTML = '';

    if (state.warnings.length === 0) {
      container.style.display = 'none';
    } else {
      container.style.display = 'block';

      for (const warning of state.warnings) {
        const item = document.createElement('div');
        item.className = `warnings__item warnings__item--${warning.type}`;

        const icon = document.createElement('span');
        icon.className = 'warnings__icon';
        icon.textContent = getWarningIcon(warning.type);

        const message = document.createElement('span');
        message.className = 'warnings__message';
        message.textContent = warning.message;

        item.appendChild(icon);
        item.appendChild(message);

        if (warning.pokemon) {
          const pokemon = document.createElement('span');
          pokemon.className = 'warnings__pokemon';
          pokemon.textContent = ` (${warning.pokemon.name})`;
          item.appendChild(pokemon);
        }

        list.appendChild(item);
      }
    }
  }
};

const getWarningIcon = (type: GameWarning['type']): string => {
  switch (type) {
    case 'ending_with_n':
      return '⚠️';
    case 'already_used':
      return '❌';
    case 'invalid_chain':
      return '🔗';
    default:
      return '⚠️';
  }
};

export const createWarningView = () => {
  const view = createTypedView<WarningViewState>({
    createElement: createWarningElement,
    updateElement: (state) => {
      const element = view.render();
      updateWarningElement(element, state);
    },
  });

  return view;
};

import type { EventEmitter, EventMap } from '../utils/eventEmitter.js';
import { type TypedView, createTypedView } from './createTypedView.js';

interface SearchViewState {
  query: string;
  isLoading: boolean;
  errorMessage?: string;
}

interface SearchViewEvents extends EventMap {
  'search:input': [string];
  'search:submit': [string];
  'search:clear': [];
  [key: string]: unknown[];
}

const createSearchElement = () => {
  const container = document.createElement('div');
  container.className = 'search-container';

  const form = document.createElement('form');
  form.className = 'search-form';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-input';
  input.placeholder = 'ポケモンの名前を入力...';

  const spinner = document.createElement('div');
  spinner.className = 'search-spinner hidden';

  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'search-clear-button hidden';
  clearButton.textContent = '×';

  const error = document.createElement('div');
  error.className = 'search-error hidden';

  form.appendChild(input);
  form.appendChild(spinner);
  form.appendChild(clearButton);
  container.appendChild(form);
  container.appendChild(error);

  return container;
};

const updateSearchElement = (
  container: HTMLElement,
  state: Partial<SearchViewState>,
) => {
  const input = container.querySelector('.search-input') as HTMLInputElement;
  const spinner = container.querySelector('.search-spinner');
  const clearButton = container.querySelector('.search-clear-button');
  const error = container.querySelector('.search-error');

  if (!input || !spinner || !clearButton || !error) return;

  if (state.query !== undefined) {
    input.value = state.query;
    clearButton.classList.toggle('hidden', !state.query);
  }

  if (state.isLoading !== undefined) {
    spinner.classList.toggle('hidden', !state.isLoading);
  }

  if ('errorMessage' in state) {
    error.textContent = state.errorMessage || '';
    error.classList.toggle('hidden', !state.errorMessage);
  }
};

export const createSearchView = () => {
  const view = createTypedView<SearchViewState>({
    createElement: createSearchElement,
    updateElement: (state) => {
      const element = view.render();
      updateSearchElement(element, state);
    },
    setupEventListeners: () => {
      const element = view.render();
      const form = element.querySelector('.search-form') as HTMLFormElement;
      const input = element.querySelector('.search-input') as HTMLInputElement;
      const clearButton = element.querySelector(
        '.search-clear-button',
      ) as HTMLButtonElement;

      const handleInput = () => {
        const typedView = view as TypedView<SearchViewState> &
          EventEmitter<SearchViewEvents>;
        typedView.emit('search:input', input.value);
      };

      const handleSubmit = (event: Event) => {
        event.preventDefault();
        const typedView = view as TypedView<SearchViewState> &
          EventEmitter<SearchViewEvents>;
        typedView.emit('search:submit', input.value);
      };

      const handleClear = () => {
        input.value = '';
        const typedView = view as TypedView<SearchViewState> &
          EventEmitter<SearchViewEvents>;
        typedView.emit('search:clear');
      };

      input.addEventListener('input', handleInput);
      form.addEventListener('submit', handleSubmit);
      clearButton.addEventListener('click', handleClear);

      return () => {
        input.removeEventListener('input', handleInput);
        form.removeEventListener('submit', handleSubmit);
        clearButton.removeEventListener('click', handleClear);
      };
    },
  });

  return view as TypedView<SearchViewState> & EventEmitter<SearchViewEvents>;
};

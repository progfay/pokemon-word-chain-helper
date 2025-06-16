import type { EventEmitter, EventMap } from '../utils/eventEmitter.js';
import { type TypedView, createTypedView } from './createTypedView.js';

interface SyllabaryViewState {
  selectedChar?: string;
  isLoading: boolean;
  errorMessage?: string;
}

interface SyllabaryViewEvents extends EventMap {
  'syllabary:select': [string];
  'syllabary:clear': [];
  [key: string]: unknown[];
}

// Japanese syllabary characters used in Pokemon names
const HIRAGANA_CHARS = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['だ', 'ぢ', 'づ', 'で', 'ど'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
  ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', '', 'ゆ', '', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', '', '', '', 'を'],
  ['ん', '', '', '', ''],
];

const createSyllabaryElement = () => {
  const container = document.createElement('div');
  container.className = 'syllabary-container';

  const header = document.createElement('div');
  header.className = 'syllabary-header';
  header.innerHTML = `
    <h3>文字を選択してください</h3>
    <button class="syllabary-clear-button" type="button">クリア</button>
  `;

  const table = document.createElement('div');
  table.className = 'syllabary-table';

  // Create syllabary grid
  for (const row of HIRAGANA_CHARS) {
    const rowElement = document.createElement('div');
    rowElement.className = 'syllabary-row';

    for (const char of row) {
      const cell = document.createElement('button');
      cell.className = 'syllabary-cell';
      cell.type = 'button';

      if (char) {
        cell.textContent = char;
        cell.dataset.char = char;
      } else {
        cell.classList.add('empty');
      }

      rowElement.appendChild(cell);
    }

    table.appendChild(rowElement);
  }

  const spinner = document.createElement('div');
  spinner.className = 'syllabary-spinner hidden';

  const error = document.createElement('div');
  error.className = 'syllabary-error hidden';

  container.appendChild(header);
  container.appendChild(table);
  container.appendChild(spinner);
  container.appendChild(error);

  return container;
};

const updateSyllabaryElement = (
  container: HTMLElement,
  state: Partial<SyllabaryViewState>,
) => {
  const cells = container.querySelectorAll('.syllabary-cell');
  const spinner = container.querySelector('.syllabary-spinner');
  const error = container.querySelector('.syllabary-error');

  if (!spinner || !error) return;

  // Update selected character
  if (state.selectedChar !== undefined) {
    for (const cell of cells) {
      const char = (cell as HTMLElement).dataset.char;
      cell.classList.toggle('selected', char === state.selectedChar);
    }
  }

  // Update loading state
  if (state.isLoading !== undefined) {
    spinner.classList.toggle('hidden', !state.isLoading);
  }

  // Update error message
  if ('errorMessage' in state) {
    error.textContent = state.errorMessage || '';
    error.classList.toggle('hidden', !state.errorMessage);
  }
};

export const createSyllabaryView = () => {
  const view = createTypedView<SyllabaryViewState>({
    createElement: createSyllabaryElement,
    updateElement: (state) => {
      const element = view.render();
      updateSyllabaryElement(element, state);
    },
    setupEventListeners: () => {
      const element = view.render();
      const clearButton = element.querySelector(
        '.syllabary-clear-button',
      ) as HTMLButtonElement;
      const cells = element.querySelectorAll('.syllabary-cell');

      const handleCellClick = (event: Event) => {
        const target = event.target as HTMLElement;
        const char = target.dataset.char;

        if (char) {
          const typedView = view as TypedView<SyllabaryViewState> &
            EventEmitter<SyllabaryViewEvents>;
          typedView.emit('syllabary:select', char);
        }
      };

      const handleClear = () => {
        const typedView = view as TypedView<SyllabaryViewState> &
          EventEmitter<SyllabaryViewEvents>;
        typedView.emit('syllabary:clear');
      };

      // Add click listeners to all cells
      for (const cell of cells) {
        cell.addEventListener('click', handleCellClick);
      }

      clearButton.addEventListener('click', handleClear);

      return () => {
        for (const cell of cells) {
          cell.removeEventListener('click', handleCellClick);
        }
        clearButton.removeEventListener('click', handleClear);
      };
    },
  });

  return view as TypedView<SyllabaryViewState> &
    EventEmitter<SyllabaryViewEvents>;
};

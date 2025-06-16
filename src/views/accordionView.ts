import type { PokemonObject } from '../types/index.js';
import type { EventEmitter, EventMap } from '../utils/eventEmitter.js';
import { type TypedView, createTypedView } from './createTypedView.js';
import { createPokemonCardView } from './pokemonCardView.js';

interface AccordionViewState {
  openRowIndex?: number;
  openCharacter?: string;
  pokemonData: { [char: string]: PokemonObject[] };
  usedPokemon: PokemonObject[];
  isLoading: boolean;
  errorMessage?: string;
}

interface AccordionViewEvents extends EventMap {
  'accordion:character-select': [string];
  'accordion:pokemon-select': [PokemonObject];
  'accordion:clear': [];
  [key: string]: unknown[];
}

// Japanese character rows organized by gojūon
const JAPANESE_ROWS = [
  { name: 'ア行', chars: ['ア', 'イ', 'ウ', 'エ', 'オ'] },
  { name: 'カ行', chars: ['カ', 'キ', 'ク', 'ケ', 'コ'] },
  { name: 'ガ行', chars: ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'] },
  { name: 'サ行', chars: ['サ', 'シ', 'ス', 'セ', 'ソ'] },
  { name: 'ザ行', chars: ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'] },
  { name: 'タ行', chars: ['タ', 'チ', 'ツ', 'テ', 'ト'] },
  { name: 'ダ行', chars: ['ダ', 'ヂ', 'ヅ', 'デ', 'ド'] },
  { name: 'ナ行', chars: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'] },
  { name: 'ハ行', chars: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'] },
  { name: 'バ行', chars: ['バ', 'ビ', 'ブ', 'ベ', 'ボ'] },
  { name: 'パ行', chars: ['パ', 'ピ', 'プ', 'ペ', 'ポ'] },
  { name: 'マ行', chars: ['マ', 'ミ', 'ム', 'メ', 'モ'] },
  { name: 'ヤ行', chars: ['ヤ', 'ユ', 'ヨ'] },
  { name: 'ラ行', chars: ['ラ', 'リ', 'ル', 'レ', 'ロ'] },
  { name: 'ワ行', chars: ['ワ', 'ヲ', 'ン'] },
];

const createAccordionElement = () => {
  const container = document.createElement('div');
  container.className = 'accordion-container';

  const header = document.createElement('div');
  header.className = 'accordion-header';
  header.innerHTML = '<h3>文字を選択してください</h3>';

  const accordion = document.createElement('div');
  accordion.className = 'accordion';

  // Create three-level nested accordion structure
  for (let i = 0; i < JAPANESE_ROWS.length; i++) {
    const row = JAPANESE_ROWS[i];
    const rowDetails = document.createElement('details');
    rowDetails.className = 'accordion-row';
    rowDetails.dataset.rowIndex = i.toString();

    const rowSummary = document.createElement('summary');
    rowSummary.className = 'accordion-row-header';
    rowSummary.textContent = row.name;

    const charContainer = document.createElement('div');
    charContainer.className = 'accordion-char-container';

    // Create nested character accordions
    for (const char of row.chars) {
      const charDetails = document.createElement('details');
      charDetails.className = 'accordion-char';
      charDetails.dataset.char = char;

      const charSummary = document.createElement('summary');
      charSummary.className = 'accordion-char-header';
      charSummary.textContent = char;

      const pokemonContainer = document.createElement('div');
      pokemonContainer.className = 'accordion-pokemon-container';
      pokemonContainer.dataset.char = char;

      charDetails.appendChild(charSummary);
      charDetails.appendChild(pokemonContainer);
      charContainer.appendChild(charDetails);
    }

    rowDetails.appendChild(rowSummary);
    rowDetails.appendChild(charContainer);
    accordion.appendChild(rowDetails);
  }

  const error = document.createElement('div');
  error.className = 'accordion-error hidden';

  container.appendChild(header);
  container.appendChild(accordion);
  container.appendChild(error);

  return container;
};

const updateAccordionElement = (
  container: HTMLElement,
  state: Partial<AccordionViewState>,
) => {
  const rowDetails = container.querySelectorAll('details.accordion-row');
  const charDetails = container.querySelectorAll('details.accordion-char');
  const error = container.querySelector('.accordion-error');

  if (!error) return;

  // Update open/closed state of row accordions
  if ('openRowIndex' in state) {
    for (let i = 0; i < rowDetails.length; i++) {
      const detailsElement = rowDetails[i] as HTMLDetailsElement;
      const isOpen = state.openRowIndex === i;
      detailsElement.open = isOpen;
    }
  }

  // Update open/closed state of character accordions
  if ('openCharacter' in state) {
    for (const charDetail of charDetails) {
      const detailsElement = charDetail as HTMLDetailsElement;
      const char = detailsElement.dataset.char;
      const isOpen = char === state.openCharacter;
      detailsElement.open = isOpen;
      
      // If opening a character, ensure its parent row stays open
      if (isOpen) {
        const parentRow = detailsElement.closest('details.accordion-row') as HTMLDetailsElement;
        if (parentRow) {
          parentRow.open = true;
        }
      }
    }
  }

  // Update Pokemon data for each character
  if (state.pokemonData || state.usedPokemon) {
    const pokemonData = state.pokemonData || {};
    const usedPokemon = state.usedPokemon || [];
    const usedNames = new Set(usedPokemon.map((p) => p.name));
    
    for (const char in pokemonData) {
      const pokemonContainer = container.querySelector(
        `.accordion-pokemon-container[data-char="${char}"]`,
      ) as HTMLElement;

      if (pokemonContainer) {
        // Clear existing Pokemon cards
        pokemonContainer.innerHTML = '';

        // Add Pokemon cards
        const pokemon = pokemonData[char] || [];

        for (const p of pokemon) {
          const cardView = createPokemonCardView();
          cardView.update({
            pokemon: p,
            isHighlighted: false,
            isSelected: false,
            isDisabled: usedNames.has(p.name),
            hints: {
              showImage: 'hidden', // Hide image initially
              showTypes: false, // Hide types initially
              showGeneration: false,
              showGenus: false,
              showName: false, // Hide name initially
            },
          });

          // Add click handler for Pokemon selection
          cardView.on('card:click', ((...args: unknown[]) => {
            const selectedPokemon = args[0] as PokemonObject;
            const event = new CustomEvent('accordion:pokemon-select', {
              detail: selectedPokemon,
            });
            container.dispatchEvent(event);
          }) as (...args: unknown[]) => void);

          pokemonContainer.appendChild(cardView.render());
        }
      }
    }
  }

  // Update error message
  if ('errorMessage' in state) {
    error.textContent = state.errorMessage || '';
    error.classList.toggle('hidden', !state.errorMessage);
  }
};

export const createAccordionView = () => {
  const view = createTypedView<AccordionViewState>({
    createElement: createAccordionElement,
    updateElement: (state) => {
      const element = view.render();
      updateAccordionElement(element, state);
    },
    setupEventListeners: () => {
      const element = view.render();
      const rowDetails = element.querySelectorAll('details.accordion-row');
      const charDetails = element.querySelectorAll('details.accordion-char');

      const handleRowToggle = (event: Event) => {
        const target = event.target as HTMLDetailsElement;
        const rowIndex = Number.parseInt(target.dataset.rowIndex || '-1', 10);

        if (rowIndex >= 0) {
          // When a row is opened, close other rows
          if (target.open) {
            for (let i = 0; i < rowDetails.length; i++) {
              if (i !== rowIndex) {
                (rowDetails[i] as HTMLDetailsElement).open = false;
              }
            }
            view.update({
              openRowIndex: rowIndex,
              openCharacter: undefined,
            });
          } else {
            view.update({
              openRowIndex: undefined,
              openCharacter: undefined,
            });
          }
        }
      };

      const handleCharToggle = (event: Event) => {
        event.stopPropagation(); // Prevent event from bubbling up to row accordion
        const target = event.target as HTMLDetailsElement;
        const char = target.dataset.char;
        
        if (char && target.open) {
          // When a character is opened, close other characters and emit selection event
          for (const charDetail of charDetails) {
            const detailsElement = charDetail as HTMLDetailsElement;
            if (detailsElement !== target) {
              detailsElement.open = false;
            }
          }


          const typedView = view as TypedView<AccordionViewState> &
            EventEmitter<AccordionViewEvents>;
          
          typedView.emit('accordion:character-select', char);
          
          // Don't call view.update here - let the controller handle the state update
          // This prevents the DOM manipulation conflict
        } else if (!target.open) {
          view.update({
            openCharacter: undefined,
          });
        }
      };

      const handlePokemonSelect = (event: Event) => {
        if (event instanceof CustomEvent) {
          const pokemon = event.detail as PokemonObject;
          const typedView = view as TypedView<AccordionViewState> &
            EventEmitter<AccordionViewEvents>;
          typedView.emit('accordion:pokemon-select', pokemon);
        }
      };

      // Add toggle listeners to row details elements
      for (const details of rowDetails) {
        details.addEventListener('toggle', handleRowToggle);
      }

      // Add toggle listeners to character details elements
      for (const details of charDetails) {
        details.addEventListener('toggle', handleCharToggle);
      }

      // Add Pokemon selection listener to container
      element.addEventListener('accordion:pokemon-select', handlePokemonSelect);

      return () => {
        for (const details of rowDetails) {
          details.removeEventListener('toggle', handleRowToggle);
        }
        for (const details of charDetails) {
          details.removeEventListener('toggle', handleCharToggle);
        }
        element.removeEventListener(
          'accordion:pokemon-select',
          handlePokemonSelect,
        );
      };
    },
  });

  return view as TypedView<AccordionViewState> &
    EventEmitter<AccordionViewEvents>;
};

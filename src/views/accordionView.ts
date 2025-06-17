import type { PokemonObject } from '../types/index.js';
import type { EventEmitter, EventMap } from '../utils/eventEmitter.js';
import { JAPANESE_ROWS } from '../utils/japaneseConstants.js';
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

    // Create tab navigation
    const tabNav = document.createElement('div');
    tabNav.className = 'char-tab-nav';
    for (const char of row.chars) {
      const tabButton = document.createElement('button');
      tabButton.className = 'char-tab-button';
      tabButton.dataset.char = char;
      tabButton.textContent = char;
      tabNav.appendChild(tabButton);
    }

    // Create tab content container
    const tabContent = document.createElement('div');
    tabContent.className = 'char-tab-content';

    // Create Pokemon containers for each character (hidden by default)
    for (const char of row.chars) {
      const pokemonContainer = document.createElement('div');
      pokemonContainer.className = 'accordion-pokemon-container tab-panel';
      pokemonContainer.dataset.char = char;
      pokemonContainer.style.display = 'none'; // Hidden by default
      tabContent.appendChild(pokemonContainer);
    }

    charContainer.appendChild(tabNav);
    charContainer.appendChild(tabContent);

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
  const tabButtons = container.querySelectorAll('.char-tab-button');
  const tabPanels = container.querySelectorAll('.tab-panel');
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

  // Update active tab and visible panel
  if ('openCharacter' in state) {
    // Update tab button states
    for (const button of tabButtons) {
      const tabButton = button as HTMLButtonElement;
      const char = tabButton.dataset.char;
      const isActive = char === state.openCharacter;
      tabButton.classList.toggle('active', isActive);

      // If activating a character, ensure its parent row stays open
      if (isActive) {
        const parentRow = tabButton.closest(
          'details.accordion-row',
        ) as HTMLDetailsElement;
        if (parentRow) {
          parentRow.open = true;
        }
      }
    }

    // Update tab panel visibility
    for (const panel of tabPanels) {
      const tabPanel = panel as HTMLElement;
      const char = tabPanel.dataset.char;
      const isVisible = char === state.openCharacter;
      tabPanel.style.display = isVisible ? 'block' : 'none';
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

        // Add Pokemon count display
        if (pokemon.length > 0) {
          const countElement = document.createElement('div');
          countElement.className = 'pokemon-count-display';
          countElement.textContent = `${pokemon.length}匹のポケモン`;
          pokemonContainer.appendChild(countElement);
        }

        for (const p of pokemon) {
          const cardView = createPokemonCardView();
          cardView.update({
            pokemon: p,
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
      const tabButtons = element.querySelectorAll('.char-tab-button');

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

      const handleTabClick = (event: Event) => {
        const target = event.target as HTMLButtonElement;
        const char = target.dataset.char;

        if (char) {
          // Remove active state from all tabs in this row
          const parentRow = target.closest('.accordion-char-container');
          if (parentRow) {
            const siblingTabs = parentRow.querySelectorAll('.char-tab-button');
            for (const tab of siblingTabs) {
              tab.classList.remove('active');
            }
          }

          // Add active state to clicked tab
          target.classList.add('active');

          const typedView = view as TypedView<AccordionViewState> &
            EventEmitter<AccordionViewEvents>;

          typedView.emit('accordion:character-select', char);

          // Don't call view.update here - let the controller handle the state update
          // This prevents the DOM manipulation conflict
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

      // Add click listeners to tab buttons
      for (const button of tabButtons) {
        button.addEventListener('click', handleTabClick);
      }

      // Add Pokemon selection listener to container
      element.addEventListener('accordion:pokemon-select', handlePokemonSelect);

      return () => {
        for (const details of rowDetails) {
          details.removeEventListener('toggle', handleRowToggle);
        }
        for (const button of tabButtons) {
          button.removeEventListener('click', handleTabClick);
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

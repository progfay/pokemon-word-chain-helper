/**
 * Accordion View Custom Element
 * Secure, performant replacement for innerHTML-based accordion view
 */

import type { PokemonObject } from '../types/index.js';
import { 
  registerCustomElement,
  createElement,
  createTextElement,
  updateElementContent,
  toggleClass,
  type BaseCustomElement
} from '../utils/customElement.js';
import { createEventEmitter } from '../utils/eventEmitter.js';
import type { EventMap } from '../utils/eventEmitter.js';
import { JAPANESE_ROWS } from '../utils/japaneseConstants.js';
import { createPokemonCardElement, type PokemonCardElement } from './pokemonCardElement.js';

export interface AccordionViewState extends Record<string, unknown> {
  openRowIndex?: number;
  openCharacter?: string;
  pokemonData: { [char: string]: PokemonObject[] };
  usedPokemon: PokemonObject[];
  isLoading: boolean;
  errorMessage?: string;
}

const ACCORDION_VIEW_STYLES = `
  :host {
    display: block;
    width: 100%;
  }

  .accordion-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
  }

  .accordion-header {
    text-align: center;
    padding: var(--spacing);
    border-bottom: 1px solid #ddd;
  }

  .accordion-header h3 {
    margin: 0;
    color: var(--primary-color);
    font-size: 1.2rem;
  }

  .accordion {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .accordion-row {
    border: 1px solid #ddd;
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  .accordion-row-header {
    background: var(--secondary-color);
    padding: var(--spacing);
    cursor: pointer;
    font-weight: bold;
    color: var(--primary-color);
    user-select: none;
    display: block;
    margin: 0;
  }

  .accordion-row-header:hover {
    background: #e8f4fd;
  }

  .accordion-char-container {
    padding: var(--spacing);
    background: white;
  }

  .char-tab-nav {
    display: flex;
    gap: 0.25rem;
    margin-bottom: var(--spacing);
    flex-wrap: wrap;
  }

  .char-tab-button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    border-radius: var(--border-radius);
    transition: all 0.2s ease;
    font-weight: 500;
  }

  .char-tab-button:hover {
    background: var(--secondary-color);
    border-color: var(--primary-color);
  }

  .char-tab-button.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }

  .char-tab-content {
    min-height: 100px;
  }

  .tab-panel {
    display: none;
  }

  .tab-panel.active {
    display: block;
  }

  .accordion-pokemon-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
  }

  .pokemon-count-display {
    text-align: center;
    font-weight: bold;
    color: var(--primary-color);
    padding: 0.5rem;
    background: var(--secondary-color);
    border-radius: var(--border-radius);
  }

  .pokemon-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing);
  }

  .accordion-error {
    padding: var(--spacing);
    background: #fee;
    border: 1px solid #fcc;
    border-radius: var(--border-radius);
    color: #c00;
    font-weight: 500;
    text-align: center;
  }

  .accordion-error.hidden {
    display: none;
  }
`;

class AccordionElement extends HTMLElement implements BaseCustomElement {
  private eventEmitter = createEventEmitter<EventMap>();
  private state: AccordionViewState = {} as AccordionViewState;
  private isDestroyed = false;
  private pokemonCards: Map<string, PokemonCardElement[]> = new Map();
  private elements: {
    container?: HTMLElement;
    header?: HTMLElement;
    accordion?: HTMLElement;
    error?: HTMLElement;
    rowDetails?: NodeListOf<HTMLDetailsElement>;
    tabButtons?: NodeListOf<HTMLButtonElement>;
    tabPanels?: NodeListOf<HTMLElement>;
  } = {};

  constructor() {
    super();
    
    // Set up shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Apply styles
    const styleElement = document.createElement('style');
    styleElement.textContent = ACCORDION_VIEW_STYLES;
    this.shadowRoot?.appendChild(styleElement);
    
    this.onCreate();
  }

  connectedCallback() {
    if (!this.isDestroyed) {
      this.onMount();
    }
  }

  disconnectedCallback() {
    this.destroy();
  }

  private onCreate(): void {
    // Create DOM structure safely
    this.elements.container = createElement('div', { class: 'accordion-container' });
    
    // Header section
    this.elements.header = createElement('div', { class: 'accordion-header' });
    const headerTitle = createTextElement('h3', '文字を選択してください');
    this.elements.header.appendChild(headerTitle);
    
    // Accordion section
    this.elements.accordion = createElement('div', { class: 'accordion' });
    
    // Create accordion structure for each Japanese row
    for (let i = 0; i < JAPANESE_ROWS.length; i++) {
      const row = JAPANESE_ROWS[i];
      const rowDetails = createElement('details', { 
        class: 'accordion-row',
        'data-row-index': i.toString()
      }) as HTMLDetailsElement;

      const rowSummary = createElement('summary', { class: 'accordion-row-header' });
      updateElementContent(rowSummary, row.name);

      const charContainer = createElement('div', { class: 'accordion-char-container' });

      // Create tab navigation
      const tabNav = createElement('div', { class: 'char-tab-nav' });
      for (const char of row.chars) {
        const tabButton = createElement('button', { 
          class: 'char-tab-button',
          'data-char': char
        }) as HTMLButtonElement;
        updateElementContent(tabButton, char);
        tabNav.appendChild(tabButton);
      }

      // Create tab content container
      const tabContent = createElement('div', { class: 'char-tab-content' });

      // Create Pokemon containers for each character
      for (const char of row.chars) {
        const pokemonContainer = createElement('div', { 
          class: 'accordion-pokemon-container tab-panel',
          'data-char': char
        });
        tabContent.appendChild(pokemonContainer);
      }

      charContainer.appendChild(tabNav);
      charContainer.appendChild(tabContent);
      rowDetails.appendChild(rowSummary);
      rowDetails.appendChild(charContainer);
      this.elements.accordion.appendChild(rowDetails);
    }
    
    // Error section
    this.elements.error = createElement('div', { class: 'accordion-error hidden' });
    
    // Assemble structure
    this.elements.container.appendChild(this.elements.header);
    this.elements.container.appendChild(this.elements.accordion);
    this.elements.container.appendChild(this.elements.error);
    
    this.shadowRoot?.appendChild(this.elements.container);
    
    // Cache DOM queries
    this.elements.rowDetails = this.shadowRoot?.querySelectorAll('details.accordion-row');
    this.elements.tabButtons = this.shadowRoot?.querySelectorAll('.char-tab-button');
    this.elements.tabPanels = this.shadowRoot?.querySelectorAll('.tab-panel');
    
    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.elements.rowDetails || !this.elements.tabButtons) return;

    // Row toggle listeners
    for (const details of this.elements.rowDetails) {
      details.addEventListener('toggle', (event) => {
        const target = event.target as HTMLDetailsElement;
        const rowIndex = Number.parseInt(target.dataset.rowIndex || '-1', 10);

        if (rowIndex >= 0) {
          // When a row is opened, close other rows
          if (target.open) {
            if (this.elements.rowDetails) {
              for (let i = 0; i < this.elements.rowDetails.length; i++) {
                if (i !== rowIndex) {
                  (this.elements.rowDetails[i] as HTMLDetailsElement).open = false;
                }
              }
            }
            this.update({
              openRowIndex: rowIndex,
              openCharacter: undefined,
            });
          } else {
            this.update({
              openRowIndex: undefined,
              openCharacter: undefined,
            });
          }
        }
      });
    }

    // Tab button listeners
    for (const button of this.elements.tabButtons) {
      button.addEventListener('click', (event) => {
        const target = event.target as HTMLButtonElement;
        const char = target.dataset.char;

        if (char) {
          // Update tab states
          const parentRow = target.closest('.accordion-char-container');
          if (parentRow) {
            const siblingTabs = parentRow.querySelectorAll('.char-tab-button');
            for (const tab of siblingTabs) {
              tab.classList.remove('active');
            }
          }
          target.classList.add('active');

          // Update panel visibility
          const parentAccordion = target.closest('.accordion-row');
          if (parentAccordion) {
            const panels = parentAccordion.querySelectorAll('.tab-panel');
            for (const panel of panels) {
              const panelElement = panel as HTMLElement;
              const isVisible = panelElement.dataset.char === char;
              toggleClass(panelElement, 'active', isVisible);
            }
          }

          this.emit('accordion:character-select', char);
        }
      });
    }
  }

  private onMount(): void {
    // Component mounted to DOM
  }

  private updatePokemonData(pokemonData: { [char: string]: PokemonObject[] }, usedPokemon: PokemonObject[]): void {
    const usedNames = new Set(usedPokemon.map((p) => p.name));

    for (const char in pokemonData) {
      const pokemonContainer = this.shadowRoot?.querySelector(
        `.accordion-pokemon-container[data-char="${char}"]`
      ) as HTMLElement;

      if (pokemonContainer) {
        // Clear existing content
        while (pokemonContainer.firstChild) {
          pokemonContainer.removeChild(pokemonContainer.firstChild);
        }

        // Clear stored cards for this character
        this.pokemonCards.delete(char);

        const pokemon = pokemonData[char] || [];

        // Add Pokemon count display
        if (pokemon.length > 0) {
          const countElement = createElement('div', { class: 'pokemon-count-display' });
          updateElementContent(countElement, `${pokemon.length}匹のポケモン`);
          pokemonContainer.appendChild(countElement);
        }

        // Create cards grid
        const cardsGrid = createElement('div', { class: 'pokemon-cards-grid' });
        const cards: PokemonCardElement[] = [];

        for (const p of pokemon) {
          const cardElement = createPokemonCardElement();
          cardElement.update({
            pokemon: p,
            isSelected: false,
            isDisabled: usedNames.has(p.name),
            hints: {
              showImage: 'hidden',
              showTypes: false,
              showGeneration: false,
              showGenus: false,
              showName: false,
            },
          });

          // Add click handler for Pokemon selection
          cardElement.on('card:click', (...args: unknown[]) => {
            this.emit('accordion:pokemon-select', args[0] as PokemonObject);
          });

          cardsGrid.appendChild(cardElement);
          cards.push(cardElement);
        }

        pokemonContainer.appendChild(cardsGrid);
        this.pokemonCards.set(char, cards);
      }
    }
  }

  // BaseCustomElement interface
  on(event: string, callback: (...args: unknown[]) => void): void {
    this.eventEmitter.on(event, callback);
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
    this.eventEmitter.off(event, callback);
  }

  emit(event: string, ...args: unknown[]): void {
    this.eventEmitter.emit(event, ...args);
  }

  getElement(): HTMLElement {
    return this;
  }

  render(): HTMLElement {
    return this;
  }

  update(data: Partial<AccordionViewState>): void {
    if (this.isDestroyed) return;
    
    this.state = { ...this.state, ...data };
    
    // Update open/closed state of row accordions
    if ('openRowIndex' in data && this.elements.rowDetails) {
      for (let i = 0; i < this.elements.rowDetails.length; i++) {
        const detailsElement = this.elements.rowDetails[i];
        const isOpen = data.openRowIndex === i;
        detailsElement.open = isOpen;
      }
    }

    // Update active tab and visible panel
    if ('openCharacter' in data && this.elements.tabButtons && this.elements.tabPanels) {
      // Update tab button states
      for (const button of this.elements.tabButtons) {
        const char = button.dataset.char;
        const isActive = char === data.openCharacter;
        toggleClass(button, 'active', isActive);

        // If activating a character, ensure its parent row stays open
        if (isActive) {
          const parentRow = button.closest('details.accordion-row') as HTMLDetailsElement;
          if (parentRow) {
            parentRow.open = true;
          }
        }
      }

      // Update tab panel visibility
      for (const panel of this.elements.tabPanels) {
        const char = panel.dataset.char;
        const isVisible = char === data.openCharacter;
        toggleClass(panel, 'active', isVisible);
      }
    }

    // Update Pokemon data for each character
    if (data.pokemonData || data.usedPokemon) {
      this.updatePokemonData(data.pokemonData || {}, data.usedPokemon || []);
    }

    // Update error message
    if ('errorMessage' in data && this.elements.error) {
      updateElementContent(this.elements.error, data.errorMessage || '');
      toggleClass(this.elements.error, 'hidden', !data.errorMessage);
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // Cleanup Pokemon cards
    for (const cards of this.pokemonCards.values()) {
      for (const card of cards) {
        card.destroy();
      }
    }
    this.pokemonCards.clear();
    this.elements = {};
    
    this.eventEmitter.removeAllListeners();
  }

  isElementConnected(): boolean {
    return super.isConnected && !this.isDestroyed;
  }

  getState(): Record<string, unknown> {
    return { ...this.state };
  }
}

// Register the custom element
registerCustomElement('accordion-view', AccordionElement);

/**
 * Factory function to create accordion view instances
 */
export function createAccordionElement(): AccordionElement {
  const element = new AccordionElement();
  
  // Initialize with default state
  element.update({
    openRowIndex: undefined,
    openCharacter: undefined,
    pokemonData: {},
    usedPokemon: [],
    isLoading: false,
    errorMessage: undefined
  });
  
  return element;
}

export { AccordionElement };
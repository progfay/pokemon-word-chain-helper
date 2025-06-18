/**
 * Search View Custom Element
 * Secure, performant replacement for innerHTML-based search view
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
import { createAccordionElement, type AccordionElement } from './accordionElement.js';

export interface SearchViewState extends Record<string, unknown> {
  openRowIndex?: number;
  openCharacter?: string;
  pokemonData: { [char: string]: PokemonObject[] };
  usedPokemon: PokemonObject[];
  isLoading: boolean;
  errorMessage?: string;
}

const SEARCH_VIEW_STYLES = `
  :host {
    display: block;
    width: 100%;
  }

  .search-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing);
  }

  .search-header {
    text-align: center;
    padding: var(--spacing);
    border-bottom: 1px solid #ddd;
  }

  .search-header h2 {
    margin: 0;
    color: var(--primary-color);
    font-size: 1.5rem;
  }

  .search-selected-display {
    padding: var(--spacing);
    background: var(--secondary-color);
    border-radius: var(--border-radius);
    text-align: center;
  }

  .search-selected-display p {
    margin: 0;
    font-size: 1rem;
    color: var(--text-color);
  }

  .selected-char {
    font-weight: bold;
    color: var(--primary-color);
  }

  .search-error {
    padding: var(--spacing);
    background: #fee;
    border: 1px solid #fcc;
    border-radius: var(--border-radius);
    color: #c00;
    font-weight: 500;
    text-align: center;
  }

  .search-error.hidden {
    display: none;
  }
`;

class SearchViewElement extends HTMLElement implements BaseCustomElement {
  private eventEmitter = createEventEmitter<EventMap>();
  private state: SearchViewState = {} as SearchViewState;
  private isDestroyed = false;
  private accordionElement?: AccordionElement;
  private elements: {
    container?: HTMLElement;
    header?: HTMLElement;
    selectedDisplay?: HTMLElement;
    selectedChar?: HTMLElement;
    error?: HTMLElement;
  } = {};

  constructor() {
    super();
    
    // Set up shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Apply styles
    const styleElement = document.createElement('style');
    styleElement.textContent = SEARCH_VIEW_STYLES;
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
    this.elements.container = createElement('div', { class: 'search-container' });
    
    // Header section
    this.elements.header = createElement('div', { class: 'search-header' });
    const headerTitle = createTextElement('h2', 'ポケモン検索');
    this.elements.header.appendChild(headerTitle);
    
    // Selected display section
    this.elements.selectedDisplay = createElement('div', { class: 'search-selected-display' });
    const selectedText = createElement('p');
    selectedText.appendChild(createTextElement('span', '選択された文字: '));
    this.elements.selectedChar = createElement('span', { class: 'selected-char' });
    updateElementContent(this.elements.selectedChar, 'なし');
    selectedText.appendChild(this.elements.selectedChar);
    this.elements.selectedDisplay.appendChild(selectedText);
    
    // Error section
    this.elements.error = createElement('div', { class: 'search-error hidden' });
    
    // Create accordion element
    this.accordionElement = createAccordionElement();
    
    // Assemble structure
    this.elements.container.appendChild(this.elements.header);
    this.elements.container.appendChild(this.elements.selectedDisplay);
    this.elements.container.appendChild(this.elements.error);
    this.elements.container.appendChild(this.accordionElement);
    
    this.shadowRoot?.appendChild(this.elements.container);
    
    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.accordionElement) return;

    // Forward accordion events as search events
    this.accordionElement.on('accordion:character-select', (...args: unknown[]) => {
      this.emit('search:character-select', args[0] as string);
    });

    this.accordionElement.on('accordion:pokemon-select', (...args: unknown[]) => {
      this.emit('search:pokemon-select', args[0] as PokemonObject);
    });

    this.accordionElement.on('accordion:clear', () => {
      this.emit('search:clear');
    });
  }

  private onMount(): void {
    // Component mounted to DOM
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

  update(data: Partial<SearchViewState>): void {
    if (this.isDestroyed) return;
    
    this.state = { ...this.state, ...data };
    
    // Update selected character display
    if (data.openCharacter !== undefined && this.elements.selectedChar) {
      updateElementContent(this.elements.selectedChar, data.openCharacter || 'なし');
    }

    // Update error message
    if ('errorMessage' in data && this.elements.error) {
      updateElementContent(this.elements.error, data.errorMessage || '');
      toggleClass(this.elements.error, 'hidden', !data.errorMessage);
    }

    // Update accordion element
    if (this.accordionElement) {
      const accordionState = {
        openCharacter: data.openCharacter,
        openRowIndex: data.openRowIndex,
        pokemonData: data.pokemonData || {},
        usedPokemon: data.usedPokemon || [],
        isLoading: data.isLoading,
        errorMessage: data.errorMessage,
      };
      this.accordionElement.update(accordionState);
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // Cleanup accordion element
    if (this.accordionElement) {
      this.accordionElement.destroy();
      this.accordionElement = undefined;
    }
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
registerCustomElement('search-view', SearchViewElement);

/**
 * Factory function to create search view instances
 */
export function createSearchViewElement(): SearchViewElement {
  const element = new SearchViewElement();
  
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

export { SearchViewElement };
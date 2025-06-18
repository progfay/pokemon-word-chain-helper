/**
 * Pokemon Card Custom Element
 * Secure, performant replacement for innerHTML-based Pokemon card
 */

import type { PokemonObject } from '../types/index.js';
import { 
  registerCustomElement,
  createElement,
  updateElementContent,
  toggleClass,
  type BaseCustomElement
} from '../utils/customElement.js';
import { createEventEmitter } from '../utils/eventEmitter.js';
import type { EventMap } from '../utils/eventEmitter.js';

const TYPE_ID_TO_NAME: Record<number, string> = {
  1: 'normal', 2: 'fire', 3: 'water', 4: 'electric', 5: 'grass', 6: 'ice',
  7: 'fighting', 8: 'poison', 9: 'ground', 10: 'flying', 11: 'psychic',
  12: 'bug', 13: 'rock', 14: 'ghost', 15: 'dragon', 16: 'dark',
  17: 'steel', 18: 'fairy',
};

export interface PokemonCardState extends Record<string, unknown> {
  pokemon: PokemonObject;
  isSelected: boolean;
  isDisabled: boolean;
  hints: {
    showImage: 'hidden' | 'silhouette' | 'full';
    showTypes: boolean;
    showGeneration: boolean;
    showGenus: boolean;
    showName: boolean;
  };
}

const INITIAL_HINTS: PokemonCardState['hints'] = {
  showImage: 'hidden',
  showTypes: false,
  showGeneration: false,
  showGenus: false,
  showName: false,
};

const POKEMON_CARD_STYLES = `
  :host {
    display: block;
    background: var(--card-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid #ddd;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    overflow: hidden;
    padding: var(--spacing);
  }

  :host(:hover) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  :host(:active) {
    transform: translateY(0);
  }

  :host(.disabled) {
    opacity: 0.6;
    pointer-events: none;
  }

  :host(.selected) {
    border: 2px solid var(--primary-color);
    background: var(--secondary-color);
  }

  .container {
    display: flex;
    gap: var(--spacing);
    align-items: flex-start;
  }

  .checkbox-section {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 0.25rem;
  }

  .checkbox {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: var(--primary-color);
  }

  .image-section {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #eee;
    border-radius: var(--border-radius);
    background: #f9f9f9;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .image-section:hover {
    opacity: 0.8;
  }

  .image-section.image-hidden .pokemon-image {
    opacity: 0;
  }

  .image-section.image-visible .pokemon-image {
    opacity: 1;
  }

  .pokemon-image {
    max-width: 70px;
    max-height: 70px;
    object-fit: contain;
    transition: filter 0.3s ease;
  }

  .pokemon-image.silhouette {
    filter: brightness(0);
  }

  .info-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .number {
    font-size: 1rem;
    font-weight: bold;
    color: var(--text-color);
  }

  .name-section {
    cursor: pointer;
    padding: 0.25rem;
    border-radius: var(--border-radius);
    transition: background-color 0.2s ease;
  }

  .name-section:hover {
    background-color: var(--secondary-color);
  }

  .name-label {
    font-weight: bold;
    font-size: 1rem;
    color: var(--primary-color);
  }

  .name-label.hidden {
    color: #888;
    font-style: italic;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .detail-item {
    font-size: 0.9rem;
    color: var(--text-color);
    margin-bottom: 0;
    cursor: pointer;
    padding: 0.2rem;
    border-radius: var(--border-radius);
    transition: background-color 0.2s ease;
  }

  .detail-item:hover {
    background-color: var(--secondary-color);
  }

  .detail-item.hidden {
    color: #888;
    font-style: italic;
  }
`;

class PokemonCardElement extends HTMLElement implements BaseCustomElement {
  private eventEmitter = createEventEmitter<EventMap>();
  private state: PokemonCardState = {} as PokemonCardState;
  private isDestroyed = false;
  private elements: {
    container?: HTMLElement;
    checkbox?: HTMLInputElement;
    imageSection?: HTMLElement;
    pokemonImage?: HTMLImageElement;
    nameSection?: HTMLElement;
    nameLabel?: HTMLElement;
    detailsContainer?: HTMLElement;
    genusDetail?: HTMLElement;
    typesDetail?: HTMLElement;
    generationDetail?: HTMLElement;
  } = {};

  constructor() {
    super();
    
    // Set up shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Apply styles
    const styleElement = document.createElement('style');
    styleElement.textContent = POKEMON_CARD_STYLES;
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
    this.elements.container = createElement('div', { class: 'container' });
    
    // Checkbox section
    const checkboxSection = createElement('div', { class: 'checkbox-section' });
    this.elements.checkbox = createElement('input', { 
      type: 'checkbox',
      class: 'checkbox'
    }) as HTMLInputElement;
    checkboxSection.appendChild(this.elements.checkbox);
    
    // Image section
    this.elements.imageSection = createElement('div', { 
      class: 'image-section image-hidden',
      'data-clickable': 'image'
    });
    this.elements.pokemonImage = createElement('img', {
      class: 'pokemon-image',
      loading: 'lazy',
      alt: ''
    }) as HTMLImageElement;
    this.elements.imageSection.appendChild(this.elements.pokemonImage);
    
    // Info section
    const infoSection = createElement('div', { class: 'info-section' });
    
    // Number element
    const numberElement = createElement('div', { class: 'number' });
    
    // Name section
    this.elements.nameSection = createElement('div', { 
      class: 'name-section',
      'data-clickable': 'name'
    });
    this.elements.nameLabel = createElement('span', { class: 'name-label' });
    this.elements.nameSection.appendChild(this.elements.nameLabel);
    
    // Details container
    this.elements.detailsContainer = createElement('div', { class: 'details' });
    
    this.elements.genusDetail = createElement('div', { 
      class: 'detail-item',
      'data-clickable': 'genus'
    });
    
    this.elements.typesDetail = createElement('div', { 
      class: 'detail-item',
      'data-clickable': 'types'
    });
    
    this.elements.generationDetail = createElement('div', { 
      class: 'detail-item',
      'data-clickable': 'generation'
    });
    
    // Assemble structure
    this.elements.detailsContainer.appendChild(this.elements.genusDetail);
    this.elements.detailsContainer.appendChild(this.elements.typesDetail);
    this.elements.detailsContainer.appendChild(this.elements.generationDetail);
    
    infoSection.appendChild(numberElement);
    infoSection.appendChild(this.elements.nameSection);
    infoSection.appendChild(this.elements.detailsContainer);
    
    this.elements.container.appendChild(checkboxSection);
    this.elements.container.appendChild(this.elements.imageSection);
    this.elements.container.appendChild(infoSection);
    
    this.shadowRoot?.appendChild(this.elements.container);
    
    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Checkbox change
    this.elements.checkbox?.addEventListener('change', () => {
      this.emit('card:click', this.state.pokemon);
    });

    // Click handlers for hints
    this.elements.imageSection?.addEventListener('click', () => {
      this.handleHintToggle('image');
    });

    this.elements.nameSection?.addEventListener('click', () => {
      this.handleHintToggle('name');
    });

    this.elements.genusDetail?.addEventListener('click', () => {
      this.handleHintToggle('genus');
    });

    this.elements.typesDetail?.addEventListener('click', () => {
      this.handleHintToggle('types');
    });

    this.elements.generationDetail?.addEventListener('click', () => {
      this.handleHintToggle('generation');
    });
  }

  private handleHintToggle(hintType: string): void {
    const newHints = { ...this.state.hints };

    switch (hintType) {
      case 'image': {
        const imageStates = ['hidden', 'silhouette', 'full'] as const;
        const currentIndex = imageStates.indexOf(newHints.showImage);
        const nextIndex = (currentIndex + 1) % imageStates.length;
        newHints.showImage = imageStates[nextIndex];
        break;
      }
      case 'name':
        newHints.showName = !newHints.showName;
        break;
      case 'genus':
        newHints.showGenus = !newHints.showGenus;
        break;
      case 'types':
        newHints.showTypes = !newHints.showTypes;
        break;
      case 'generation':
        newHints.showGeneration = !newHints.showGeneration;
        break;
    }

    this.update({ hints: newHints });
  }

  private onMount(): void {
    // Component mounted to DOM
  }

  private updatePokemonData(pokemon: PokemonObject): void {
    if (!pokemon) return;

    // Update number
    const numberElement = this.shadowRoot?.querySelector('.number') as HTMLElement;
    if (numberElement) {
      updateElementContent(numberElement, `No.${pokemon.pokedex_number}`);
    }

    // Update image
    if (this.elements.pokemonImage) {
      const paddedNumber = pokemon.pokedex_number.toString().padStart(3, '0');
      this.elements.pokemonImage.src = 
        `https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/${paddedNumber}.png`;
      this.elements.pokemonImage.alt = pokemon.name;
    }
  }

  private updateHints(hints: Partial<PokemonCardState['hints']>): void {
    const pokemon = this.state.pokemon;
    if (!pokemon) return;

    // Update image visibility and silhouette
    if (hints.showImage !== undefined && this.elements.imageSection && this.elements.pokemonImage) {
      this.elements.imageSection.className = `image-section ${
        hints.showImage !== 'hidden' ? 'image-visible' : 'image-hidden'
      }`;
      toggleClass(this.elements.pokemonImage, 'silhouette', hints.showImage === 'silhouette');
    }

    // Update name
    if (hints.showName !== undefined && this.elements.nameLabel) {
      updateElementContent(
        this.elements.nameLabel, 
        hints.showName ? `**${pokemon.name}**` : '**Pokemon Name**'
      );
      toggleClass(this.elements.nameLabel, 'hidden', !hints.showName);
    }

    // Update genus
    if (hints.showGenus !== undefined && this.elements.genusDetail) {
      updateElementContent(
        this.elements.genusDetail,
        hints.showGenus ? `- ${pokemon.genus}ポケモン` : '- (Genus)'
      );
      toggleClass(this.elements.genusDetail, 'hidden', !hints.showGenus);
    }

    // Update types
    if (hints.showTypes !== undefined && this.elements.typesDetail) {
      const typesText = hints.showTypes 
        ? `- ${pokemon.types.map((type: number) => TYPE_ID_TO_NAME[type] || 'unknown').join(', ')}`
        : '- (Types)';
      updateElementContent(this.elements.typesDetail, typesText);
      toggleClass(this.elements.typesDetail, 'hidden', !hints.showTypes);
    }

    // Update generation
    if (hints.showGeneration !== undefined && this.elements.generationDetail) {
      updateElementContent(
        this.elements.generationDetail,
        hints.showGeneration ? `- Gen ${pokemon.generation_id}` : '- (Generation)'
      );
      toggleClass(this.elements.generationDetail, 'hidden', !hints.showGeneration);
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

  update(data: Partial<PokemonCardState>): void {
    if (this.isDestroyed) return;
    
    // Previous state not needed for current implementation
    this.state = { ...this.state, ...data };
    
    if (data.pokemon) {
      this.updatePokemonData(data.pokemon);
    }
    
    if (data.hints) {
      this.updateHints(data.hints);
    }
    
    if (data.isSelected !== undefined) {
      this.classList.toggle('selected', data.isSelected);
      if (this.elements.checkbox) {
        this.elements.checkbox.checked = data.isSelected;
      }
    }
    
    if (data.isDisabled !== undefined) {
      this.classList.toggle('disabled', data.isDisabled);
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    this.eventEmitter.removeAllListeners();
    this.elements = {};
  }

  isElementConnected(): boolean {
    return super.isConnected && !this.isDestroyed;
  }

  getState(): Record<string, unknown> {
    return { ...this.state };
  }
}

// Register the custom element
registerCustomElement('pokemon-card', PokemonCardElement);

/**
 * Factory function to create Pokemon card instances
 */
export function createPokemonCardElement(): PokemonCardElement {
  const element = new PokemonCardElement();
  
  // Initialize with default state
  element.update({
    pokemon: undefined as unknown as PokemonObject,
    isSelected: false,
    isDisabled: false,
    hints: INITIAL_HINTS
  });
  
  return element;
}

export { PokemonCardElement };
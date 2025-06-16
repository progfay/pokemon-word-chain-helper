import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Pokemon } from '../../types/index.js';
import { createPokemonCardView } from '../../views/pokemonCardView.js';

describe('PokemonCardView', () => {
  let container: HTMLElement;
  let pokemonCardView: ReturnType<typeof createPokemonCardView>;
  const samplePokemon: Pokemon = {
    name: 'ピカチュウ',
    genus: 'ねずみポケモン',
    generation_id: 1,
    pokedex_number: 25,
    types: ['electric'],
    firstChar: 'ピ',
    lastChar: 'ウ',
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    pokemonCardView = createPokemonCardView();
    container.appendChild(pokemonCardView.render());
  });

  it('should render pokemon card with correct data', () => {
    pokemonCardView.update({
      pokemon: samplePokemon,
      isHighlighted: false,
      isSelected: false,
      isDisabled: false,
      hints: {
        showImage: 'hidden',
        showTypes: false,
        showGeneration: false,
        showGenus: true,
        showName: true,
      },
    });

    const element = pokemonCardView.render();
    expect(element.textContent).toContain('ピカチュウ');
    expect(element.textContent).toContain('ねずみポケモン');
    expect(element.textContent).toContain('#025');
  });

  it('should emit card:click event when clicked', () => {
    const mockCallback = vi.fn();
    pokemonCardView.on('card:click', mockCallback);

    pokemonCardView.update({
      pokemon: samplePokemon,
      isHighlighted: false,
      isSelected: false,
      isDisabled: false,
    });

    pokemonCardView.render().click();
    expect(mockCallback).toHaveBeenCalledWith(samplePokemon);
  });

  describe('Hint button functionality', () => {
    beforeEach(() => {
      pokemonCardView.update({
        pokemon: samplePokemon,
        isHighlighted: false,
        isSelected: false,
        isDisabled: false,
        hints: {
          showImage: 'hidden',
          showTypes: false,
          showGeneration: false,
          showGenus: false,
          showName: false,
        },
      });
    });

    it('should toggle types hint when types button is clicked', () => {
      const element = pokemonCardView.render();
      const typesButton = element.querySelector('[data-hint="showTypes"]') as HTMLButtonElement;
      
      expect(typesButton).toBeTruthy();
      expect(element.querySelector('.pokemon-card__types')).toBeNull();
      
      typesButton.click();
      
      expect(element.querySelector('.pokemon-card__types')).toBeTruthy();
      expect(element.textContent).toContain('electric');
    });

    it('should toggle generation hint when generation button is clicked', () => {
      const element = pokemonCardView.render();
      const generationButton = element.querySelector('[data-hint="showGeneration"]') as HTMLButtonElement;
      
      expect(generationButton).toBeTruthy();
      expect(element.querySelector('.pokemon-card__generation')).toBeNull();
      
      generationButton.click();
      
      expect(element.querySelector('.pokemon-card__generation')).toBeTruthy();
      expect(element.textContent).toContain('Gen 1');
    });

    it('should toggle genus hint when genus button is clicked', () => {
      const element = pokemonCardView.render();
      const genusButton = element.querySelector('[data-hint="showGenus"]') as HTMLButtonElement;
      
      expect(genusButton).toBeTruthy();
      expect(element.querySelector('.pokemon-card__genus')).toBeNull();
      
      genusButton.click();
      
      expect(element.querySelector('.pokemon-card__genus')).toBeTruthy();
      expect(element.textContent).toContain('ねずみポケモン');
    });

    it('should cycle through image states when image button is clicked', () => {
      const element = pokemonCardView.render();
      const imageButton = element.querySelector('[data-hint="showImage"]') as HTMLButtonElement;
      
      expect(imageButton).toBeTruthy();
      expect(element.querySelector('.pokemon-card__image')).toBeNull();
      
      // First click: show silhouette
      imageButton.click();
      let imageContainer = element.querySelector('.pokemon-card__image');
      expect(imageContainer).toBeTruthy();
      expect(imageContainer?.classList.contains('silhouette')).toBe(true);
      
      // Second click: show full image
      imageButton.click();
      imageContainer = element.querySelector('.pokemon-card__image');
      expect(imageContainer).toBeTruthy();
      expect(imageContainer?.classList.contains('silhouette')).toBe(false);
      
      // Third click: hide image
      imageButton.click();
      expect(element.querySelector('.pokemon-card__image')).toBeNull();
    });

    it('should not emit card:click when hint button is clicked', () => {
      const mockCallback = vi.fn();
      pokemonCardView.on('card:click', mockCallback);
      
      const element = pokemonCardView.render();
      const typesButton = element.querySelector('[data-hint="showTypes"]') as HTMLButtonElement;
      
      typesButton.click();
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should toggle name hint when name button is clicked', () => {
      const element = pokemonCardView.render();
      const nameButton = element.querySelector('[data-hint="showName"]') as HTMLButtonElement;
      
      expect(nameButton).toBeTruthy();
      expect(element.querySelector('.pokemon-card__name')?.textContent).toBe('???');
      
      nameButton.click();
      
      expect(element.querySelector('.pokemon-card__name')?.textContent).toBe('ピカチュウ');
    });

    it('should hide Pokemon name by default', () => {
      const element = pokemonCardView.render();
      
      expect(element.querySelector('.pokemon-card__name')?.textContent).toBe('???');
    });

    it('should add active class to hint buttons when hints are shown', () => {
      pokemonCardView.update({
        pokemon: samplePokemon,
        isHighlighted: false,
        isSelected: false,
        isDisabled: false,
        hints: {
          showImage: 'full',
          showTypes: true,
          showGeneration: true,
          showGenus: true,
          showName: true,
        },
      });

      const element = pokemonCardView.render();
      const imageButton = element.querySelector('[data-hint="showImage"]') as HTMLButtonElement;
      const typesButton = element.querySelector('[data-hint="showTypes"]') as HTMLButtonElement;
      const generationButton = element.querySelector('[data-hint="showGeneration"]') as HTMLButtonElement;
      const genusButton = element.querySelector('[data-hint="showGenus"]') as HTMLButtonElement;
      const nameButton = element.querySelector('[data-hint="showName"]') as HTMLButtonElement;

      expect(imageButton.classList.contains('active')).toBe(true);
      expect(typesButton.classList.contains('active')).toBe(true);
      expect(generationButton.classList.contains('active')).toBe(true);
      expect(genusButton.classList.contains('active')).toBe(true);
      expect(nameButton.classList.contains('active')).toBe(true);
    });
  });
});

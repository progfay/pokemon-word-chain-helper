import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PokemonObject } from '../../types/index.js';
import { createPokemonCardView } from '../../views/pokemonCardView.js';

describe('PokemonCardView', () => {
  let container: HTMLElement;
  let pokemonCardView: ReturnType<typeof createPokemonCardView>;
  const samplePokemon: PokemonObject = {
    name: 'ピカチュウ',
    genus: 'ねずみポケモン',
    generation_id: 1,
    pokedex_number: 25,
    types: [4], // electric = 4
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
    expect(element.textContent).toContain('No.25');
  });

  it('should emit card:click event when checkbox is clicked', () => {
    const mockCallback = vi.fn();
    pokemonCardView.on('card:click', mockCallback);

    pokemonCardView.update({
      pokemon: samplePokemon,
      isSelected: false,
      isDisabled: false,
    });

    const checkbox = pokemonCardView
      .render()
      .querySelector('.pokemon-card__checkbox') as HTMLInputElement;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    expect(mockCallback).toHaveBeenCalledWith(samplePokemon);
  });

  describe('Hint button functionality', () => {
    beforeEach(() => {
      pokemonCardView.update({
        pokemon: samplePokemon,
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

    it('should toggle types hint when types section is clicked', () => {
      const element = pokemonCardView.render();
      const typesSection = element.querySelector(
        '[data-clickable="types"]',
      ) as HTMLElement;

      expect(typesSection).toBeTruthy();
      expect(element.textContent).toContain('(Types)');

      typesSection.click();

      expect(element.textContent).toContain('electric');
    });

    it('should toggle generation hint when generation section is clicked', () => {
      const element = pokemonCardView.render();
      const generationSection = element.querySelector(
        '[data-clickable="generation"]',
      ) as HTMLElement;

      expect(generationSection).toBeTruthy();
      expect(element.textContent).toContain('(Generation)');

      generationSection.click();

      expect(element.textContent).toContain('Gen 1');
    });

    it('should toggle genus hint when genus section is clicked', () => {
      const element = pokemonCardView.render();
      const genusSection = element.querySelector(
        '[data-clickable="genus"]',
      ) as HTMLElement;

      expect(genusSection).toBeTruthy();
      expect(element.textContent).toContain('(Genus)');

      genusSection.click();

      expect(element.textContent).toContain('ねずみポケモン');
    });

    it('should cycle through image states when image section is clicked', () => {
      // Initialize the card with Pokemon data
      pokemonCardView.update({
        pokemon: samplePokemon,
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

      let element = pokemonCardView.render();
      let imageSection = element.querySelector(
        '[data-clickable="image"]',
      ) as HTMLElement;

      expect(imageSection).toBeTruthy();
      expect(imageSection.classList.contains('image-hidden')).toBe(true);

      // First click: show silhouette
      imageSection.click();
      element = pokemonCardView.render(); // Re-render to get updated DOM
      imageSection = element.querySelector(
        '[data-clickable="image"]',
      ) as HTMLElement;
      expect(imageSection.classList.contains('image-visible')).toBe(true);
      let pokemonImage = element.querySelector('.pokemon-image');
      expect(pokemonImage?.classList.contains('silhouette')).toBe(true);

      // Second click: show full image
      imageSection.click();
      element = pokemonCardView.render(); // Re-render to get updated DOM
      pokemonImage = element.querySelector('.pokemon-image');
      expect(pokemonImage?.classList.contains('silhouette')).toBe(false);

      // Third click: hide image
      imageSection = element.querySelector(
        '[data-clickable="image"]',
      ) as HTMLElement;
      imageSection.click();
      element = pokemonCardView.render(); // Re-render to get updated DOM
      imageSection = element.querySelector(
        '[data-clickable="image"]',
      ) as HTMLElement;
      expect(imageSection.classList.contains('image-hidden')).toBe(true);
    });

    it('should not emit card:click when hint section is clicked', () => {
      const mockCallback = vi.fn();
      pokemonCardView.on('card:click', mockCallback);

      const element = pokemonCardView.render();
      const typesSection = element.querySelector(
        '[data-clickable="types"]',
      ) as HTMLElement;

      typesSection.click();

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should toggle name hint when name section is clicked', () => {
      const element = pokemonCardView.render();
      const nameSection = element.querySelector(
        '[data-clickable="name"]',
      ) as HTMLElement;

      expect(nameSection).toBeTruthy();
      expect(element.textContent).toContain('**Pokemon Name**');

      nameSection.click();

      expect(element.textContent).toContain('**ピカチュウ**');
    });

    it('should hide Pokemon name by default', () => {
      const element = pokemonCardView.render();

      expect(element.textContent).toContain('**Pokemon Name**');
    });

    it('should show correct content when hints are revealed', () => {
      pokemonCardView.update({
        pokemon: samplePokemon,
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

      expect(element.textContent).toContain('**ピカチュウ**');
      expect(element.textContent).toContain('ねずみポケモン');
      expect(element.textContent).toContain('electric');
      expect(element.textContent).toContain('Gen 1');

      const imageSection = element.querySelector('[data-clickable="image"]');
      expect(imageSection?.classList.contains('image-visible')).toBe(true);
    });
  });
});

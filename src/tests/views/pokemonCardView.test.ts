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
    // For Custom Elements with Shadow DOM, check shadowRoot content
    const shadowRoot = element.shadowRoot;
    expect(shadowRoot).toBeTruthy();
    expect(shadowRoot?.textContent).toContain('ピカチュウ');
    expect(shadowRoot?.textContent).toContain('ねずみポケモン');
    expect(shadowRoot?.textContent).toContain('No.25');
  });

  it('should emit card:click event when checkbox is clicked', () => {
    const mockCallback = vi.fn();
    pokemonCardView.on('card:click', mockCallback);

    pokemonCardView.update({
      pokemon: samplePokemon,
      isSelected: false,
      isDisabled: false,
    });

    const element = pokemonCardView.render();
    const shadowRoot = element.shadowRoot;
    const checkbox = shadowRoot?.querySelector('.checkbox') as HTMLInputElement | null;
    expect(checkbox).toBeTruthy();
    if (checkbox) {
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
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
      const shadowRoot = element.shadowRoot;
      expect(shadowRoot).toBeTruthy();
      const typesSection = shadowRoot?.querySelector(
        '[data-clickable="types"]',
      ) as HTMLElement | null;

      expect(typesSection).toBeTruthy();
      expect(shadowRoot?.textContent).toContain('(Types)');

      typesSection?.click();

      expect(shadowRoot?.textContent).toContain('electric');
    });

    it('should toggle generation hint when generation section is clicked', () => {
      const element = pokemonCardView.render();
      const shadowRoot = element.shadowRoot;
      expect(shadowRoot).toBeTruthy();
      const generationSection = shadowRoot?.querySelector(
        '[data-clickable="generation"]',
      ) as HTMLElement | null;

      expect(generationSection).toBeTruthy();
      expect(shadowRoot?.textContent).toContain('(Generation)');

      generationSection?.click();

      expect(shadowRoot?.textContent).toContain('Gen 1');
    });

    it('should toggle genus hint when genus section is clicked', () => {
      const element = pokemonCardView.render();
      const shadowRoot = element.shadowRoot;
      expect(shadowRoot).toBeTruthy();
      const genusSection = shadowRoot?.querySelector(
        '[data-clickable="genus"]',
      ) as HTMLElement | null;

      expect(genusSection).toBeTruthy();
      expect(shadowRoot?.textContent).toContain('(Genus)');

      genusSection?.click();

      expect(shadowRoot?.textContent).toContain('ねずみポケモン');
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

      const element = pokemonCardView.render();
      const shadowRoot = element.shadowRoot;
      expect(shadowRoot).toBeTruthy();
      let imageSection = shadowRoot?.querySelector(
        '[data-clickable="image"]',
      ) as HTMLElement | null;

      expect(imageSection).toBeTruthy();
      expect(imageSection?.classList.contains('image-hidden')).toBe(true);

      // First click: show silhouette
      imageSection?.click();
      imageSection = shadowRoot?.querySelector(
        '[data-clickable="image"]',
      ) as HTMLElement | null;
      expect(imageSection).toBeTruthy();
      expect(imageSection?.classList.contains('image-visible')).toBe(true);
      let pokemonImage = shadowRoot?.querySelector('.pokemon-image');
      expect(pokemonImage?.classList.contains('silhouette')).toBe(true);

      // Second click: show full image
      imageSection?.click();
      pokemonImage = shadowRoot?.querySelector('.pokemon-image');
      expect(pokemonImage?.classList.contains('silhouette')).toBe(false);

      // Third click: hide image
      imageSection = shadowRoot?.querySelector(
        '[data-clickable="image"]',
      ) as HTMLElement | null;
      imageSection?.click();
      imageSection = shadowRoot?.querySelector(
        '[data-clickable="image"]',
      ) as HTMLElement | null;
      expect(imageSection).toBeTruthy();
      expect(imageSection?.classList.contains('image-hidden')).toBe(true);
    });

    it('should not emit card:click when hint section is clicked', () => {
      const mockCallback = vi.fn();
      pokemonCardView.on('card:click', mockCallback);

      const element = pokemonCardView.render();
      const shadowRoot = element.shadowRoot;
      expect(shadowRoot).toBeTruthy();
      const typesSection = shadowRoot?.querySelector(
        '[data-clickable="types"]',
      ) as HTMLElement | null;

      typesSection?.click();

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should toggle name hint when name section is clicked', () => {
      const element = pokemonCardView.render();
      const shadowRoot = element.shadowRoot;
      expect(shadowRoot).toBeTruthy();
      const nameSection = shadowRoot?.querySelector(
        '[data-clickable="name"]',
      ) as HTMLElement | null;

      expect(nameSection).toBeTruthy();
      expect(shadowRoot?.textContent).toContain('**Pokemon Name**');

      nameSection?.click();

      expect(shadowRoot?.textContent).toContain('**ピカチュウ**');
    });

    it('should hide Pokemon name by default', () => {
      const element = pokemonCardView.render();
      const shadowRoot = element.shadowRoot;
      expect(shadowRoot).toBeTruthy();

      expect(shadowRoot?.textContent).toContain('**Pokemon Name**');
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
      const shadowRoot = element.shadowRoot;
      expect(shadowRoot).toBeTruthy();

      expect(shadowRoot?.textContent).toContain('**ピカチュウ**');
      expect(shadowRoot?.textContent).toContain('ねずみポケモン');
      expect(shadowRoot?.textContent).toContain('electric');
      expect(shadowRoot?.textContent).toContain('Gen 1');

      const imageSection = shadowRoot?.querySelector('[data-clickable="image"]');
      expect(imageSection?.classList.contains('image-visible')).toBe(true);
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PokemonObject } from '../../types/index.js';
import { createListView } from '../../views/listView.js';

describe('ListView', () => {
  let container: HTMLElement;
  let listView: ReturnType<typeof createListView>;
  const samplePokemon: PokemonObject[] = [
    {
      name: 'ピカチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 25,
      types: [4], // electric
      firstChar: 'ピ',
      lastChar: 'ウ',
    },
    {
      name: 'ライチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 26,
      types: [4], // electric
      firstChar: 'ラ',
      lastChar: 'ウ',
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    listView = createListView();
    container.appendChild(listView.render());
  });

  it('should render a list of pokemon cards', () => {
    listView.update({
      items: samplePokemon,
      disabledItems: [],
    });

    const element = listView.render();
    const cards = element.querySelectorAll('.pokemon-card');
    expect(cards.length).toBe(2);
    // Pokemon names should be hidden by default, showing as "**Pokemon Name**"
    expect(element.textContent).toContain('**Pokemon Name**');
    // Should show Pokedex numbers
    expect(element.textContent).toContain('No.25');
    expect(element.textContent).toContain('No.26');
  });

  it('should emit item:click event when a card checkbox is clicked', () => {
    const mockCallback = vi.fn();
    listView.on('item:click', mockCallback);

    listView.update({
      items: samplePokemon,
      disabledItems: [],
    });

    const element = listView.render();
    const firstCheckbox = element.querySelector(
      '.pokemon-card__checkbox',
    ) as HTMLInputElement;
    firstCheckbox?.dispatchEvent(new Event('change', { bubbles: true }));

    expect(mockCallback).toHaveBeenCalledWith(samplePokemon[0]);
  });

  it('should update cards when items change', () => {
    listView.update({
      items: samplePokemon,
      disabledItems: [],
    });

    const element = listView.render();
    expect(element.querySelectorAll('.pokemon-card').length).toBe(2);

    listView.update({
      items: [samplePokemon[0]],
      disabledItems: [],
    });

    expect(element.querySelectorAll('.pokemon-card').length).toBe(1);
    // Check for Pokedex number instead of name since names are hidden
    expect(element.textContent).toContain('No.25');
    expect(element.textContent).not.toContain('No.26');
  });

  it('should handle disabled items', () => {
    listView.update({
      items: samplePokemon,
      disabledItems: [samplePokemon[0]],
    });

    const element = listView.render();
    const firstCard = element.querySelector('.pokemon-card');
    expect(firstCard?.classList.contains('pokemon-card--disabled')).toBe(true);
  });
});

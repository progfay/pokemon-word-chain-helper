import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Pokemon } from '../../types/index.js';
import { createListView } from '../../views/listView.js';

describe('ListView', () => {
  let container: HTMLElement;
  let listView: ReturnType<typeof createListView>;
  const samplePokemon: Pokemon[] = [
    {
      name: 'ピカチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 25,
      types: ['electric'],
      firstChar: 'ピ',
      lastChar: 'ウ',
    },
    {
      name: 'ライチュウ',
      genus: 'ねずみポケモン',
      generation_id: 1,
      pokedex_number: 26,
      types: ['electric'],
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
    expect(element.textContent).toContain('ピカチュウ');
    expect(element.textContent).toContain('ライチュウ');
  });

  it('should emit item:click event when a card is clicked', () => {
    const mockCallback = vi.fn();
    listView.on('item:click', mockCallback);

    listView.update({
      items: samplePokemon,
      disabledItems: [],
    });

    const element = listView.render();
    const firstCard = element.querySelector('.pokemon-card');
    (firstCard as HTMLElement)?.click();

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
    expect(element.textContent).toContain('ピカチュウ');
    expect(element.textContent).not.toContain('ライチュウ');
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

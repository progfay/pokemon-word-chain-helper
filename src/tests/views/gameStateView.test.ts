import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PokemonObject } from '../../types/index.js';
import { createGameStateView } from '../../views/gameStateView.js';

describe('GameStateView', () => {
  let container: HTMLElement;
  let gameStateView: ReturnType<typeof createGameStateView>;

  const samplePokemon: PokemonObject = {
    name: 'ピカチュウ',
    genus: 'ねずみポケモン',
    generation_id: 1,
    pokedex_number: 25,
    types: [4], // electric
    firstChar: 'ピ',
    lastChar: 'ウ',
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    gameStateView = createGameStateView();
    container.appendChild(gameStateView.render());
  });

  it('should render game state elements', () => {
    const element = gameStateView.render();
    expect(element.querySelector('.game-state__status')).toBeTruthy();
    expect(element.querySelector('.game-state__info')).toBeTruthy();
    expect(element.querySelector('.game-state__counter')).toBeTruthy();
    expect(element.querySelector('.game-state__restart')).toBeTruthy();
  });

  it('should update game state information', () => {
    gameStateView.update({
      usedPokemon: [samplePokemon],
      lastUsed: samplePokemon,
      currentChar: 'ウ',
      remainingCount: 150,
      isGameOver: false,
    });

    const element = gameStateView.render();
    const info = element.querySelector('.game-state__info');
    const counter = element.querySelector('.game-state__counter');

    expect(info?.textContent).toContain('ウ'); // Should show current character
    expect(counter?.textContent).toContain('150'); // Should show remaining count
  });

  it('should display used Pokemon', () => {
    gameStateView.update({
      usedPokemon: [samplePokemon],
      lastUsed: samplePokemon,
      currentChar: 'ウ',
      remainingCount: 150,
      isGameOver: false,
    });

    const element = gameStateView.render();
    expect(element.textContent).toContain('ピカチュウ');
  });

  it('should show/hide restart button based on game state', () => {
    const element = gameStateView.render();
    const restartButton = element.querySelector(
      '.game-state__restart',
    ) as HTMLButtonElement;

    gameStateView.update({
      usedPokemon: [samplePokemon],
      lastUsed: samplePokemon,
      currentChar: 'ウ',
      remainingCount: 150,
      isGameOver: false,
    });
    expect(restartButton.style.display).toBe('none');

    gameStateView.update({
      usedPokemon: [samplePokemon],
      lastUsed: samplePokemon,
      currentChar: 'ウ',
      remainingCount: 0,
      isGameOver: true,
    });
    expect(restartButton.style.display).toBe('block');
  });

  it('should emit restart event when restart button is clicked', () => {
    const mockCallback = vi.fn();
    gameStateView.on('game:restart', mockCallback);

    gameStateView.update({
      usedPokemon: [samplePokemon],
      lastUsed: samplePokemon,
      currentChar: 'ウ',
      remainingCount: 0,
      isGameOver: true,
    });

    const element = gameStateView.render();
    const restartButton = element.querySelector(
      '.game-state__restart',
    ) as HTMLButtonElement;
    restartButton.click();

    expect(mockCallback).toHaveBeenCalled();
  });

  it('should update remaining count display', () => {
    const element = gameStateView.render();
    const counter = element.querySelector(
      '.game-state__counter',
    ) as HTMLDivElement;

    gameStateView.update({
      usedPokemon: [],
      remainingCount: 150,
      isGameOver: false,
    });
    expect(counter.textContent).toContain('150');

    gameStateView.update({
      usedPokemon: [samplePokemon],
      remainingCount: 149,
      isGameOver: false,
    });
    expect(counter.textContent).toContain('149');
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { createGameStateView } from '../../views/gameStateView.js';

describe('GameStateView', () => {
  let container: HTMLElement;
  let gameStateView: ReturnType<typeof createGameStateView>;


  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    gameStateView = createGameStateView();
    container.appendChild(gameStateView.render());
  });

  it('should render game state elements', () => {
    const element = gameStateView.render();
    expect(element.querySelector('.game-state__info')).toBeTruthy();
    expect(element.querySelector('.game-state__counter')).toBeTruthy();
  });

  it('should update game state information', () => {
    gameStateView.update({
      remainingCount: 150,
    });

    const element = gameStateView.render();
    const info = element.querySelector('.game-state__info');
    const counter = element.querySelector('.game-state__counter');

    expect(info?.textContent).toContain('好きなポケモンから始められます'); // Should show helper text
    expect(counter?.textContent).toContain('150'); // Should show remaining count
  });

  it('should display remaining count', () => {
    gameStateView.update({
      remainingCount: 150,
    });

    const element = gameStateView.render();
    expect(element.textContent).toContain('150');
  });



  it('should update remaining count display', () => {
    const element = gameStateView.render();
    const counter = element.querySelector(
      '.game-state__counter',
    ) as HTMLDivElement;

    gameStateView.update({
      remainingCount: 150,
    });
    expect(counter.textContent).toContain('150');

    gameStateView.update({
      remainingCount: 149,
    });
    expect(counter.textContent).toContain('149');
  });
});

import type { PokemonObject } from '../types/index.js';
import { createTypedView } from './createTypedView.js';

interface GameStateViewState {
  usedPokemon: PokemonObject[];
  lastUsed?: PokemonObject;
  currentChar?: string;
  remainingCount: number;
  isGameOver: boolean;
}

const createGameStateElement = () => {
  const container = document.createElement('div');
  container.className = 'game-state';

  const status = document.createElement('div');
  status.className = 'game-state__status';

  const info = document.createElement('div');
  info.className = 'game-state__info';

  const counter = document.createElement('div');
  counter.className = 'game-state__counter';

  const restartButton = document.createElement('button');
  restartButton.className = 'game-state__restart';
  restartButton.textContent = 'ゲームをリセット';
  restartButton.style.display = 'none';

  container.appendChild(status);
  container.appendChild(info);
  container.appendChild(counter);
  container.appendChild(restartButton);

  return container;
};

const updateGameStateElement = (
  container: HTMLElement,
  state: Partial<GameStateViewState>,
) => {
  const elements = {
    status: container.querySelector('.game-state__status') as HTMLDivElement,
    info: container.querySelector('.game-state__info') as HTMLDivElement,
    counter: container.querySelector('.game-state__counter') as HTMLDivElement,
    restartButton: container.querySelector(
      '.game-state__restart',
    ) as HTMLButtonElement,
  };

  if (
    !elements.status ||
    !elements.info ||
    !elements.counter ||
    !elements.restartButton
  )
    return;

  if (state.isGameOver !== undefined) {
    elements.restartButton.style.display = state.isGameOver ? 'block' : 'none';
    if (state.isGameOver) {
      elements.status.textContent = 'ゲーム終了！';
    }
  }

  if (state.lastUsed) {
    elements.status.textContent = `最後に使用: ${state.lastUsed.name}`;
  }

  if (state.currentChar !== undefined) {
    elements.info.textContent = state.currentChar
      ? `次の文字は「${state.currentChar}」から始まるポケモン`
      : '好きなポケモンから始められます';
  }

  if (state.remainingCount !== undefined) {
    elements.counter.textContent = `残り ${state.remainingCount} 匹`;
  }
};

export const createGameStateView = () => {
  const view = createTypedView<GameStateViewState>({
    createElement: createGameStateElement,
    updateElement: (state) => {
      const element = view.render();
      updateGameStateElement(element, state);
    },
    setupEventListeners: () => {
      const element = view.render();
      const restartButton = element.querySelector(
        '.game-state__restart',
      ) as HTMLButtonElement;

      if (!restartButton) return;

      const handleRestart = () => {
        view.emit('game:restart');
      };

      restartButton.addEventListener('click', handleRestart);

      return () => {
        restartButton.removeEventListener('click', handleRestart);
      };
    },
  });

  return view;
};

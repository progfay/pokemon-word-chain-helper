import type { PokemonObject } from '../types/index.js';
import { createTypedView } from './createTypedView.js';

interface GameStatusViewState {
  lastUsed?: PokemonObject;
  currentChar?: string;
  remainingCount: number;
  isGameOver: boolean;
}

const createGameStatusElement = () => {
  const container = document.createElement('div');
  container.className = 'game-status';

  const status = document.createElement('div');
  status.className = 'game-status__status';

  const info = document.createElement('div');
  info.className = 'game-status__info';

  const counter = document.createElement('div');
  counter.className = 'game-status__counter';

  const restartButton = document.createElement('button');
  restartButton.className = 'game-status__restart';
  restartButton.textContent = 'ゲームをリセット';
  restartButton.style.display = 'none';

  container.appendChild(status);
  container.appendChild(info);
  container.appendChild(counter);
  container.appendChild(restartButton);

  return container;
};

const updateGameStatusElement = (
  container: HTMLElement,
  state: Partial<GameStatusViewState>,
) => {
  const elements = {
    status: container.querySelector('.game-status__status') as HTMLDivElement,
    info: container.querySelector('.game-status__info') as HTMLDivElement,
    counter: container.querySelector('.game-status__counter') as HTMLDivElement,
    restartButton: container.querySelector(
      '.game-status__restart',
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

export const createGameStatusView = () => {
  const view = createTypedView<GameStatusViewState>({
    createElement: createGameStatusElement,
    updateElement: (state) => {
      const element = view.render();
      updateGameStatusElement(element, state);
    },
    setupEventListeners: () => {
      const element = view.render();
      const restartButton = element.querySelector(
        '.game-status__restart',
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

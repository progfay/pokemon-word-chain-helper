import { createTypedView } from './createTypedView.js';

interface GameStateViewState {
  remainingCount: number;
}

const createGameStateElement = () => {
  const container = document.createElement('div');
  container.className = 'game-state';

  const info = document.createElement('div');
  info.className = 'game-state__info';
  info.textContent = '好きなポケモンから始められます';

  const counter = document.createElement('div');
  counter.className = 'game-state__counter';

  container.appendChild(info);
  container.appendChild(counter);

  return container;
};

const updateGameStateElement = (
  container: HTMLElement,
  state: Partial<GameStateViewState>,
) => {
  const counter = container.querySelector(
    '.game-state__counter',
  ) as HTMLDivElement;

  if (!counter) return;

  if (state.remainingCount !== undefined) {
    counter.textContent = `残り ${state.remainingCount} 匹`;
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
      // No event listeners needed for this simplified view
      return () => {};
    },
  });

  return view;
};

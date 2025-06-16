import { createEventEmitter } from '../utils/eventEmitter.js';

export type ViewOptions = {
  createElement: () => HTMLElement;
  updateElement: (data: unknown) => void;
  setupEventListeners?: () => void;
  cleanupEventListeners?: () => void;
};

/**
 * Create a base view with common functionality
 */
export const createView = ({
  createElement,
  updateElement,
  setupEventListeners = () => {},
  cleanupEventListeners = () => {},
}: ViewOptions) => {
  const eventEmitter = createEventEmitter();
  let element: HTMLElement | null = null;
  let isDestroyed = false;

  return {
    ...eventEmitter,

    render(): HTMLElement {
      if (isDestroyed) {
        throw new Error('Cannot render destroyed view');
      }

      if (!element) {
        element = createElement();
        setupEventListeners();
        eventEmitter.emit('view:mounted', element);
      }

      return element;
    },

    update(data: unknown): void {
      if (isDestroyed) {
        throw new Error('Cannot update destroyed view');
      }

      if (element) {
        updateElement(data);
        eventEmitter.emit('view:updated', data);
      }
    },

    destroy(): void {
      if (isDestroyed) return;

      cleanupEventListeners();
      element?.remove();
      element = null;
      isDestroyed = true;
      eventEmitter.removeAllListeners();
      eventEmitter.emit('view:destroyed', undefined);
    },
  };
};

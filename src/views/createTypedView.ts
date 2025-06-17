import type { View } from '../types/mvc.js';
import { createEventEmitter } from '../utils/eventEmitter.js';
import type { EventMap } from '../utils/eventEmitter.js';

interface TypedViewOptions<T> {
  createElement: () => HTMLElement;
  updateElement: (data: Partial<T>) => void;
  setupEventListeners?: () => (() => void) | undefined;
  cleanupEventListeners?: () => void;
}

interface TypedViewEvents<T> extends EventMap {
  'view:mounted': [HTMLElement];
  'view:updated': [Partial<T>];
  'view:destroyed': [];
}

export interface TypedView<T> extends View {
  on<K extends string>(event: K, callback: (...args: unknown[]) => void): void;
  off<K extends string>(event: K, callback: (...args: unknown[]) => void): void;
  emit<K extends string>(event: K, ...args: unknown[]): void;
  render(): HTMLElement;
  update(data: Partial<T>): void;
  destroy(): void;
}

/**
 * Creates a view with typed state updates and event emission
 */
export const createTypedView = <T>(
  options: TypedViewOptions<T>,
): TypedView<T> => {
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
        element = options.createElement();
        options.setupEventListeners?.();
        eventEmitter.emit('view:mounted', element);
      }

      return element;
    },

    update(data: Partial<T>): void {
      if (isDestroyed) {
        throw new Error('Cannot update destroyed view');
      }

      // Ensure element exists before updating
      if (!element) {
        this.render();
      }

      options.updateElement(data);
      eventEmitter.emit('view:updated', data);
    },

    destroy(): void {
      if (isDestroyed) return;

      options.cleanupEventListeners?.();
      element?.remove();
      element = null;
      isDestroyed = true;
      eventEmitter.emit('view:destroyed');
    },
  };
};
